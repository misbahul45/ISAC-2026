<?php

namespace App\Repositories\Contracts;

use App\Models\Competition;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CompetitionRepositoryInterface
{
    public function search(?string $search, ?string $type, ?string $status, int $perPage): LengthAwarePaginator;

    public function findWithBatches(string $id): ?Competition;

    public function findOpenWithBatches(): Collection;

    public function getAll(): Collection;

    public function findById(string $id): Competition;

    public function create(array $data): Competition;

    public function update(Competition $competition, array $data): Competition;

    public function delete(Competition $competition): void;
}
