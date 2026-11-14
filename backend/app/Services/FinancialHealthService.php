<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

/**
 * FinancialHealthService
 *
 * Implements the 3-component composite scoring model from the
 * Panduan Logika Matematika (Math Guide).
 *
 * Components & weights:
 *   A. Cash Coverage Ratio     → weight 35%
 *   B. Operating Expense Ratio → weight 35%
 *   C. Net Cash Flow Margin    → weight 30%
 *
 * Score label bands:
 *   80–100 → healthy   / Sehat
 *   60–79  → fair      / Cukup Sehat
 *   40–59  → attention / Perlu Perhatian
 *   0–39   → at_risk   / Berisiko
 */
class FinancialHealthService
{
    private User                   $user;
    private CashCalculationService $cashService;

    public function __construct(User $user)
    {
        $this->user        = $user;
        $this->cashService = new CashCalculationService($user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC ENTRY POINT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Calculate the full financial health report for the given period.
     *
     * @return array<string, mixed>
     */
    public function calculate(Carbon $from, Carbon $to): array
    {
        $days = max(1, $from->diffInDays($to) + 1);

        $period        = $this->cashService->aggregatePeriod($from, $to);
        $availableCash = $this->cashService->computeAvailableCash();

        // ── Guard: cannot calculate if no income or no operating expense ─────
        $hasIncome   = $period['total_income'] > 0;
        $hasOpEx     = $period['operating_expense'] > 0;

        if (! $hasIncome || ! $hasOpEx) {
            $components = $this->buildInsufficientComponents($hasIncome, $hasOpEx);
            $insights   = BusinessInsightService::forInsufficientData();

            return [
                'period'              => $this->buildPeriod($from, $to, $days),
                'status'              => 'insufficient_data',
                'score'               => null,
                'label'               => 'insufficient_data',
                'label_display'       => 'Data Belum Cukup',
                'summary_explanation' => 'Skor belum tersedia. Silakan lengkapi catatan pemasukan dan pengeluaran operasional Anda.',
                'components'          => $components,
                'insights'            => $insights,
            ];
        }

        // ── Component A: Cash Coverage ───────────────────────────────────────
        $avgMonthlyOpEx      = ($period['operating_expense'] / $days) * 30;
        $cashCoverageMonths  = $availableCash / $avgMonthlyOpEx;
        $cashScore           = $this->scoreCashCoverage($cashCoverageMonths);

        // ── Component B: Operating Expense Ratio ─────────────────────────────
        $oer       = ($period['operating_expense'] / $period['total_income']) * 100;
        $oerScore  = $this->scoreOer($oer);

        // ── Component C: Net Cash Flow Margin ────────────────────────────────
        $netMargin      = (($period['total_income'] - $period['total_expense']) / $period['total_income']) * 100;
        $marginScore    = $this->scoreNetMargin($netMargin);

        // ── Composite ────────────────────────────────────────────────────────
        $compositeScore = (int) round(0.35 * $cashScore + 0.35 * $oerScore + 0.30 * $marginScore);

        [$label, $labelDisplay] = $this->resolveLabel($compositeScore);

        // ── Insights ─────────────────────────────────────────────────────────
        $insights = BusinessInsightService::generate(
            cashCoverageMonths: $cashCoverageMonths,
            oer:                $oer,
            netMargin:          $netMargin,
            netCashFlow:        $period['total_income'] - $period['total_expense'],
            availableCash:      $availableCash,
        );

        return [
            'period'              => $this->buildPeriod($from, $to, $days),
            'status'              => 'available',
            'score'               => $compositeScore,
            'label'               => $label,
            'label_display'       => $labelDisplay,
            'summary_explanation' => $this->buildExplanation($label, $cashCoverageMonths, $netMargin),
            'components'          => [
                'cash_coverage' => [
                    'status'      => 'available',
                    'value_months'=> round($cashCoverageMonths, 2),
                    'score'       => $cashScore,
                    'weight'      => '35%',
                    'explanation' => "Kas tersedia mencukupi " . round($cashCoverageMonths, 2) . " bulan biaya operasional.",
                ],
                'operating_expense_ratio' => [
                    'status'        => 'available',
                    'value_percent' => round($oer, 2),
                    'score'         => $oerScore,
                    'weight'        => '35%',
                    'explanation'   => round($oer, 1) . "% dari pendapatan digunakan untuk biaya operasional.",
                ],
                'net_cash_flow_margin' => [
                    'status'        => 'available',
                    'value_percent' => round($netMargin, 2),
                    'score'         => $marginScore,
                    'weight'        => '30%',
                    'explanation'   => "Margin arus kas bersih berada di angka " . round($netMargin, 1) . "%.",
                ],
            ],
            'insights' => $insights,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCORING FUNCTIONS  (exact bands from Math Guide)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Score Cash Coverage Ratio.
     *
     * Months  | Score
     * ≥ 3     | 100
     * 2–<3    |  85
     * 1–<2    |  70
     * 0.5–<1  |  40
     * < 0.5   |  20
     */
    public function scoreCashCoverage(float $months): int
    {
        return match (true) {
            $months >= 3   => 100,
            $months >= 2   =>  85,
            $months >= 1   =>  70,
            $months >= 0.5 =>  40,
            default        =>  20,
        };
    }

    /**
     * Score Operating Expense Ratio (OER).
     *
     * OER %      | Score
     * ≤ 30       | 100
     * >30–50     |  85
     * >50–70     |  70
     * >70–90     |  40
     * > 90       |  20
     */
    public function scoreOer(float $oer): int
    {
        return match (true) {
            $oer <= 30 => 100,
            $oer <= 50 =>  85,
            $oer <= 70 =>  70,
            $oer <= 90 =>  40,
            default    =>  20,
        };
    }

    /**
     * Score Net Cash Flow Margin.
     *
     * Margin %   | Score
     * ≥ 20       | 100
     * 10–<20     |  85
     * 0–<10      |  70
     * -10–<0     |  40
     * < -10      |  20
     */
    public function scoreNetMargin(float $margin): int
    {
        return match (true) {
            $margin >= 20  => 100,
            $margin >= 10  =>  85,
            $margin >= 0   =>  70,
            $margin >= -10 =>  40,
            default        =>  20,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Map composite score to label slug and Bahasa Indonesia display text.
     *
     * @return array{string, string}
     */
    private function resolveLabel(int $score): array
    {
        return match (true) {
            $score >= 80 => ['healthy',   'Sehat'],
            $score >= 60 => ['fair',      'Cukup Sehat'],
            $score >= 40 => ['attention', 'Perlu Perhatian'],
            default      => ['at_risk',   'Berisiko'],
        };
    }

    private function buildPeriod(Carbon $from, Carbon $to, int $days): array
    {
        return [
            'from' => $from->toDateString(),
            'to'   => $to->toDateString(),
            'days' => $days,
        ];
    }

    /**
     * Build the per-component array when data is insufficient.
     */
    private function buildInsufficientComponents(bool $hasIncome, bool $hasOpEx): array
    {
        $noIncomeMsg = 'Pemasukan masih 0; rasio tidak dapat dibagi dengan nol.';
        $noOpExMsg   = 'Biaya operasional masih 0 atau data transaksi belum cukup.';

        return [
            'cash_coverage' => [
                'status'       => 'insufficient_data',
                'value_months' => null,
                'score'        => null,
                'weight'       => '35%',
                'explanation'  => $hasOpEx ? 'Kas tersedia tetapi biaya operasional nol.' : $noOpExMsg,
            ],
            'operating_expense_ratio' => [
                'status'        => 'insufficient_data',
                'value_percent' => null,
                'score'         => null,
                'weight'        => '35%',
                'explanation'   => $hasIncome ? $noOpExMsg : $noIncomeMsg,
            ],
            'net_cash_flow_margin' => [
                'status'        => 'insufficient_data',
                'value_percent' => null,
                'score'         => null,
                'weight'        => '30%',
                'explanation'   => $noIncomeMsg,
            ],
        ];
    }

    private function buildExplanation(string $label, float $cashMonths, float $netMargin): string
    {
        return match ($label) {
            'healthy'   => 'Kondisi keuangan sangat baik. Kas tercukupi dan arus kas berjalan positif.',
            'fair'      => 'Kondisi cukup sehat, namun ada satu atau lebih indikator yang perlu dijaga.',
            'attention' => 'Beberapa indikator membutuhkan perhatian segera, terutama manajemen biaya operasional.',
            'at_risk'   => 'Kondisi keuangan berisiko tinggi. Segera tinjau pengeluaran dan sumber pemasukan.',
            default     => 'Analisis tidak tersedia.',
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONVENIENCE: summary-only (for dashboard stub replacement)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns only the health_score_summary sub-array (used by Dashboard).
     */
    public function summary(Carbon $from, Carbon $to): array
    {
        $full = $this->calculate($from, $to);

        return [
            'score'         => $full['score'],
            'label'         => $full['label'],
            'label_display' => $full['label_display'],
            'status'        => $full['status'],
        ];
    }
}

