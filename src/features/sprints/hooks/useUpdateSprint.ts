import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSprint } from '../api/sprintsApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { UpdateSprintRequest } from '../../../types/api'

interface UpdateSprintVariables {
  projectId: string
  sprintId: string
  body: UpdateSprintRequest
}

export function useUpdateSprint() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ sprintId, body }: UpdateSprintVariables) =>
      updateSprint(sprintId, body),
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
    updateSprint: mutation.mutate,
    updateSprintAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    errorMessage: mutation.isError
      ? extractErrorMessage(mutation.error)
      : null,
    reset: mutation.reset,
  }
}
