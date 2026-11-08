import { useMutation, useQueryClient } from '@tanstack/react-query'
import { summarizeSprint } from '../api/aiApi'
import { extractErrorMessage } from '../../../lib/extractError'

interface SummarizeSprintVariables {
  sprintId: string
  projectId: string
}

export function useSummarizeSprint() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ sprintId }: SummarizeSprintVariables) =>
      summarizeSprint(sprintId),
    onSuccess: (_data, { sprintId, projectId }) => {
      void queryClient.invalidateQueries({ queryKey: ['sprints', sprintId] })
      void queryClient.invalidateQueries({
        queryKey: ['sprints', sprintId, 'board'],
      })
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'sprints'],
      })
    },
  })

  return {
    summarizeSprint: mutation.mutate,
    summarizeSprintAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
