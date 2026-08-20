import type { ApiResponse } from '@/types/api'
import type {
  CompetitionType,
  RegistrationContext,
  RegistrationStatus,
  StageSummary,
} from '@/features/registrations/types/registrationTypes'

export type DashboardExam = {
  id: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  duration: number
  maxAttempts: number
}

export type DashboardSummary = RegistrationContext & {
  total?: number
  active?: number
  completed?: number
  team: RegistrationContext['team'] & {
    memberCount: number
    currentStage: StageSummary | null
  }
  payment: null | {
    status: RegistrationStatus
    amount: number
    originalAmount: number
    promoCode: string | null
    discountPercent: number
    discountAmount: number
    method: string | null
    submittedAt: string | null
    verifiedAt: string | null
    rejectionReason: string | null
    proof: null | { id: string; url: string; downloadUrl: string }
  }
  activities: { exams: DashboardExam[] }
  nextAction: string
}

export type DashboardSummaryResponse = ApiResponse<DashboardSummary>

export type DashboardCompetition = {
  id: string
  name: string
  type: CompetitionType
}

export type DashboardBatch = {
  id: string
  name: string
  price: number
}

export type ExamShellData = {
  exam: DashboardExam
  stage: StageSummary
  competition: DashboardCompetition
  batch: DashboardBatch
}

export type SubmissionPaymentState =
  | 'NOT_REQUIRED'
  | 'PAYMENT_REQUIRED'
  | 'WAITING_VERIFICATION'
  | 'REVISION_REQUIRED'

export type SubmissionShellData = {
  stage: StageSummary
  competition: DashboardCompetition
  batch: DashboardBatch
  payment: {
    isTargetStage: boolean
    status: RegistrationStatus
    originalAmount: number
    requiredAt: string | null
    submittedAt: string | null
    rejectionReason: string | null
    state: SubmissionPaymentState
  }
  submissionLocked: boolean
}

export type ExamShellResponse = ApiResponse<ExamShellData>
export type SubmissionShellResponse = ApiResponse<SubmissionShellData>
