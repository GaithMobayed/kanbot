import { useQuery } from '@tanstack/react-query'
import { fetchSprintBoard } from '../api/sprintsApi'

export function useActiveSprintBoard(sprintId: string | undefined | null) {
  return useQuery({
    queryKey: ['sprints', sprintId, 'board'],
    queryFn: () => {
      if (!sprintId) {
        throw new Error('Sprint ID is required')
      }
      return fetchSprintBoard(sprintId)
    },
    enabled: Boolean(sprintId),
  })
}
