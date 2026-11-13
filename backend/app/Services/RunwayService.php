<?php

namespace App\Services;

use App\Models\User;

/**
 * RunwayService
 *
 * Implements two modes — both are pure in-memory calculations
 * and NEVER read from or write to the transactions table for simulation:
 *
 *  1. simulate()  → "What-If" scenario with user-supplied daily assumptions.
 *  2. historical() → Historical runway derived from actual period averages.
 *                    Used to populate dashboard runway_summary.
 */
class RunwayService
{
    private User                   $user;
    private CashCalculationService $cashService;

    public function __construct(User $user)
    {
        $this->user        = $user;
        $this->cashService = new CashCalculationService($user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. WHAT-IF SIMULATION  (POST /api/runway/simulate)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Run a "what-if" runway simulation using caller-supplied daily assumptions.
     * No database writes. No transaction records are touched.
     *
     * @param  int  $dailyIncome   Assumed daily income (IDR)
     * @param  int  $dailyExpense  Assumed daily expense (IDR)
     * @param  int  $simDays       Number of days to project forward
     * @return array<string, mixed>
     */
    public function simulate(int $dailyIncome, int $dailyExpense, int $simDays): array
    {
        $availableCash = $this->cashService->computeAvailableCash();

        // Core formula
        $netBurn                 = $dailyExpense - $dailyIncome;        // positive = burning cash
        $projectedCashAfterPeriod = $availableCash + ($dailyIncome - $dailyExpense) * $simDays;

        [$status, $runwayDays, $message] = $this->resolveStatus(
            $availableCash,
            $netBurn,
            context: 'simulate'
        );

        return [
            'available_cash'             => $availableCash,
            'assumptions'                => [
                'daily_income'    => $dailyIncome,
                'daily_expense'   => $dailyExpense,
                'simulation_days' => $simDays,
            ],
            'simulated_daily_net_burn'   => $netBurn,
            'simulated_runway_days'      => $runwayDays,
            'projected_cash_after_period'=> $projectedCashAfterPeriod,
            'status'                     => $status,
            'message'                    => $message,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. HISTORICAL RUNWAY  (used by Dashboard runway_summary)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Derive runway from historical period averages.
     * Used to populate the dashboard `runway_summary` field.
     *
     * @param  array{total_income:int, total_expense:int}  $period  Period aggregates
     * @param  int                                          $days    Number of days in period
     * @return array<string, mixed>
     */
    public function historical(array $period, int $days): array
    {
        $availableCash = $this->cashService->computeAvailableCash();

        // Historical averages derived from actual transactions
        $avgDailyIncome  = (int) round($period['total_income']  / $days);
        $avgDailyExpense = (int) round($period['total_expense'] / $days);
        $netBurn         = $avgDailyExpense - $avgDailyIncome;

        [$status, $runwayDays, $message] = $this->resolveStatus(
            $availableCash,
            $netBurn,
            context: 'historical'
        );

        return [
            'daily_net_burn' => $netBurn,
            'runway_days'    => $runwayDays,
            'status'         => $status,
            'message'        => $message,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHARED STATUS RESOLUTION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Determine runway status, days-left, and human-readable message.
     *
     * Status enum:
     *   insufficient_cash  → available_cash <= 0
     *   net_burn           → burning cash daily (expense > income)
     *   break_even         → income == expense
     *   positive_cash_flow → income > expense (cash accumulating)
     *
     * @return array{string, int|null, string}  [status, runway_days, message]
     */
    private function resolveStatus(int $availableCash, int $netBurn, string $context): array
    {
        // Guard: already out of cash
        if ($availableCash <= 0) {
            return [
                'insufficient_cash',
                null,
                'Kas tersedia sudah habis atau negatif. Segera cari sumber dana tambahan.',
            ];
        }

        // Burning cash: expense > income
        if ($netBurn > 0) {
            $runwayDays = (int) floor($availableCash / $netBurn);
            $burnFmt    = number_format($netBurn, 0, ',', '.');

            $msg = $context === 'simulate'
                ? "Dengan estimasi pembakaran kas Rp{$burnFmt}/hari, kas Anda diproyeksikan bertahan selama {$runwayDays} hari ke depan."
                : "Berdasarkan rata-rata historis, kas diperkirakan bertahan selama {$runwayDays} hari ke depan.";

            return ['net_burn', $runwayDays, $msg];
        }

        // Break-even: income == expense
        if ($netBurn === 0) {
            return [
                'break_even',
                null,
                'Pemasukan dan pengeluaran seimbang. Kas stabil, tidak bertambah maupun berkurang.',
            ];
        }

        // Positive: income > expense (net_burn < 0)
        return [
            'positive_cash_flow',
            null,
            'Arus kas bersih positif. Bisnis tidak mengalami pembakaran kas (net burn).',
        ];
    }
}

