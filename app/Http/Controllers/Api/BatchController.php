<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Batch\StoreBatchRequest;
use App\Http\Requests\Batch\UpdateBatchRequest;
use App\Http\Resources\BatchResource;
use App\Models\Batch;
use App\Models\Competition;
use App\Services\BatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function __construct(
        private readonly BatchService $batchService,
    ) {
        //
    }

    public function index(Request $request): JsonResponse
    {
        $batches = $this->batchService->getBatches($request->query('competition_id'));

        return response()->json([
            'status' => 'success',
            'message' => 'Batches retrieved successfully.',
            'data' => BatchResource::collection($batches),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function openForCompetition(Competition $competition): JsonResponse
    {
        $batches = $this->batchService->getOpenBatches($competition);

        return response()->json([
            'status' => 'success',
            'message' => 'Open batches retrieved successfully.',
            'data' => BatchResource::collection($batches),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function store(StoreBatchRequest $request): JsonResponse
    {
        $batch = $this->batchService->createBatch($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Batch created successfully.',
            'data' => new BatchResource($batch),
            'metadata' => (object) [],
            'error' => null,
        ], 201);
    }

    public function show(Batch $batch): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Batch detail retrieved successfully.',
            'data' => new BatchResource($batch),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function update(UpdateBatchRequest $request, Batch $batch): JsonResponse
    {
        $updatedBatch = $this->batchService->updateBatch($batch, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Batch updated successfully.',
            'data' => new BatchResource($updatedBatch),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function destroy(Batch $batch): JsonResponse
    {
        $this->batchService->deleteBatch($batch);

        return response()->json([
            'status' => 'success',
            'message' => 'Batch deleted successfully.',
            'data' => null,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
