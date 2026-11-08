import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startSprint } from '../api/sprintsApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { StartSprintRequest } from '../../../types/api'

interface StartSprintVariables {
  projectId: string
  sprintId: string
  body?: StartSprintRequest
}

export function useStartSprint() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ sprintId, body }: StartSprintVariables) =>
      startSprint(sprintId, body),
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
    startSprint: mutation.mutate,
    startSprintAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
