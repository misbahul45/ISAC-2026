import type { ApiResponse } from '@/types/api'
import type { AuthAdmin, TeamStatus } from '@/features/auth/types/authTypes'
import type {
  BatchStatus,
  CompetitionStatus,
  CompetitionType,
  MemberRecord,
  PaymentFlow,
  RegistrationStatus,
  TeamProfile,
} from '@/features/registrations/types/registrationTypes'

export type AdminRole = AuthAdmin['role']

export type AdminCompetition = {
  id: string
  name: string
  slug: string
  description: string | null
  type: CompetitionType
  paymentFlow: PaymentFlow
  startDate: string
  endDate: string
  status: CompetitionStatus
  createdAt: string | null
  updatedAt: string | null
}

export type AdminBatch = {
  id: string
  competitionId: string
  name: string
  slug: string
  description: string | null
  startAt: string
  endAt: string
  price: string
  moduleFileId: string | null
  quota: number | null
  currentRegistrations: number
  remainingQuota: number | null
  status: BatchStatus
  createdAt: string | null
  updatedAt: string | null
}

export type AdminTeamRegistration = {
  id: string
  status: RegistrationStatus
  teamCompletedAt: string | null
  membersCompletedAt: string | null
  documentsCompletedAt: string | null
  submittedAt: string | null
  paymentRequiredAt: string | null
  paymentSubmittedAt: string | null
  competition: AdminCompetition
  batch: AdminBatch
}

export type AdminTeamSummary = {
  team: TeamProfile
  members: MemberRecord[]
  registration: AdminTeamRegistration | null
}

export type LaravelPagination<T> = {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export type AdminTeamFilters = {
  page?: number
  per_page?: number
  status?: TeamStatus | ''
  competition_id?: string
  batch_id?: string
}

export type CompetitionFilters = {
  page?: number
  perPage?: number
  search?: string
  type?: CompetitionType | ''
  status?: CompetitionStatus | ''
}

export type CompetitionPayload = {
  name: string
  slug?: string
  description?: string | null
  type: CompetitionType
  payment_flow: PaymentFlow
  start_date: string
  end_date: string
  status: CompetitionStatus
}

export type BatchPayload = {
  competition_id: string
  name: string
  slug: string
  description?: string | null
  start_date: string
  end_date: string
  price: number
  module_file_id?: string | null
  quota?: number | null
  status: BatchStatus
}

export type TeamRevisionPayload = {
  revision_step: 'TEAM' | 'MEMBERS' | 'DOCUMENTS'
  verification_note: string
}

export type AdminMemberUpdatePayload = {
  id?: string
  name: string
  role: MemberRecord['role']
  email: string
  major: string | null
  faculty: string | null
  student_id: string
  photo_file_id?: string | null
  sort_order?: number
}

export type AdminTeamUpdatePayload = {
  team: {
    name: string
    phone: string
    institution_name: string
    institution_address: string
  }
  members: AdminMemberUpdatePayload[]
  documents: {
    document_url: string
    twibbon_url: string
  }
  reason?: string
}

export type PaymentMethod = 'BANK_TRANSFER' | 'QRIS'
export type PaymentContext = 'REGISTRATION' | 'SEMIFINAL'

export type AdminPaymentProof = {
  id: string
  fileId: string
  url: string
  purpose?: string
  name?: string
}

export type AdminPaymentTeam = {
  id: string
  code: string
  name: string | null
  email: string
  phone: string | null
  institutionName: string | null
  institutionAddress: string | null
  status: string
  currentStage: { id: string; name: string } | null
}

export type AdminPaymentCompetition = {
  id: string
  name: string
  type: CompetitionType
  paymentFlow: PaymentFlow
}

export type AdminPaymentBatch = {
  id: string
  name: string
  price: string
}

export type AdminPaymentDetail = {
  method: PaymentMethod | null
  originalAmount: string
  amountPaid: string
  promoCode: string | null
  discountPercent: string
  discountAmount: string
  proof: AdminPaymentProof | null
  requiredAt: string | null
  submittedAt: string | null
  reviewedAt: string | null
  paidAt: string | null
  rejectionReason: string | null
  targetStage: { id: string; name: string } | null
  reviewedBy: { id: string; name: string } | null
}

export type AdminPayment = {
  registrationId: string
  status: RegistrationStatus
  paymentContext: PaymentContext
  isSubmitted: boolean
  canBeReviewed: boolean
  team: AdminPaymentTeam
  competition: AdminPaymentCompetition
  batch: AdminPaymentBatch
  payment: AdminPaymentDetail
}

export type AdminPaymentFilters = {
  page?: number
  per_page?: number
  search?: string
  status?: RegistrationStatus | ''
  competition_id?: string
  batch_id?: string
  payment_method?: PaymentMethod | ''
}

export type AdminTeamsResponse = ApiResponse<LaravelPagination<AdminTeamSummary>>
export type AdminTeamResponse = ApiResponse<AdminTeamSummary>
export type AdminCompetitionsResponse = ApiResponse<AdminCompetition[]> & {
  metadata: { pagination: { page: number; perPage: number; total: number; lastPage: number } }
}
export type AdminCompetitionResponse = ApiResponse<AdminCompetition>
export type AdminBatchesResponse = ApiResponse<AdminBatch[]>
export type AdminBatchResponse = ApiResponse<AdminBatch>
export type DeleteResponse = ApiResponse<null>
export type AdminPaymentsResponse = ApiResponse<LaravelPagination<AdminPayment>>
export type AdminPaymentResponse = ApiResponse<AdminPayment>

