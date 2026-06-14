<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardSummaryResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {
        //
    }

    public function summary(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard summary retrieved successfully.',
            'data' => new DashboardSummaryResource($this->dashboardService->getSummary()),
        ]);
    }
}
