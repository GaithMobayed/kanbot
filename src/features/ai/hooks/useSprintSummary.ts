import { useQuery } from '@tanstack/react-query'
import { fetchSprintForSummary } from '../api/aiApi'

export function useSprintSummary(sprintId: string, enabled = true) {
  return useQuery({
    queryKey: ['sprints', sprintId],
    queryFn: () => fetchSprintForSummary(sprintId),
    enabled: Boolean(sprintId) && enabled,
  })
}
