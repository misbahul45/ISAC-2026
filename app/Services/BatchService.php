<?php

namespace App\Services;

use App\Models\Batch;
use App\Models\Competition;
use App\Repositories\Contracts\BatchRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class BatchService
{
    public function __construct(
        private readonly BatchRepositoryInterface $batchRepository,
    ) {
        //
    }

    /**
     * @return Collection<int, Batch>
     */
    public function getBatches(?string $competitionId): Collection
    {
        return $this->batchRepository->allForCompetition($competitionId);
    }

    /**
     * @return Collection<int, Batch>
     */
    public function getOpenBatches(Competition $competition): Collection
    {
        return $this->batchRepository->openForCompetition($competition);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createBatch(array $data): Batch
    {
        return $this->batchRepository->create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function updateBatch(Batch $batch, array $data): Batch
    {
        return $this->batchRepository->update($batch, $data);
    }

    public function deleteBatch(Batch $batch): void
    {
        $this->batchRepository->delete($batch);
    }
}
