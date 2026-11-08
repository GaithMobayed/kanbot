import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSprint } from '../api/sprintsApi'
import { extractErrorMessage } from '../../../lib/extractError'

interface DeleteSprintVariables {
  projectId: string
  sprintId: string
}

export function useDeleteSprint() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ sprintId }: DeleteSprintVariables) =>
      deleteSprint(sprintId),
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
    deleteSprint: mutation.mutate,
    deleteSprintAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    errorMessage: mutation.isError
      ? extractErrorMessage(mutation.error)
      : null,
    reset: mutation.reset,
  }
}
