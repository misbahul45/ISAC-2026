import type { LoginPayload, RegisterPayload } from '../types/authTypes';

export function login(payload: LoginPayload): Promise<never> {
    void payload;

    return Promise.reject(new Error('Auth API is not configured.'));
}

export function register(payload: RegisterPayload): Promise<never> {
    void payload;

    return Promise.reject(new Error('Auth API is not configured.'));
}
