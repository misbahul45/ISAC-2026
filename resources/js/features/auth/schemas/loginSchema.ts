import { z } from 'zod';

export const loginEmailSchema = z
    .string()
    .trim()
    .min(1, 'Email wajib diisi.')
    .email('Masukkan email yang valid.');

export const loginPasswordSchema = z
    .string()
    .min(1, 'Password wajib diisi.');

export const loginSchema = z.object({
    email: loginEmailSchema,
    password: loginPasswordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
