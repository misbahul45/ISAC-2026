<?php

namespace App\Services;

use App\Models\Todo;
use App\Repositories\Contracts\TodoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TodoService
{
    public function __construct(
        private readonly TodoRepositoryInterface $todoRepository,
    ) {
        //
    }

    /**
     * @return Collection<int, Todo>
     */
    public function getTodos(): Collection
    {
        return $this->todoRepository->allLatest();
    }

    /**
     * @param array{title: string} $data
     */
    public function createTodo(array $data): Todo
    {
        return $this->todoRepository->create([
            'title' => $data['title'],
            'is_completed' => false,
        ]);
    }

    /**
     * @param array{title?: string, is_completed?: bool} $data
     */
    public function updateTodo(Todo $todo, array $data): Todo
    {
        return $this->todoRepository->update($todo, $data);
    }

    public function deleteTodo(Todo $todo): void
    {
        $this->todoRepository->delete($todo);
    }
}
