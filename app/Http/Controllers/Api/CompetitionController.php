<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Competition\StoreCompetitionRequest;
use App\Http\Requests\Competition\UpdateCompetitionRequest;
use App\Http\Resources\CompetitionResource;
use App\Models\Competition;
use App\Services\CompetitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CompetitionController extends Controller
{
    public function __construct(
        private readonly CompetitionService $competitionService,
    ) {
        //
    }

    public function index(Request $request): JsonResponse
    {
        $competitions = $this->competitionService->getCompetitions(
            search: $request->query('search'),
            type: $request->query('type'),
            status: $request->query('status'),
            perPage: (int) $request->integer('perPage', 15) ?: 15,
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Competitions retrieved successfully.',
            'data' => CompetitionResource::collection($competitions),
            'metadata' => [
                'pagination' => [
                    'page' => $competitions->currentPage(),
                    'perPage' => $competitions->perPage(),
                    'total' => $competitions->total(),
                    'lastPage' => $competitions->lastPage(),
                ],
            ],
            'error' => null,
        ]);
    }

    public function show(Competition $competition): JsonResponse
    {
        $competition->loadMissing('batches');

        return response()->json([
            'status' => 'success',
            'message' => 'Competition detail retrieved successfully.',
            'data' => new CompetitionResource($competition),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function open(): JsonResponse
    {
        $competitions = $this->competitionService->getOpenCompetitions();

        return response()->json([
            'status' => 'success',
            'message' => 'Open competitions retrieved successfully.',
            'data' => CompetitionResource::collection($competitions),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function store(StoreCompetitionRequest $request): JsonResponse
    {
        Gate::authorize('create', Competition::class);
        $competition = $this->competitionService->createCompetition($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Competition created successfully.',
            'data' => new CompetitionResource($competition),
            'metadata' => (object) [],
            'error' => null,
        ], 201);
    }

    public function update(UpdateCompetitionRequest $request, Competition $competition): JsonResponse
    {
        Gate::authorize('update', $competition);
        $competition = $this->competitionService->updateCompetition($competition, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Competition updated successfully.',
            'data' => new CompetitionResource($competition),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function destroy(Competition $competition): JsonResponse
    {
        Gate::authorize('delete', $competition);
        $this->competitionService->deleteCompetition($competition);

        return response()->json([
            'status' => 'success',
            'message' => 'Competition deleted successfully.',
            'data' => null,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
