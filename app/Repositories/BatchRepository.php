<?php

namespace App\Repositories;

use App\Models\Batch;
use App\Models\BatchStatus;
use App\Models\Competition;
use App\Repositories\Contracts\BatchRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class BatchRepository implements BatchRepositoryInterface
{
    /**
     * @return Collection<int, Batch>
     */
    public function allForCompetition(?string $competitionId): Collection
    {
        return Batch::query()
            ->when($competitionId !== null, fn ($query) => $query->where('competition_id', $competitionId))
            ->latest()
            ->get();
    }

    /**
     * @return Collection<int, Batch>
     */
    public function openForCompetition(Competition $competition): Collection
    {
        return $competition->batches()
            ->where('status', BatchStatus::OPEN)
            ->orderBy('start_date')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Batch
    {
        return Batch::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Batch $batch, array $data): Batch
    {
        $batch->update($data);

        return $batch->fresh();
    }

    public function delete(Batch $batch): void
    {
        $batch->delete();
    }
}
