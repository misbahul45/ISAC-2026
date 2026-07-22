<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardSummaryResource;
use App\Models\Team;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function summary(Request $request): JsonResponse
    {
        /** @var Team $team */
        $team = $request->user();

        return response()->json([
            'status' => 'success',
            'message' => 'Ringkasan dashboard berhasil diambil.',
            'data' => new DashboardSummaryResource($this->dashboardService->getSummary($team)),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
