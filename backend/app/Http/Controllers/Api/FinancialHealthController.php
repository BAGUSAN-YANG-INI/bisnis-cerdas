<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DashboardRequest;
use App\Services\FinancialHealthService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class FinancialHealthController extends Controller
{
    /**
     * GET /api/financial-health
     *
     * Returns the full 3-component Financial Health Score (0–100),
     * per-component details, and rule-based business insights.
     *
     * Query parameters:
     *   from (string, Y-m-d, optional) – default: 30 days ago
     *   to   (string, Y-m-d, optional) – default: today
     */
    public function index(DashboardRequest $request): JsonResponse
    {
        $to   = Carbon::parse($request->query('to',   now()->toDateString()));
        $from = Carbon::parse($request->query('from', now()->subDays(30)->toDateString()));

        // Safety: ensure from <= to
        if ($from->gt($to)) {
            [$from, $to] = [$to, $from];
        }

        $service = new FinancialHealthService($request->user());
        $data    = $service->calculate($from, $to);

        $message = $data['status'] === 'available'
            ? 'Analisis kesehatan keuangan berhasil dihitung.'
            : 'Data belum mencukupi untuk menghitung skor kesehatan keuangan.';

        return $this->success($data, $message);
    }
}

