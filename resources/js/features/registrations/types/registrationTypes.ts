import type { ApiResponse, RedirectData } from '@/types/api'

export type CompetitionType = 'OLIMPIADE' | 'BUSINESS_PLAN' | 'BUSINESS_IT_CASE'
export type PaymentFlow = 'UPFRONT' | 'SEMIFINAL'
export type CompetitionStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED'
export type BatchStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FULL'
export type TeamStatus = 'INCOMPLETE' | 'WAITING_VERIFICATION' | 'VERIFIED' | 'REVISION_REQUIRED' | 'REJECTED'
export type RegistrationStatus = 'WAITING_PAYMENT' | 'WAITING_VERIFICATION' | 'VERIFIED' | 'REVISION_REQUIRED' | 'REJECTED' | 'CANCELLED'
export type MemberRole = 'LEADER' | 'MEMBER'
export type ParticipantCategory = 'HIGH_SCHOOL_STUDENT' | 'UNIVERSITY_STUDENT'
export type RegistrationStep = 'VERIFY_EMAIL' | 'COMPETITION' | 'TEAM' | 'BIODATA' | 'DOCUMENTS' | 'PAYMENT' | 'DASHBOARD'

export type BatchSummary = {
  id: string; competitionId: string; name: string; slug: string; description: string | null
  startAt: string; endAt: string; price: string; quota: number | null
  currentRegistrations: number; remainingQuota: number | null; status: BatchStatus
}
export type CompetitionSummary = {
  id: string; name: string; slug: string; description: string | null; type: CompetitionType
  paymentFlow: PaymentFlow; status: CompetitionStatus; openBatches: BatchSummary[]; batches?: BatchSummary[]
}
export type RegistrationContext = {
  team: {
    id: string; code: string; name: string | null; email: string; status: TeamStatus
    institutionName: string | null; institutionAddress: string | null
    emailVerifiedAt: string | null; revisionStep: 'TEAM' | 'MEMBERS' | 'DOCUMENTS' | null
    verificationNote: string | null
  }
  registration: null | {
    id: string; status: RegistrationStatus; competition: CompetitionSummary; batch: BatchSummary
    paymentRequiredAt: string | null; paymentSubmittedAt: string | null; paymentRejectionReason: string | null
    paymentForStage: StageSummary | null
  }
  progress: { teamCompleted: boolean; membersCompleted: boolean; documentsCompleted: boolean; submitted: boolean }
  currentStep: RegistrationStep
  allowedActions: string[]
  redirectTo: string
}

export type StageSummary = {
  id: string; name: string; type: string; order: number; description: string | null
  startDate: string | null; endDate: string | null
}

export type TeamFormValues = {
  name: string; phone: string; institution_name: string; institution_address: string
}
export type TeamProfile = {
  id: string; code: string; email: string; name: string | null; phone: string | null
  institutionName: string | null; institutionAddress: string | null
  documentUrl: string | null; twibbonUrl: string | null; status: TeamStatus
  verificationNote: string | null; revisionStep: string | null
  competitionSummary: { id: string; name: string; type: CompetitionType } | null
}
export type MemberRecord = {
  id: string; name: string; role: MemberRole; email: string
  major: string | null; faculty: string | null; studentId: string
  photoFileId: string | null; sortOrder: number
}
export type MemberFormValues = {
  id?: string; name: string; role: MemberRole; email: string
  major: string | null; faculty: string | null; student_id: string
  photo_file_id: string | null; sort_order: number
}
export type MembersPageData = {
  competitionType: CompetitionType; minMembers: number; maxMembers: number
  participantCategory: ParticipantCategory; identityLabel: 'NISN' | 'NIM'; showsLeaderRole: boolean
  members: MemberRecord[]; revisionNote: string | null
}
export type DocumentsFormValues = { document_url: string; twibbon_url: string }
export type DocumentsPageData = { documentUrl: string | null; twibbonUrl: string | null; revisionNote: string | null }
export type PaymentMethod = 'BANK_TRANSFER' | 'QRIS'
export type ExternalFile = { id: string; fileId: string; url: string; purpose?: string; name?: string }
export type PaymentFormValues = { payment_proof_file_id: string; payment_method: PaymentMethod; promo_code?: string }
export type PaymentQuoteData = {
  originalAmount: number; discountPercent: number; discountAmount: number; amount: number
  promoApplied: boolean; promoCode: string | null
}
export type PaymentPageData = {
  registrationId: string; originalAmount: number; amount: number; discountPercent: number
  discountAmount: number; promoApplied: boolean; promoCode: string | null
  paymentMethods: PaymentMethod[]; paymentInstructions: string | null
  qrImageUrl: string | null; paymentStatus: RegistrationStatus; existingProof: ExternalFile | null
  rejectionReason: string | null; paymentSubmittedAt: string | null; paymentForStage: { id: string; name: string } | null
}
export type RegistrationSummary = {
  team: TeamProfile; members: MemberRecord[]
  registration: null | { id: string; status: RegistrationStatus; competition: CompetitionSummary; batch: BatchSummary }
}
export type CompetitionQuery = { status?: CompetitionStatus }
export type SelectCompetitionPayload = { competition_id: string }
export type FinalizeMembersPayload = { members: MemberFormValues[] }
export type RegistrationMutationData = RedirectData & { context: RegistrationContext }

export type CompetitionListResponse = ApiResponse<CompetitionSummary[]>
export type RegistrationContextResponse = ApiResponse<RegistrationContext>
export type TeamProfileResponse = ApiResponse<TeamProfile>
export type MembersPageResponse = ApiResponse<MembersPageData>
export type DocumentsPageResponse = ApiResponse<DocumentsPageData>
export type PaymentPageResponse = ApiResponse<PaymentPageData>
export type PaymentQuoteResponse = ApiResponse<PaymentQuoteData>
export type RegistrationSummaryResponse = ApiResponse<RegistrationSummary>
export type RegistrationMutationResponse = ApiResponse<RegistrationMutationData>
