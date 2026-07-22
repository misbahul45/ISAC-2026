import type { ApiResponse, RedirectData } from '@/types/api'

export type TeamStatus =
  | 'INCOMPLETE'
  | 'WAITING_VERIFICATION'
  | 'VERIFIED'
  | 'REVISION_REQUIRED'
  | 'REJECTED'

export type AuthTeam = {
  id: string
  code: string
  email: string
  name: string | null
  status: TeamStatus
  emailVerifiedAt: string | null
  nextRedirect: string
  redirectTo?: string
  createdAt?: string | null
}

export type AuthAdmin = {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin_registration' | 'admin_payment' | 'judge'
  isActive: boolean
}

export type AuthPrincipal =
  | { principalType: 'TEAM'; team: AuthTeam; admin?: never }
  | { principalType: 'ADMIN'; admin: AuthAdmin; team?: never }

export type LoginPayload = { email: string; password: string; remember: boolean }
export type RegisterPayload = { email: string; password: string; password_confirmation: string }
export type ForgotPasswordPayload = { email: string }
export type VerifyEmailPayload = { code: string }
export type VerifyResetCodePayload = { email: string; code: string }
export type ChangePasswordPayload = { reset_token: string; password: string; password_confirmation: string }

export type AuthTokenData = AuthPrincipal & {
  token: string
  tokenType: 'Bearer'
  redirectTo: string
}

export type RegisterData = AuthTokenData & { principalType: 'TEAM'; team: AuthTeam }
export type LoginData = AuthTokenData & { emailVerificationRequired: boolean }
export type VerifyResetData = { resetToken: string; redirectTo: string }

export type LoginResponse = ApiResponse<LoginData>
export type RegisterResponse = ApiResponse<RegisterData>
export type MeResponse = ApiResponse<AuthPrincipal>
export type ForgotPasswordResponse = ApiResponse<null>
export type VerifyEmailResponse = ApiResponse<RedirectData & { team: AuthTeam }>
export type ResendVerificationResponse = ApiResponse<null>
export type VerifyResetCodeResponse = ApiResponse<VerifyResetData>
export type ChangePasswordResponse = ApiResponse<null>
export type LogoutResponse = ApiResponse<null>
