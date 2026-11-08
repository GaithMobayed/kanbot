import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'
import { moveTodo } from '../api/todosApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { MoveTodoRequest, Todo, TodoListResponse } from '../../../types/api'

interface MoveTodoVariables {
  projectId: string
  sprintId?: string | null
  todoId: string
  body: MoveTodoRequest
}

export function useMoveTodo() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ todoId, body }: MoveTodoVariables) => moveTodo(todoId, body),
    onMutate: async ({ projectId, todoId, body }) => {
      const todosKey: QueryKey = ['projects', projectId, 'todos']
      await queryClient.cancelQueries({ queryKey: todosKey })
      const previousLists =
        queryClient.getQueriesData<TodoListResponse>({ queryKey: todosKey })

      const sourceTodo = previousLists
        .flatMap(([, response]) => response?.todos ?? [])
        .find((todo) => todo.id === todoId)

      if (!sourceTodo) {
        return { previousLists }
      }

      const targetSprintId =
        body.sprintId === undefined ? sourceTodo.sprintId : body.sprintId
      const optimisticTodo: Todo = {
        ...sourceTodo,
        sprintId: targetSprintId,
        status: body.status ?? sourceTodo.status,
      }

      for (const [queryKey, response] of previousLists) {
        if (!response) continue
        const listKind = queryKey[3]
        const listSprintId =
          listKind === 'backlog'
            ? null
            : listKind === 'sprint' && typeof queryKey[4] === 'string'
              ? queryKey[4]
              : undefined

        if (listSprintId === undefined) continue

        const filters = queryKey[4]
        const shouldInclude =
          listSprintId === targetSprintId &&
          matchesTodoFilters(
            optimisticTodo,
            listKind === 'backlog' ? filters : undefined,
          )
        let nextTodos = response.todos.filter((todo) => todo.id !== todoId)

        if (shouldInclude) {
          if (listKind === 'backlog') {
            const position = Math.max(
              0,
              Math.min(body.position, nextTodos.length),
            )
            nextTodos = [
              ...nextTodos.slice(0, position),
              optimisticTodo,
              ...nextTodos.slice(position),
            ]
          } else {
            const sameStatusTodos = nextTodos.filter(
              (todo) => todo.status === optimisticTodo.status,
            )
            const statusPosition = Math.max(
              0,
              Math.min(body.position, sameStatusTodos.length),
            )
            const anchorTodo = sameStatusTodos[statusPosition]
            let lastMatchingIndex = -1
            nextTodos.forEach((todo, index) => {
              if (todo.status === optimisticTodo.status) {
                lastMatchingIndex = index
              }
            })
            const insertionIndex = anchorTodo
              ? nextTodos.findIndex((todo) => todo.id === anchorTodo.id)
              : lastMatchingIndex < 0
                ? nextTodos.length
                : lastMatchingIndex + 1
            nextTodos.splice(insertionIndex, 0, optimisticTodo)
          }
        }

        if (listKind === 'backlog') {
          queryClient.setQueryData<TodoListResponse>(queryKey, {
            todos: nextTodos.map((todo, index) => ({ ...todo, order: index })),
          })
        } else {
          const positionsByStatus = new Map<string, number>()
          queryClient.setQueryData<TodoListResponse>(queryKey, {
            todos: nextTodos.map((todo) => {
              const position = positionsByStatus.get(todo.status) ?? 0
              positionsByStatus.set(todo.status, position + 1)
              return { ...todo, order: position }
            }),
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
    onSettled: (_data, _error, { projectId, sprintId, body }) => {
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'todos'],
      })
      void queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'sprints'],
      })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      for (const boardSprintId of new Set(
        [sprintId, body.sprintId].filter(
          (id): id is string => Boolean(id),
        ),
      )) {
        void queryClient.invalidateQueries({
          queryKey: ['sprints', boardSprintId, 'board'],
        })
      }
    },
  })

  return {
    moveTodo: mutation.mutate,
    moveTodoAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}

function matchesTodoFilters(todo: Todo, filters: unknown): boolean {
  if (!filters || typeof filters !== 'object') return true

  const options = filters as {
    search?: string
    priority?: string
    type?: string
  }
  if (options.priority && todo.priority !== options.priority) return false
  if (options.type && todo.type !== options.type) return false
  if (options.search) {
    const search = options.search.toLocaleLowerCase()
    const searchable = [
      todo.key,
      todo.title,
      todo.description,
      ...todo.labels,
    ]
      .join(' ')
      .toLocaleLowerCase()
    if (!searchable.includes(search)) return false
  }
  return true
}
