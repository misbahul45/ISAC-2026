import { z } from 'zod';

export const registerNameSchema = z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.')
    .max(255, 'Nama maksimal 255 karakter.');

export const registerEmailSchema = z
    .string()
    .trim()
    .min(1, 'Email wajib diisi.')
    .email('Masukkan email yang valid.')
    .max(255, 'Email maksimal 255 karakter.');

export const registerPasswordSchema = z
    .string()
    .min(8, 'Password minimal 8 karakter.')
    .max(255, 'Password maksimal 255 karakter.');

export const registerConfirmPasswordSchema = z
    .string()
    .min(1, 'Konfirmasi password wajib diisi.');

export const registerSchema = z
    .object({
        name: registerNameSchema,
        email: registerEmailSchema,
        password: registerPasswordSchema,
        confirmPassword: registerConfirmPasswordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Konfirmasi password tidak sama.',
        path: ['confirmPassword'],
    });

export type RegisterInput = z.infer<typeof registerSchema>;
