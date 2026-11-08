import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '../api/projectsApi'
import { useProjectStore } from '../store/projectStore'


export function useProjects() {
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const setProjects = useProjectStore((state) => state.setProjects)

  useEffect(() => {
    if (query.data) {
      setProjects(query.data.projects)
    }
  }, [query.data, setProjects])

  return query
}

export type ProjectsQuery = ReturnType<typeof useProjects>
