import { getJson, postJson } from '@/lib/api'
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  ResendVerificationResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
  VerifyResetCodePayload,
  VerifyResetCodeResponse,
} from '../types/authTypes'

const AUTH_API = '/api/auth'

export const authApi = {
  me: () => getJson<MeResponse>(`${AUTH_API}/me`),
  login: (payload: LoginPayload) => postJson<LoginResponse>(`${AUTH_API}/login`, payload),
  register: (payload: RegisterPayload) => postJson<RegisterResponse>(`${AUTH_API}/register`, payload),
  verifyEmail: (payload: VerifyEmailPayload) => postJson<VerifyEmailResponse>(`${AUTH_API}/verify-email`, payload),
  resendVerification: () => postJson<ResendVerificationResponse>(`${AUTH_API}/verify-email/resend`),
  forgotPassword: (payload: ForgotPasswordPayload) => postJson<ForgotPasswordResponse>(`${AUTH_API}/forgot-password`, payload),
  verifyResetCode: (payload: VerifyResetCodePayload) => postJson<VerifyResetCodeResponse>(`${AUTH_API}/reset-password/verify`, payload),
  changePassword: (payload: ChangePasswordPayload) => postJson<ChangePasswordResponse>(`${AUTH_API}/reset-password`, payload),
  logout: () => postJson<LogoutResponse>(`${AUTH_API}/logout`),
}
