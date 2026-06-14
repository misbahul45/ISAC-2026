import { useMutation } from '@tanstack/react-query';
import { login } from '../api/authApi';
import type { LoginPayload } from '../types/authTypes';

export function useLogin() {
    return useMutation<never, Error, LoginPayload>({
        mutationFn: login,
    });
}
