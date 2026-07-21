<?php

namespace App\Repositories;

use App\Models\Competition;
use App\Repositories\Contracts\CompetitionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CompetitionRepository implements CompetitionRepositoryInterface
{
    public function search(?string $search, ?string $type, ?string $status, int $perPage): LengthAwarePaginator
    {
        return Competition::query()
            ->when($search !== null, fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->when($type !== null, fn ($query) => $query->where('type', $type))
            ->when($status !== null, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage);
    }

    public function findWithBatches(string $id): ?Competition
    {
        return Competition::query()
            ->with('batches')
            ->find($id);
    }

    public function findOpenWithBatches(): Collection
    {
        return Competition::query()
            ->where('status', Competition::STATUS_REGISTRATION_OPEN)
            ->with(['batches' => fn ($query) => $query->where('status', 'OPEN')->orderBy('start_date')])
            ->get();
    }

    public function getAll(): Collection
    {
        return Competition::all();
    }

    public function findById(string $id): Competition
    {
        return Competition::findOrFail($id);
    }

    public function create(array $data): Competition
    {
        return Competition::query()->create($data);
    }

    public function update(Competition $competition, array $data): Competition
    {
        $competition->update($data);

        return $competition->fresh();
    }

    public function delete(Competition $competition): void
    {
        $competition->delete();
    }
}
