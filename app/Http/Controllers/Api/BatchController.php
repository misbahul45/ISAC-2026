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
use Illuminate\Support\Facades\Gate;

class BatchController extends Controller
{
    public function __construct(private readonly BatchService $batchService) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Batch::class);
        $batches = $this->batchService->getBatches($request->query('competition_id'));

        return $this->success('Batches retrieved successfully.', BatchResource::collection($batches));
    }

    public function openForCompetition(Competition $competition): JsonResponse
    {
        return $this->success('Open batches retrieved successfully.', BatchResource::collection(
            $this->batchService->getOpenBatches($competition),
        ));
    }

    public function store(StoreBatchRequest $request): JsonResponse
    {
        Gate::authorize('create', Batch::class);

        return $this->success('Batch created successfully.', new BatchResource(
            $this->batchService->createBatch($request->validated()),
        ), 201);
    }

    public function show(Batch $batch): JsonResponse
    {
        Gate::authorize('view', $batch);

        return $this->success('Batch detail retrieved successfully.', new BatchResource($batch));
    }

    public function update(UpdateBatchRequest $request, Batch $batch): JsonResponse
    {
        Gate::authorize('update', $batch);

        return $this->success('Batch updated successfully.', new BatchResource(
            $this->batchService->updateBatch($batch, $request->validated()),
        ));
    }

    public function destroy(Batch $batch): JsonResponse
    {
        Gate::authorize('delete', $batch);
        $this->batchService->deleteBatch($batch);

        return $this->success('Batch deleted successfully.', null);
    }

    private function success(string $message, mixed $data, int $status = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success', 'message' => $message, 'data' => $data,
            'metadata' => (object) [], 'error' => null,
        ], $status);
    }
}
