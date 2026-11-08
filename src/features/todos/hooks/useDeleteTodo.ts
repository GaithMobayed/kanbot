import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'
import { deleteTodo } from '../api/todosApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { TodoListResponse } from '../../../types/api'

interface DeleteTodoVariables {
  projectId: string
  todoId: string
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ todoId }: DeleteTodoVariables) => deleteTodo(todoId),
    onMutate: async ({ projectId, todoId }) => {
      const queryKey: QueryKey = ['projects', projectId, 'todos']
      await queryClient.cancelQueries({ queryKey })
      const previousLists =
        queryClient.getQueriesData<TodoListResponse>({ queryKey })

      for (const [key, list] of previousLists) {
        if (list) {
          queryClient.setQueryData<TodoListResponse>(key, {
            todos: list.todos.filter((todo) => todo.id !== todoId),
          })
        }
      }

      return { previousLists }
    },
    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: (_data, _error, { projectId }) => {
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
    deleteTodo: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError
      ? extractErrorMessage(mutation.error)
      : null,
    reset: mutation.reset,
  }
}
