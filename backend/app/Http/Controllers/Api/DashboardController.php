<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DashboardRequest;
use App\Services\CashCalculationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard
     *
     * Returns a full cash-flow summary and aggregates for the requested period.
     * Default period: last 30 days (from = today - 30, to = today).
     */
    public function index(DashboardRequest $request): JsonResponse
    {
        $to   = Carbon::parse($request->query('to',   now()->toDateString()));
        $from = Carbon::parse($request->query('from', now()->subDays(30)->toDateString()));

        // Safety: ensure from <= to
        if ($from->gt($to)) {
            [$from, $to] = [$to, $from];
        }

        $service = new CashCalculationService($request->user());
        $data    = $service->getDashboardData($from, $to);

        return $this->success($data, 'Ringkasan dashboard berhasil dimuat.');
    }
}

