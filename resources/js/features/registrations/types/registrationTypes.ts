import type {
  ApiResponse,
  PaginatedData,
  PaginationQuery,
  RedirectData,
} from '@/types/api'

export type CompetitionType =
  | 'OLIMPIADE'
  | 'BUSINESS_PLAN'
  | 'BUSINESS_IT_CASE'

export type PaymentFlow = 'UPFRONT' | 'SEMIFINAL'

export type CompetitionStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'

export type BatchStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FULL'

export type TeamStatus =
  | 'INCOMPLETE'
  | 'WAITING_VERIFICATION'
  | 'VERIFIED'
  | 'REVISION_REQUIRED'
  | 'REJECTED'

export type RegistrationStatus =
  | 'WAITING_PAYMENT'
  | 'WAITING_VERIFICATION'
  | 'VERIFIED'
  | 'REVISION_REQUIRED'
  | 'REJECTED'
  | 'CANCELLED'

export type MemberRole = 'LEADER' | 'MEMBER'

export type RegistrationStep =
  | 'COMPETITION'
  | 'TEAM'
  | 'BIODATA'
  | 'DOCUMENTS'
  | 'PAYMENT'
  | 'VALIDATION'

export type BatchSummary = {
  id: string
  name: string
  slug: string
  startAt: string
  endAt: string
  price: string
  quota: number | null
  remainingQuota: number | null
  status: BatchStatus
}

export type CompetitionSummary = {
  id: string
  name: string
  slug: string
  description: string | null
  type: CompetitionType
  paymentFlow: PaymentFlow
  status: CompetitionStatus
  openBatches: BatchSummary[]
}

export type RegistrationProgress = {
  teamCompletedAt: string | null
  membersCompletedAt: string | null
  documentsCompletedAt: string | null
  submittedAt: string | null
}

export type RegistrationContext = {
  id: string | null
  competition: CompetitionSummary | null
  batch: BatchSummary | null
  status: RegistrationStatus | null
  teamStatus: TeamStatus
  currentStep: RegistrationStep
  redirectTo: string
  progress: RegistrationProgress
}

export type TeamFormValues = {
  name: string
  phone: string
  school_name: string
  school_province: string
  school_city: string
  school_address: string
}

export type TeamProfile = TeamFormValues & {
  id: string
  code: string
  email: string
  document_url: string | null
  twibbon_url: string | null
  status: TeamStatus
  verification_note: string | null
}

export type MemberFormValues = {
  id?: string
  name: string
  role: MemberRole
  email: string
  phone: string
  education_level: string
  major: string | null
  faculty: string | null
  student_id: string
  birth_date: string
  photo_file_id: string | null
  sort_order: number
}

export type MembersPageData = {
  competitionType: CompetitionType
  minMembers: number
  maxMembers: number
  members: MemberFormValues[]
  revisionNote: string | null
}

export type DocumentsFormValues = {
  document_url: string
  twibbon_url: string
}

export type DocumentsPageData = DocumentsFormValues & {
  revisionNote: string | null
}

export type PaymentMethod = 'BANK_TRANSFER' | 'QRIS'

export type ExternalFile = {
  id: string
  fileId: string
  url: string
  name?: string
}

export type PaymentFormValues = {
  payment_proof_file_id: string
  payment_method: PaymentMethod
  transaction_id?: string
}

export type PaymentPageData = {
  registrationId: string
  amount: string
  paymentMethods: PaymentMethod[]
  paymentInstructions: string | null
  qrImageUrl: string | null
  paymentStatus: RegistrationStatus
  existingProof: ExternalFile | null
  rejectionReason: string | null
  paymentForStage: {
    id: string
    name: string
  } | null
}

export type RegistrationSummary = {
  team: TeamProfile
  members: MemberFormValues[]
  competition: CompetitionSummary
  batch: BatchSummary
  registrationStatus: RegistrationStatus
}

export type CompetitionQuery = PaginationQuery & {
  status?: CompetitionStatus
}

export type SelectCompetitionPayload = {
  competition_id: string
  batch_id: string
}

export type FinalizeMembersPayload = {
  members: MemberFormValues[]
}

export type CompetitionListResponse = ApiResponse<
  PaginatedData<CompetitionSummary>
>
export type RegistrationContextResponse = ApiResponse<RegistrationContext>
export type TeamProfileResponse = ApiResponse<TeamProfile>
export type MembersPageResponse = ApiResponse<MembersPageData>
export type DocumentsPageResponse = ApiResponse<DocumentsPageData>
export type PaymentPageResponse = ApiResponse<PaymentPageData>
export type RegistrationSummaryResponse = ApiResponse<RegistrationSummary>
export type RegistrationMutationResponse = ApiResponse<RedirectData>

