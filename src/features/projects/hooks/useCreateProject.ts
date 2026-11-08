import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { createProject } from '../api/projectsApi'
import { extractErrorMessage } from '../../../lib/extractError'
import { useNewProjectModalStore } from '../store/newProjectModalStore'
import { useProjectStore } from '../store/projectStore'
import type { CreateProjectRequest } from '../../../types/api'


export function useCreateProject() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const closeModal = useNewProjectModalStore((s) => s.close)

  const mutation = useMutation({
    mutationFn: (body: CreateProjectRequest) => createProject(body),
    onSuccess: (project) => {
      useProjectStore.getState().upsertProject(project)
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      closeModal()
      void navigate(`/projects/${project.id}/backlog`)
    },
  })

  return {
    createProject: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
