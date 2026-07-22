import type { ApiResponse } from '@/types/api'
import type { RegistrationContext, RegistrationStatus } from '@/features/registrations/types/registrationTypes'

export type DashboardSummary = RegistrationContext & {
  total?: number
  active?: number
  completed?: number
  team: RegistrationContext['team'] & {
    memberCount: number
    currentStage: { id: string; name: string; type: string } | null
  }
  payment: null | {
    status: RegistrationStatus; amount: number; method: string | null
    submittedAt: string | null; verifiedAt: string | null; rejectionReason: string | null
  }
  nextAction: string
}

export type DashboardSummaryResponse = ApiResponse<DashboardSummary>
