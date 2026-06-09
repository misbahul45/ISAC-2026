import { z } from 'zod';

export const createTodoSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Todo title cannot be empty.')
        .max(255, 'Todo title may not be greater than 255 characters.'),
});

export const updateTodoSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Todo title cannot be empty.')
        .max(255, 'Todo title may not be greater than 255 characters.')
        .optional(),
    is_completed: z.boolean().optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

export function validateCreateTodoInput(input: unknown) {
    const result = createTodoSchema.safeParse(input);

    if (!result.success) {
        return {
            valid: false as const,
            data: null,
            error: result.error.issues[0]?.message || 'Invalid todo input.',
        };
    }

    return {
        valid: true as const,
        data: result.data,
        error: null,
    };
}
