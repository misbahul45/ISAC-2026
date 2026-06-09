import type { ApiResponse } from '@/types';
import type { CreateTodoInput, UpdateTodoInput } from '../schemas/todoSchema';

export type Todo = {
    id: number;
    title: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
};

export type TodoStats = {
    total: number;
    active: number;
    completed: number;
};

export type TodoListResponse = ApiResponse<Todo[]>;

export type TodoResponse = ApiResponse<Todo>;

export type DeleteTodoResponse = ApiResponse<null>;

export type CreateTodoPayload = CreateTodoInput;

export type UpdateTodoPayload = UpdateTodoInput;
