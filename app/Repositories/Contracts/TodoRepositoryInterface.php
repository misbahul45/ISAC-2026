<?php

namespace App\Repositories\Contracts;

use App\Models\Todo;
use Illuminate\Database\Eloquent\Collection;

interface TodoRepositoryInterface
{
    /**
     * @return Collection<int, Todo>
     */
    public function allLatest(): Collection;

    /**
     * @param array{title: string, is_completed?: bool} $data
     */
    public function create(array $data): Todo;

    /**
     * @param array{title?: string, is_completed?: bool} $data
     */
    public function update(Todo $todo, array $data): Todo;

    public function delete(Todo $todo): void;
}
