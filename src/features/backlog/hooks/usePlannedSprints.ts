import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useProjectSprints } from '../../sprints/hooks/useProjectSprints'
import { fetchTodos } from '../../todos/api/todosApi'
import type { Sprint } from '../../../types/api'


export function usePlannedSprints(projectId: string) {
  const sprintsQuery = useProjectSprints(projectId)
  const sprints = sprintsQuery.data?.sprints ?? []

  const planned = sprints.filter((sprint) => sprint.status === 'planned')

  
  
  
  
  const sprintIds = planned.map((s) => s.id).join(',')
  const queriesConfig = useMemo(
    () =>
      planned.map((sprint) => ({
        queryKey: ['projects', projectId, 'todos', 'sprint', sprint.id],
        queryFn: () => fetchTodos(projectId, { sprintId: sprint.id }),
        enabled: Boolean(projectId),
      })),
    
    [sprintIds, projectId],
  )

  const todoQueries = useQueries({ queries: queriesConfig })

  const active: Sprint | null =
    sprints.find((sprint) => sprint.status === 'active') ?? null

  return {
    planned,
    active,
    available: sprints.filter(
      (sprint) => sprint.status === 'planned' || sprint.status === 'active',
    ),
    todoQueries,
    isLoading:
      sprintsQuery.isLoading || todoQueries.some((query) => query.isLoading),
    error:
      sprintsQuery.error ?? todoQueries.find((query) => query.error)?.error ?? null,
  }
}
