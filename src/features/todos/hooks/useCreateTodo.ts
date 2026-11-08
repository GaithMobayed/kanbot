import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTodo } from '../api/todosApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { CreateTodoRequest } from '../../../types/api'


export function useCreateTodo(projectId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: CreateTodoRequest) => createTodo(projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'todos'],
      })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    createTodo: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
