import { useQuery } from '@tanstack/react-query'
import { fetchProjectSprints } from '../api/sprintsApi'
import type { Sprint } from '../../../types/api'

export function useProjectSprints(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['projects', projectId, 'sprints'],
    queryFn: () => fetchProjectSprints(projectId),
    enabled: Boolean(projectId) && enabled,
  })
}

export function useActiveSprint(projectId: string, enabled = true) {
  const query = useProjectSprints(projectId, enabled)

  const sprints = query.data?.sprints ?? []
  const activeSprint: Sprint | null =
    sprints.find((sprint) => sprint.status === 'active') ?? null
  const plannedSprints = sprints.filter((sprint) => sprint.status === 'planned')

  return {
    activeSprint,
    hasActiveSprint: Boolean(activeSprint),
    sprints,
    plannedSprints,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
