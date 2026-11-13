<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CashCalculationService
{
    private User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC ENTRY POINT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build the full dashboard data payload for the given period.
     *
     * @param  Carbon  $from  Start of period (inclusive)
     * @param  Carbon  $to    End of period (inclusive)
     * @return array<string, mixed>
     */
    public function getDashboardData(Carbon $from, Carbon $to): array
    {
        $days = max(1, $from->diffInDays($to) + 1);  // at least 1 day

        // ── Period aggregates ───────────────────────────────────────────────
        $period = $this->aggregatePeriod($from, $to);

        // ── All-time available cash ─────────────────────────────────────────
        $availableCash = $this->computeAvailableCash();

        // ── Derived metrics ─────────────────────────────────────────────────
        $avgDailyExpense = (int) round($period['total_expense'] / $days);
        $netCashFlow     = $period['total_income'] - $period['total_expense'];

        // ── Daily trend for chart ───────────────────────────────────────────
        $chartDailyTrend = $this->buildDailyTrend($from, $to);

        // ── Stubs: health_score & runway (filled by later services) ─────────
        $healthScoreSummary = $this->buildHealthScoreStub($availableCash, $period, $days);
        $runwaySummary      = $this->buildRunwayStub($availableCash, $period, $days);

        return [
            'period' => [
                'from' => $from->toDateString(),
                'to'   => $to->toDateString(),
                'days' => $days,
            ],
            'summary' => [
                'available_cash'          => $availableCash,
                'total_income'            => $period['total_income'],
                'total_expense'           => $period['total_expense'],
                'operating_expense'       => $period['operating_expense'],
                'non_operating_expense'   => $period['non_operating_expense'],
                'net_cash_flow'           => $netCashFlow,
                'average_daily_expense'   => $avgDailyExpense,
            ],
            'health_score_summary' => $healthScoreSummary,
            'runway_summary'       => $runwaySummary,
            'chart_daily_trend'    => $chartDailyTrend,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AVAILABLE CASH  (cumulative, all-time)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * available_cash = opening_balance
     *                + SUM(all income ever)
     *                - SUM(all expense ever)
     */
    public function computeAvailableCash(): int
    {
        $openingBalance = (int) optional($this->user->businessProfile)->opening_balance;

        $totals = $this->user
            ->transactions()
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
            ")
            ->first();

        return $openingBalance
            + (int) ($totals->total_income ?? 0)
            - (int) ($totals->total_expense ?? 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PERIOD AGGREGATES
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns aggregated totals for the given date range.
     *
     * @return array{
     *   total_income: int,
     *   total_expense: int,
     *   operating_expense: int,
     *   non_operating_expense: int,
     * }
     */
    public function aggregatePeriod(Carbon $from, Carbon $to): array
    {
        $row = $this->user
            ->transactions()
            ->whereBetween('transaction_date', [$from->toDateString(), $to->toDateString()])
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)                                     AS total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)                                     AS total_expense,
                COALESCE(SUM(CASE WHEN type = 'expense' AND is_operational = 1 THEN amount ELSE 0 END), 0)              AS operating_expense,
                COALESCE(SUM(CASE WHEN type = 'expense' AND is_operational = 0 THEN amount ELSE 0 END), 0)              AS non_operating_expense
            ")
            ->first();

        return [
            'total_income'          => (int) ($row->total_income          ?? 0),
            'total_expense'         => (int) ($row->total_expense         ?? 0),
            'operating_expense'     => (int) ($row->operating_expense     ?? 0),
            'non_operating_expense' => (int) ($row->non_operating_expense ?? 0),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DAILY TREND (for chart)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build an array of { date, income, expense, net } for every calendar day
     * in the period. Days with no transactions still appear with zeros.
     *
     * @return list<array{date: string, income: int, expense: int, net: int}>
     */
    private function buildDailyTrend(Carbon $from, Carbon $to): array
    {
        // Fetch per-day aggregates from DB in one query
        $rows = $this->user
            ->transactions()
            ->whereBetween('transaction_date', [$from->toDateString(), $to->toDateString()])
            ->selectRaw("
                transaction_date,
                COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS daily_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS daily_expense
            ")
            ->groupBy('transaction_date')
            ->orderBy('transaction_date')
            ->get()
            ->keyBy(fn ($row) => Carbon::parse($row->transaction_date)->toDateString());

        // Walk every day in the range (zero-fill gaps)
        $trend   = [];
        $current = $from->copy();

        while ($current->lte($to)) {
            $dateKey = $current->toDateString();
            $income  = (int) ($rows[$dateKey]->daily_income  ?? 0);
            $expense = (int) ($rows[$dateKey]->daily_expense ?? 0);

            $trend[] = [
                'date'    => $dateKey,
                'income'  => $income,
                'expense' => $expense,
                'net'     => $income - $expense,
            ];

            $current->addDay();
        }

        return $trend;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STUB BUILDERS  (replaced by real engines in later modules)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lightweight health-score stub so the dashboard returns a valid response
     * before the full FinancialHealthService is wired in.
     */
    private function buildHealthScoreStub(int $availableCash, array $period, int $days): array
    {
        $hasData = $period['total_income'] > 0 && $period['operating_expense'] > 0;

        if (! $hasData) {
            return [
                'score'         => null,
                'label'         => 'insufficient_data',
                'label_display' => 'Data Belum Cukup',
                'status'        => 'insufficient_data',
            ];
        }

        // Quick rough score (3 metrics, each 0-100, equal weight of ~33%)
        $monthlyOpEx        = $period['operating_expense'] / max(1, $days) * 30;
        $cashCoverageMonths = $monthlyOpEx > 0 ? $availableCash / $monthlyOpEx : 0;
        $cashScore          = min(100, (int) round($cashCoverageMonths / 3 * 100));

        $oer         = $period['total_income'] > 0 ? $period['operating_expense'] / $period['total_income'] : 1;
        $oerScore    = max(0, (int) round((1 - $oer) * 100));

        $netMargin      = $period['total_income'] > 0 ? ($period['total_income'] - $period['total_expense']) / $period['total_income'] : 0;
        $marginScore    = $netMargin >= 0 ? min(100, (int) round($netMargin * 100)) : 0;

        $compositeScore = (int) round(($cashScore * 0.35) + ($oerScore * 0.35) + ($marginScore * 0.30));

        $label = match (true) {
            $compositeScore >= 80 => 'excellent',
            $compositeScore >= 60 => 'good',
            $compositeScore >= 40 => 'fair',
            $compositeScore >= 20 => 'poor',
            default               => 'critical',
        };

        $labelDisplay = match ($label) {
            'excellent' => 'Sangat Sehat',
            'good'      => 'Sehat',
            'fair'      => 'Cukup Sehat',
            'poor'      => 'Kurang Sehat',
            'critical'  => 'Kritis',
            default     => 'Data Belum Cukup',
        };

        return [
            'score'         => $compositeScore,
            'label'         => $label,
            'label_display' => $labelDisplay,
            'status'        => 'available',
        ];
    }

    /**
     * Lightweight runway stub so the dashboard returns a valid response
     * before the full RunwayService is wired in.
     */
    private function buildRunwayStub(int $availableCash, array $period, int $days): array
    {
        $netCashFlow = $period['total_income'] - $period['total_expense'];

        // Daily net burn = (expense - income) / days; positive means burning cash
        $avgDailyIncome  = (int) round($period['total_income']  / $days);
        $avgDailyExpense = (int) round($period['total_expense']  / $days);
        $dailyNetBurn    = $avgDailyExpense - $avgDailyIncome;   // positive = burning

        if ($netCashFlow >= 0) {
            // Cash is growing or flat
            $status = $netCashFlow === 0 ? 'break_even' : 'positive_cash_flow';
            return [
                'daily_net_burn' => -$dailyNetBurn,   // negative = not burning
                'runway_days'    => null,
                'status'         => $status,
                'message'        => 'Arus kas bersih positif. Bisnis tidak mengalami pembakaran kas (net burn).',
            ];
        }

        if ($availableCash <= 0) {
            return [
                'daily_net_burn' => $dailyNetBurn,
                'runway_days'    => null,
                'status'         => 'insufficient_cash',
                'message'        => 'Kas tersedia sudah habis atau negatif.',
            ];
        }

        $runwayDays = $dailyNetBurn > 0 ? (int) round($availableCash / $dailyNetBurn) : null;

        return [
            'daily_net_burn' => $dailyNetBurn,
            'runway_days'    => $runwayDays,
            'status'         => 'net_burn',
            'message'        => "Dengan rata-rata pembakaran kas Rp" . number_format($dailyNetBurn, 0, ',', '.') . "/hari, kas diperkirakan bertahan {$runwayDays} hari ke depan.",
        ];
    }
}

