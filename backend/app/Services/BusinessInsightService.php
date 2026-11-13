<?php

namespace App\Services;

/**
 * BusinessInsightService
 *
 * Pure static rule-engine: given computed metric values,
 * returns an array of contextual insight objects.
 *
 * Each insight has:
 *   type    → 'positive' | 'warning' | 'danger' | 'info'
 *   code    → machine-readable constant (e.g. LOW_CASH_COVERAGE)
 *   message → human-readable Bahasa Indonesia string
 */
class BusinessInsightService
{
    // ─────────────────────────────────────────────────────────────────────────
    // ENTRY POINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate contextual insights from computed financial metrics.
     *
     * @param  float  $cashCoverageMonths  Months of operating expense cash can cover
     * @param  float  $oer                Operating Expense Ratio in %
     * @param  float  $netMargin          Net Cash Flow Margin in %
     * @param  int    $netCashFlow        Absolute net cash flow (income - expense)
     * @param  int    $availableCash      Current total available cash
     * @return list<array{type: string, code: string, message: string}>
     */
    public static function generate(
        float $cashCoverageMonths,
        float $oer,
        float $netMargin,
        int   $netCashFlow,
        int   $availableCash
    ): array {
        $insights = [];

        // ── 1. Cash Coverage insights ─────────────────────────────────────
        if ($cashCoverageMonths >= 3) {
            $insights[] = self::insight(
                'positive',
                'EXCELLENT_CASH_COVERAGE',
                'Cadangan kas sangat kuat, mencukupi lebih dari 3 bulan biaya operasional.'
            );
        } elseif ($cashCoverageMonths >= 1) {
            $insights[] = self::insight(
                'info',
                'MODERATE_CASH_COVERAGE',
                'Cadangan kas mencukupi ' . round($cashCoverageMonths, 1) . ' bulan. Pertahankan dan tingkatkan menuju target 3 bulan.'
            );
        } elseif ($cashCoverageMonths >= 0.5) {
            $insights[] = self::insight(
                'warning',
                'LOW_CASH_COVERAGE',
                'Kas belum setara satu bulan biaya operasional. Perhatikan kebutuhan kas jangka dekat.'
            );
        } else {
            $insights[] = self::insight(
                'danger',
                'CRITICAL_CASH_COVERAGE',
                'Cadangan kas sangat rendah (< 2 minggu operasional). Prioritaskan menambah kas segera.'
            );
        }

        // ── 2. OER insights ───────────────────────────────────────────────
        if ($oer <= 30) {
            $insights[] = self::insight(
                'positive',
                'EXCELLENT_OER',
                'Efisiensi biaya operasional sangat baik. Hanya ' . round($oer, 1) . '% pemasukan yang digunakan untuk operasional.'
            );
        } elseif ($oer <= 50) {
            $insights[] = self::insight(
                'positive',
                'GOOD_OER',
                'Rasio biaya operasional terjaga di angka ' . round($oer, 1) . '%. Terus pertahankan.'
            );
        } elseif ($oer <= 70) {
            $insights[] = self::insight(
                'info',
                'MODERATE_OER',
                round($oer, 1) . '% pemasukan terserap ke biaya operasional. Coba identifikasi penghematan biaya terbesar.'
            );
        } elseif ($oer <= 90) {
            $insights[] = self::insight(
                'warning',
                'HIGH_OER',
                'Biaya operasional memakan ' . round($oer, 1) . '% pemasukan. Tinjau komponen biaya yang paling besar.'
            );
        } else {
            $insights[] = self::insight(
                'danger',
                'CRITICAL_OER',
                'Biaya operasional melebihi ' . round($oer, 1) . '% pemasukan. Bisnis berisiko mengalami kerugian operasional.'
            );
        }

        // ── 3. Net Cash Flow / Margin insights ───────────────────────────
        if ($netMargin >= 20) {
            $insights[] = self::insight(
                'positive',
                'HEALTHY_CASH_FLOW',
                'Arus kas bersih sangat sehat dengan margin ' . round($netMargin, 1) . '%. Surplus kas bisa digunakan untuk investasi atau cadangan.'
            );
        } elseif ($netMargin >= 10) {
            $insights[] = self::insight(
                'positive',
                'POSITIVE_CASH_FLOW',
                'Arus kas bersih positif dengan margin ' . round($netMargin, 1) . '%. Terus tingkatkan efisiensi untuk memperlebar margin.'
            );
        } elseif ($netMargin >= 0) {
            $insights[] = self::insight(
                'info',
                'THIN_MARGIN',
                'Arus kas positif namun margin tipis di angka ' . round($netMargin, 1) . '%. Fokus pada peningkatan pemasukan atau pemotongan biaya non-operasional.'
            );
        } elseif ($netMargin >= -10) {
            $insights[] = self::insight(
                'warning',
                'NEGATIVE_CASH_FLOW',
                'Pengeluaran melebihi pemasukan. Arus kas negatif di periode ini sebesar ' . number_format(abs($netCashFlow), 0, ',', '.') . ' Rupiah.'
            );
        } else {
            $insights[] = self::insight(
                'danger',
                'SEVERE_NEGATIVE_CASH_FLOW',
                'Arus kas sangat negatif (margin ' . round($netMargin, 1) . '%). Bisnis membutuhkan penanganan segera untuk mencegah kehabisan kas.'
            );
        }

        // ── 4. Available Cash sanity check ────────────────────────────────
        if ($availableCash <= 0) {
            $insights[] = self::insight(
                'danger',
                'ZERO_OR_NEGATIVE_CASH',
                'Kas tersedia sudah nol atau negatif. Segera cari sumber dana tambahan atau hentikan pengeluaran non-esensial.'
            );
        }

        return $insights;
    }

    /**
     * Return minimal insights for the "insufficient data" state.
     *
     * @return list<array{type: string, code: string, message: string}>
     */
    public static function forInsufficientData(): array
    {
        return [
            self::insight(
                'info',
                'NEED_MORE_DATA',
                'Catat minimal 1 pemasukan dan 1 pengeluaran operasional untuk melihat skor kesehatan keuangan usaha Anda.'
            ),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPER
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @return array{type: string, code: string, message: string}
     */
    private static function insight(string $type, string $code, string $message): array
    {
        return compact('type', 'code', 'message');
    }
}

