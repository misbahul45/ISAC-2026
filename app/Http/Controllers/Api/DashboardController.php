<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardSummaryResource;
use App\Models\Exam;
use App\Models\Stage;
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

    public function exam(Request $request, Exam $exam): JsonResponse
    {
        /** @var Team $team */
        $team = $request->user();

        return $this->success(
            'Metadata ujian berhasil diambil.',
            $this->dashboardService->getExamShell($team, $exam),
        );
    }

    public function stage(Request $request, Stage $stage): JsonResponse
    {
        /** @var Team $team */
        $team = $request->user();

        return $this->success(
            'Metadata tahap pengumpulan berhasil diambil.',
            $this->dashboardService->getSubmissionShell($team, $stage),
        );
    }

    private function success(string $message, mixed $data): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
