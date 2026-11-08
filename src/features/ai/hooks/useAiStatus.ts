import { useQuery } from '@tanstack/react-query'
import { fetchAiStatus } from '../api/aiApi'


export function useAiStatus() {
  return useQuery({
    queryKey: ['ai', 'status'],
    queryFn: fetchAiStatus,
    staleTime: 5 * 60 * 1000,
  })
}
