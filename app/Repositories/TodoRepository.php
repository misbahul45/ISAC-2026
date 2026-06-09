<?php

namespace App\Repositories;

use App\Models\Todo;
use App\Repositories\Contracts\TodoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TodoRepository implements TodoRepositoryInterface
{
    /**
     * @return Collection<int, Todo>
     */
    public function allLatest(): Collection
    {
        return Todo::query()
            ->latest()
            ->get();
    }

    /**
     * @param array{title: string, is_completed?: bool} $data
     */
    public function create(array $data): Todo
    {
        return Todo::query()->create($data);
    }

    /**
     * @param array{title?: string, is_completed?: bool} $data
     */
    public function update(Todo $todo, array $data): Todo
    {
        $todo->update($data);

        return $todo->fresh();
    }

    public function delete(Todo $todo): void
    {
        $todo->delete();
    }
}
