import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProject } from '../api/projectsApi'
import { extractErrorMessage } from '../../../lib/extractError'
import { useNewProjectModalStore } from '../store/newProjectModalStore'
import { useProjectStore } from '../store/projectStore'
import type { UpdateProjectRequest } from '../../../types/api'

export function useUpdateProject() {
  const queryClient = useQueryClient()
  const closeModal = useNewProjectModalStore((s) => s.close)

  const mutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProjectRequest }) =>
      updateProject(id, body),
    onSuccess: (project) => {
      useProjectStore.getState().upsertProject(project)
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      closeModal()
    },
  })

  return {
    updateProject: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
