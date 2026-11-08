import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkCreateTodos } from '../api/aiApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { BulkCreateTodosRequest } from '../../../types/api'

interface BulkCreateVariables {
  projectId: string
  body: BulkCreateTodosRequest
}


export function useBulkCreateTodos() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ projectId, body }: BulkCreateVariables) =>
      bulkCreateTodos(projectId, body),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'todos'],
      })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    bulkCreate: mutation.mutate,
    bulkCreateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
