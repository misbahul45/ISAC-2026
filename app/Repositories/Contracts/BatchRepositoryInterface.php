<?php

namespace App\Repositories\Contracts;

use App\Models\Batch;
use App\Models\Competition;
use Illuminate\Database\Eloquent\Collection;

interface BatchRepositoryInterface
{
    /**
     * @return Collection<int, Batch>
     */
    public function allForCompetition(?string $competitionId): Collection;

    /**
     * @return Collection<int, Batch>
     */
    public function openForCompetition(Competition $competition): Collection;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Batch;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Batch $batch, array $data): Batch;

    public function delete(Batch $batch): void;
}
