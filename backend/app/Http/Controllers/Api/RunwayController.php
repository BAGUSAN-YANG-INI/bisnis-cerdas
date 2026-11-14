<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RunwaySimulationRequest;
use App\Services\RunwayService;
use Illuminate\Http\JsonResponse;

class RunwayController extends Controller
{
    /**
     * POST /api/runway/simulate
     *
     * Run a "what-if" cash runway simulation.
     * The simulation is PURELY in-memory — it does NOT create, update,
     * or delete any transaction records in the database.
     *
     * Request body:
     *   daily_income_assumption  (int, min:0)   – assumed income per day (IDR)
     *   daily_expense_assumption (int, min:0)   – assumed expense per day (IDR)
     *   simulation_days          (int, 1–365)   – number of days to project
     */
    public function simulate(RunwaySimulationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $service = new RunwayService($request->user());

        $result = $service->simulate(
            dailyIncome:   $validated['daily_income_assumption'],
            dailyExpense:  $validated['daily_expense_assumption'],
            simDays:       $validated['simulation_days'],
        );

        return $this->success($result, 'Simulasi runway berhasil dihitung.');
    }
}

