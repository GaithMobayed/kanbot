import { useParams } from 'react-router'


export function useProjectId() {
  const { projectId = '' } = useParams()
  return projectId
}
