import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createTodo,
    deleteTodo,
    getTodos,
    updateTodo,
} from '../api/todoApi';
import type {
    CreateTodoPayload,
    DeleteTodoResponse,
    Todo,
    TodoListResponse,
    TodoResponse,
    TodoStats,
} from '../types/todoTypes';

const TODOS_QUERY_KEY = ['todos'] as const;

export function useTodos() {
    const queryClient = useQueryClient();

    const todosQuery = useQuery<TodoListResponse, Error>({
        queryKey: TODOS_QUERY_KEY,
        queryFn: getTodos,
    });

    const createTodoMutation = useMutation<TodoResponse, Error, CreateTodoPayload>({
        mutationFn: createTodo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
        },
    });

    const toggleTodoMutation = useMutation<TodoResponse, Error, Todo>({
        mutationFn: (todo) =>
            updateTodo(todo.id, {
                is_completed: !todo.is_completed,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
        },
    });

    const deleteTodoMutation = useMutation<DeleteTodoResponse, Error, number>({
        mutationFn: deleteTodo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
        },
    });

    const todos = todosQuery.data?.data ?? [];

    const stats = useMemo<TodoStats>(() => {
        const total = todos.length;
        const completed = todos.filter((todo) => todo.is_completed).length;
        const active = total - completed;

        return {
            total,
            active,
            completed,
        };
    }, [todos]);

    return {
        todos,
        stats,
        todosQuery,
        createTodoMutation,
        toggleTodoMutation,
        deleteTodoMutation,
    };
}
