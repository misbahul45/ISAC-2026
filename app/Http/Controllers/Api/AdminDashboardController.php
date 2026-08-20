<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AdminAuditLog;
use App\Models\Registration;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $admin = $request->user();

        abort_unless(
            $admin instanceof Admin && in_array($admin->role, ['super_admin', 'admin_registration', 'admin_payment', 'judge'], true),
            403,
        );

        $teamsByCompetition = Team::query()
            ->join('registrations', 'registrations.team_id', '=', 'teams.id')
            ->join('competitions', 'competitions.id', '=', 'registrations.competition_id')
            ->selectRaw('competitions.name as label, count(*) as total')
            ->groupBy('competitions.id', 'competitions.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['label' => $row->label, 'total' => (int) $row->total])
            ->values();

        $teamsByStatus = Team::query()
            ->selectRaw('status as label, count(*) as total')
            ->groupBy('status')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['label' => $row->label, 'total' => (int) $row->total])
            ->values();

        $operationsByDay = AdminAuditLog::query()
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, count(*) as total')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $activity = collect(range(6, 0))
            ->map(function (int $daysAgo) use ($operationsByDay): array {
                $date = now()->subDays($daysAgo)->toDateString();

                return [
                    'date' => $date,
                    'label' => now()->subDays($daysAgo)->translatedFormat('D'),
                    'total' => (int) data_get($operationsByDay->get($date), 'total', 0),
                ];
            })->values();

        return response()->json([
            'status' => 'success',
            'message' => 'Ringkasan operasional berhasil diambil.',
            'data' => [
                'totals' => [
                    'teams' => Team::query()->count(),
                    'waitingVerification' => Team::query()->where('status', Team::STATUS_WAITING_VERIFICATION)->count(),
                    'waitingPayment' => Registration::query()->where('status', 'WAITING_VERIFICATION')->count(),
                    'verified' => Team::query()->where('status', Team::STATUS_VERIFIED)->count(),
                ],
                'teamsByCompetition' => $teamsByCompetition,
                'teamsByStatus' => $teamsByStatus,
                'activity' => $activity,
            ],
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
