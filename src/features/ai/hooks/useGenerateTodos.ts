import { useMutation } from '@tanstack/react-query'
import { generateTodos } from '../api/aiApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { GenerateTodosRequest } from '../../../types/api'

interface GenerateTodosVariables {
  projectId: string
  body: GenerateTodosRequest
}


export function useGenerateTodos() {
  const mutation = useMutation({
    mutationFn: ({ projectId, body }: GenerateTodosVariables) =>
      generateTodos(projectId, body),
  })

  return {
    generateTodos: mutation.mutate,
    generateTodosAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    data: mutation.data,
    reset: mutation.reset,
  }
}
