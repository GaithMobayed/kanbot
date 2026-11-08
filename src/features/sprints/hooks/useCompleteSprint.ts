import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeSprint } from '../api/sprintsApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { CompleteSprintRequest } from '../../../types/api'

interface CompleteSprintVariables {
  projectId: string
  sprintId: string
  body: CompleteSprintRequest
}

export function useCompleteSprint() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ sprintId, body }: CompleteSprintVariables) =>
      completeSprint(sprintId, body),
    onSuccess: (_data, { projectId, sprintId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'sprints'],
      })
      void queryClient.invalidateQueries({
        queryKey: ['sprints', sprintId, 'board'],
      })
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'todos'],
      })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    completeSprint: mutation.mutate,
    completeSprintAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
