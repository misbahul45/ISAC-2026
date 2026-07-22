import { getJson, patchJson, postJson, putJson } from '@/lib/api'
import type {
  CompetitionListResponse, CompetitionQuery, DocumentsFormValues, DocumentsPageResponse,
  FinalizeMembersPayload, MembersPageResponse, PaymentFormValues, PaymentPageResponse,
  RegistrationContextResponse, RegistrationMutationResponse, RegistrationSummaryResponse,
  SelectCompetitionPayload, TeamFormValues, TeamProfileResponse,
} from '../types/registrationTypes'

const REGISTRATION_API = '/api/registrations/me'

export const registrationApi = {
  competitions: (_query: CompetitionQuery = {}) => getJson<CompetitionListResponse>('/api/competitions/open'),
  context: () => getJson<RegistrationContextResponse>(`${REGISTRATION_API}/context`),
  selectCompetition: (payload: SelectCompetitionPayload) => postJson<RegistrationMutationResponse>(`${REGISTRATION_API}/selection`, payload),
  team: () => getJson<TeamProfileResponse>(`${REGISTRATION_API}/team`),
  updateTeam: (payload: TeamFormValues) => patchJson<RegistrationMutationResponse>(`${REGISTRATION_API}/team`, payload),
  members: () => getJson<MembersPageResponse>(`${REGISTRATION_API}/members`),
  finalizeMembers: (payload: FinalizeMembersPayload) => putJson<RegistrationMutationResponse>(`${REGISTRATION_API}/members`, payload),
  documents: () => getJson<DocumentsPageResponse>(`${REGISTRATION_API}/documents`),
  updateDocuments: (payload: DocumentsFormValues) => patchJson<RegistrationMutationResponse>(`${REGISTRATION_API}/documents`, payload),
  payment: () => getJson<PaymentPageResponse>(`${REGISTRATION_API}/payment`),
  submitPayment: (payload: PaymentFormValues) => postJson<RegistrationMutationResponse>(`${REGISTRATION_API}/payment`, payload),
  summary: () => getJson<RegistrationSummaryResponse>(`${REGISTRATION_API}/summary`),
  submitForVerification: () => postJson<RegistrationMutationResponse>(`${REGISTRATION_API}/submit-verification`),
}
