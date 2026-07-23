import { deleteJson, getJson, patchJson, postJson, toSearchParams } from '@/lib/api'
import type {
  AdminBatchResponse,
  AdminBatchesResponse,
  AdminCompetitionResponse,
  AdminCompetitionsResponse,
  AdminPaymentFilters,
  AdminPaymentResponse,
  AdminPaymentsResponse,
  AdminTeamFilters,
  AdminTeamResponse,
  AdminTeamsResponse,
  BatchPayload,
  CompetitionFilters,
  CompetitionPayload,
  DeleteResponse,
  TeamRevisionPayload,
} from '../types/adminTypes'

const requestHeaders = () => ({ 'X-Request-ID': crypto.randomUUID() })

export const adminApi = {
  teams: (filters: AdminTeamFilters) => getJson<AdminTeamsResponse>(`/api/admin/teams${toSearchParams(filters)}`),
  team: (teamId: string) => getJson<AdminTeamResponse>(`/api/admin/teams/${teamId}`),
  verifyTeam: (teamId: string) => postJson<AdminTeamResponse>(`/api/admin/teams/${teamId}/verify`, undefined, { headers: requestHeaders() }),
  reviseTeam: (teamId: string, payload: TeamRevisionPayload) => postJson<AdminTeamResponse>(`/api/admin/teams/${teamId}/revision`, payload, { headers: requestHeaders() }),
  rejectTeam: (teamId: string, reason: string) => postJson<AdminTeamResponse>(`/api/admin/teams/${teamId}/reject`, { reason }, { headers: requestHeaders() }),
  competitions: (filters: CompetitionFilters) => getJson<AdminCompetitionsResponse>(`/api/competitions${toSearchParams(filters)}`),
  createCompetition: (payload: CompetitionPayload) => postJson<AdminCompetitionResponse>('/api/admin/competitions', payload),
  updateCompetition: (id: string, payload: CompetitionPayload) => patchJson<AdminCompetitionResponse>(`/api/admin/competitions/${id}`, payload),
  deleteCompetition: (id: string) => deleteJson<DeleteResponse>(`/api/admin/competitions/${id}`),
  batches: (competitionId?: string) => getJson<AdminBatchesResponse>(`/api/admin/batches${toSearchParams({ competition_id: competitionId })}`),
  createBatch: (payload: BatchPayload) => postJson<AdminBatchResponse>('/api/admin/batches', payload),
  updateBatch: (id: string, payload: Omit<BatchPayload, 'competition_id'>) => patchJson<AdminBatchResponse>(`/api/admin/batches/${id}`, payload),
  deleteBatch: (id: string) => deleteJson<DeleteResponse>(`/api/admin/batches/${id}`),
  payments: (filters: AdminPaymentFilters) => getJson<AdminPaymentsResponse>(`/api/admin/payments${toSearchParams(filters)}`),
  payment: (registrationId: string) => getJson<AdminPaymentResponse>(`/api/admin/payments/${registrationId}`),
  verifyPayment: (registrationId: string) => postJson<AdminPaymentResponse>(`/api/admin/registrations/${registrationId}/payment/verify`, undefined, { headers: requestHeaders() }),
  revisePayment: (registrationId: string, reason: string) => postJson<AdminPaymentResponse>(`/api/admin/registrations/${registrationId}/payment/revision`, { reason }, { headers: requestHeaders() }),
  rejectPayment: (registrationId: string, reason: string) => postJson<AdminPaymentResponse>(`/api/admin/registrations/${registrationId}/payment/reject`, { reason }, { headers: requestHeaders() }),
}

