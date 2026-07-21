import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  VerifyResetCodePayload,
} from '../types/authTypes'

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) => authApi.verifyEmail(payload),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: () => authApi.resendVerification(),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authApi.forgotPassword(payload),
  })
}

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: (payload: VerifyResetCodePayload) =>
      authApi.verifyResetCode(payload),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authApi.changePassword(payload),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authApi.logout(),
  })
}
