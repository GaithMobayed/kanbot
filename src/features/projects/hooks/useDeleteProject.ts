import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProject } from '../api/projectsApi'
import { extractErrorMessage } from '../../../lib/extractError'
import { useProjectStore } from '../store/projectStore'


export function useDeleteProject() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_data, projectId) => {
      useProjectStore.getState().removeProject(projectId)
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    deleteProject: mutation.mutate,
    isPending: mutation.isPending,
    deletingId: mutation.variables ?? null,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
