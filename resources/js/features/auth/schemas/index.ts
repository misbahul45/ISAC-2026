import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email wajib diisi')
        .email('Format email tidak valid'),
    password: z
        .string()
        .min(8, 'Password minimal 8 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Nama wajib diisi')
            .min(3, 'Nama minimal 3 karakter'),
        email: z
            .string()
            .min(1, 'Email wajib diisi')
            .email('Format email tidak valid'),
        password: z
            .string()
            .min(8, 'Password minimal 8 karakter'),
        confirmPassword: z
            .string()
            .min(8, 'Konfirmasi password minimal 8 karakter'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Konfirmasi password tidak sama',
        path: ['confirmPassword'],
    });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotEmailSchema = z.object({
    email: z
        .string()
        .min(1, 'Email wajib diisi')
        .email('Format email tidak valid'),
});

export type ForgotEmailInput = z.infer<typeof forgotEmailSchema>;

export const verifyEmailSchema = z.object({
    otp: z
        .string()
        .min(6, 'Kode OTP harus 6 digit')
        .max(6, 'Kode OTP harus 6 digit')
        .regex(/^\d{6}$/, 'Kode OTP hanya boleh angka'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const changePasswordSchema = z
    .object({
        otp: z
            .string()
            .min(6, 'Kode OTP harus 6 digit')
            .max(6, 'Kode OTP harus 6 digit')
            .regex(/^\d{6}$/, 'Kode OTP hanya boleh angka'),
        password: z
            .string()
            .min(8, 'Password minimal 8 karakter'),
        confirmPassword: z
            .string()
            .min(8, 'Konfirmasi password minimal 8 karakter'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Konfirmasi password tidak sama',
        path: ['confirmPassword'],
    });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;