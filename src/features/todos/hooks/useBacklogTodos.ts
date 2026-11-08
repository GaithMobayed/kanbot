import { useQuery } from '@tanstack/react-query'
import { fetchTodos } from '../api/todosApi'
import type { TodoListQuery } from '../../../types/api'


export function useBacklogTodos(
  projectId: string,
  filters: Pick<TodoListQuery, 'search' | 'priority' | 'type'> = {},
) {
  return useQuery({
    queryKey: ['projects', projectId, 'todos', 'backlog', filters],
    queryFn: () =>
      fetchTodos(projectId, { sprintId: 'backlog', ...filters }),
    enabled: Boolean(projectId),
  })
}
