import { useMutation } from '@tanstack/react-query';
import { register } from '../api/authApi';
import type { RegisterPayload } from '../types/authTypes';

export function useRegister() {
    return useMutation<never, Error, RegisterPayload>({
        mutationFn: register,
    });
}
