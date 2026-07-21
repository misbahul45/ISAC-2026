import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { registrationApi } from '../api/registrationApi'
import type {
  CompetitionQuery,
  DocumentsFormValues,
  FinalizeMembersPayload,
  PaymentFormValues,
  SelectCompetitionPayload,
  TeamFormValues,
} from '../types/registrationTypes'

export const registrationKeys = {
  all: ['registration'] as const,
  context: () => [...registrationKeys.all, 'context'] as const,
  competitions: (query: CompetitionQuery) =>
    [...registrationKeys.all, 'competitions', query] as const,
  team: () => [...registrationKeys.all, 'team'] as const,
  members: () => [...registrationKeys.all, 'members'] as const,
  documents: () => [...registrationKeys.all, 'documents'] as const,
  payment: () => [...registrationKeys.all, 'payment'] as const,
  summary: () => [...registrationKeys.all, 'summary'] as const,
}

function useInvalidateRegistration() {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: registrationKeys.all })
}

export function useCompetitions(query: CompetitionQuery = {}) {
  return useQuery({
    queryKey: registrationKeys.competitions(query),
    queryFn: () => registrationApi.competitions(query),
  })
}

export function useRegistrationContext() {
  return useQuery({
    queryKey: registrationKeys.context(),
    queryFn: registrationApi.context,
  })
}

export function useSelectCompetition() {
  const invalidate = useInvalidateRegistration()

  return useMutation({
    mutationFn: (payload: SelectCompetitionPayload) =>
      registrationApi.selectCompetition(payload),
    onSuccess: invalidate,
  })
}

export function useTeamProfile() {
  return useQuery({
    queryKey: registrationKeys.team(),
    queryFn: registrationApi.team,
  })
}

export function useUpdateTeam() {
  const invalidate = useInvalidateRegistration()

  return useMutation({
    mutationFn: (payload: TeamFormValues) =>
      registrationApi.updateTeam(payload),
    onSuccess: invalidate,
  })
}

export function useMembers() {
  return useQuery({
    queryKey: registrationKeys.members(),
    queryFn: registrationApi.members,
  })
}

export function useFinalizeMembers() {
  const invalidate = useInvalidateRegistration()

  return useMutation({
    mutationFn: (payload: FinalizeMembersPayload) =>
      registrationApi.finalizeMembers(payload),
    onSuccess: invalidate,
  })
}

export function useDocuments() {
  return useQuery({
    queryKey: registrationKeys.documents(),
    queryFn: registrationApi.documents,
  })
}

export function useUpdateDocuments() {
  const invalidate = useInvalidateRegistration()

  return useMutation({
    mutationFn: (payload: DocumentsFormValues) =>
      registrationApi.updateDocuments(payload),
    onSuccess: invalidate,
  })
}

export function usePayment() {
  return useQuery({
    queryKey: registrationKeys.payment(),
    queryFn: registrationApi.payment,
  })
}

export function useSubmitPayment() {
  const invalidate = useInvalidateRegistration()

  return useMutation({
    mutationFn: (payload: PaymentFormValues) =>
      registrationApi.submitPayment(payload),
    onSuccess: invalidate,
  })
}

export function useRegistrationSummary() {
  return useQuery({
    queryKey: registrationKeys.summary(),
    queryFn: registrationApi.summary,
  })
}

export function useSubmitRegistrationVerification() {
  const invalidate = useInvalidateRegistration()

  return useMutation({
    mutationFn: registrationApi.submitForVerification,
    onSuccess: invalidate,
  })
}

