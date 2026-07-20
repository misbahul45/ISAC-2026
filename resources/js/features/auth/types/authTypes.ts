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
  name?: string | null
  status: TeamStatus
  emailVerifiedAt: string | null
  nextRedirect?: string
}

export type LoginPayload = {
  email: string
  password: string
  remember: boolean
}

export type RegisterPayload = {
  email: string
  password: string
  password_confirmation: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type VerifyEmailPayload = {
  code: string
}

export type VerifyResetCodePayload = {
  code: string
}

export type ChangePasswordPayload = {
  password: string
  password_confirmation: string
}

export type LoginData = {
  token?: string
  tokenType?: string
  team: AuthTeam
  redirectTo?: string
}

export type RegisterData = AuthTeam & Partial<RedirectData>

export type LoginResponse = ApiResponse<LoginData>
export type RegisterResponse = ApiResponse<RegisterData>
export type ForgotPasswordResponse = ApiResponse<RedirectData>
export type VerifyEmailResponse = ApiResponse<RedirectData>
export type ResendVerificationResponse = ApiResponse<RedirectData>
export type VerifyResetCodeResponse = ApiResponse<RedirectData>
export type ChangePasswordResponse = ApiResponse<RedirectData>
export type LogoutResponse = ApiResponse<RedirectData>
