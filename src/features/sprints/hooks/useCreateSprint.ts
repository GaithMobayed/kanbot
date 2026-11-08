import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSprint } from '../api/sprintsApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { CreateSprintRequest } from '../../../types/api'

interface CreateSprintVariables {
  projectId: string
  body: CreateSprintRequest
}

export function useCreateSprint() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ projectId, body }: CreateSprintVariables) =>
      createSprint(projectId, body),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'sprints'],
      })
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'todos'],
      })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    createSprint: mutation.mutate,
    createSprintAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
