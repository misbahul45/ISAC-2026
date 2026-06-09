import { deleteJson, fetchJson, patchJson, postJson } from '@/lib/api';
import type {
    CreateTodoPayload,
    DeleteTodoResponse,
    TodoListResponse,
    TodoResponse,
    UpdateTodoPayload,
} from '../types/todoTypes';

const TODO_API_BASE = '/api/todos';

export function getTodos(): Promise<TodoListResponse> {
    return fetchJson<TodoListResponse>(TODO_API_BASE);
}

export function createTodo(payload: CreateTodoPayload): Promise<TodoResponse> {
    return postJson<TodoResponse>(TODO_API_BASE, payload);
}

export function updateTodo(id: number, payload: UpdateTodoPayload): Promise<TodoResponse> {
    return patchJson<TodoResponse>(`${TODO_API_BASE}/${id}`, payload);
}

export function deleteTodo(id: number): Promise<DeleteTodoResponse> {
    return deleteJson<DeleteTodoResponse>(`${TODO_API_BASE}/${id}`);
}