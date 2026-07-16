<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Services\TeamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function __construct(
        private readonly TeamService $teamService,
    ) {
        //
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Team profile retrieved successfully.',
            'data' => new TeamResource($request->user()),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function update(UpdateTeamRequest $request): JsonResponse
    {
        $team = $this->teamService->updateProfile($request->user(), $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Team profile updated successfully.',
            'data' => new TeamResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
