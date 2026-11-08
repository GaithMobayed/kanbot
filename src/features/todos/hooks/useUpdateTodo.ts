import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTodo } from '../api/todosApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { UpdateTodoRequest } from '../../../types/api'

interface UpdateTodoVariables {
  projectId: string
  todoId: string
  body: UpdateTodoRequest
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ todoId, body }: UpdateTodoVariables) =>
      updateTodo(todoId, body),
    onSuccess: (_todo, { projectId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'todos'],
      })
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'sprints'],
      })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    updateTodo: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError
      ? extractErrorMessage(mutation.error)
      : null,
    reset: mutation.reset,
  }
}
