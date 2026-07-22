import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { clearAuthToken, setAuthToken } from '../authStorage'
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  VerifyResetCodePayload,
} from '../types/authTypes'

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (response) => {
      setAuthToken(response.data.token)
      queryClient.setQueryData(['auth', 'me', response.data.token], {
        status: 'success', message: 'Session restored.', data: response.data, metadata: {}, error: null,
      })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (response) => {
      setAuthToken(response.data.token)
      queryClient.setQueryData(['auth', 'me', response.data.token], {
        status: 'success', message: 'Session restored.', data: response.data, metadata: {}, error: null,
      })
    },
  })
}

export function useVerifyEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) => authApi.verifyEmail(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
  })
}

export function useResendVerification() {
  return useMutation({ mutationFn: () => authApi.resendVerification() })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload) })
}

export function useVerifyResetCode() {
  return useMutation({ mutationFn: (payload: VerifyResetCodePayload) => authApi.verifyResetCode(payload) })
}

export function useChangePassword() {
  return useMutation({ mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload) })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuthToken()
      queryClient.removeQueries({ queryKey: ['auth'] })
    },
  })
}
