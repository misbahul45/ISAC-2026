<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Todo\StoreTodoRequest;
use App\Http\Requests\Todo\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use App\Services\TodoService;
use Illuminate\Http\JsonResponse;

class TodoController extends Controller
{
    public function __construct(
        private readonly TodoService $todoService,
    ) {
        //
    }

    public function index(): JsonResponse
    {
        $todos = $this->todoService->getTodos();

        return response()->json([
            'status' => 'success',
            'message' => 'Todos retrieved successfully.',
            'data' => TodoResource::collection($todos),
        ]);
    }

    public function store(StoreTodoRequest $request): JsonResponse
    {
        $todo = $this->todoService->createTodo($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Todo created successfully.',
            'data' => new TodoResource($todo),
        ], 201);
    }

    public function update(UpdateTodoRequest $request, Todo $todo): JsonResponse
    {
        $updatedTodo = $this->todoService->updateTodo($todo, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Todo updated successfully.',
            'data' => new TodoResource($updatedTodo),
        ]);
    }

    public function destroy(Todo $todo): JsonResponse
    {
        $this->todoService->deleteTodo($todo);

        return response()->json([
            'status' => 'success',
            'message' => 'Todo deleted successfully.',
            'data' => null,
        ]);
    }
}
