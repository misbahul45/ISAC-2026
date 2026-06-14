import { deleteJson, fetchJson, patchJson, postJson } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import type {
    CreateTodoPayload,
    DeleteTodoResponse,
    TodoListResponse,
    TodoResponse,
    UpdateTodoPayload,
} from '../types/todoTypes';

export function getTodos(): Promise<TodoListResponse> {
    return fetchJson<TodoListResponse>(ROUTES.api.todos);
}

export function createTodo(payload: CreateTodoPayload): Promise<TodoResponse> {
    return postJson<TodoResponse>(ROUTES.api.todos, payload);
}

export function updateTodo(id: number, payload: UpdateTodoPayload): Promise<TodoResponse> {
    return patchJson<TodoResponse>(`${ROUTES.api.todos}/${id}`, payload);
}

export function deleteTodo(id: number): Promise<DeleteTodoResponse> {
    return deleteJson<DeleteTodoResponse>(`${ROUTES.api.todos}/${id}`);
}
