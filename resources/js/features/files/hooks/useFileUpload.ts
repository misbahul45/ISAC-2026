import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fileApi } from '../api/fileApi'
import type { RegisterFilePayload } from '../types/fileTypes'

export function useFileUpload() {
  const queryClient = useQueryClient()
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterFilePayload) => fileApi.register(payload),
  })

  return {
    authenticate: () => queryClient.fetchQuery({
      queryKey: ['files', 'imagekit-auth', Date.now()],
      queryFn: fileApi.imageKitAuth,
      staleTime: 0,
    }),
    registerFile: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
  }
}
