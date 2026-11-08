
import { useState } from 'react'
import { useDeleteProject } from '../hooks/useDeleteProject'
import type { ProjectWithStats } from '../../../types/api'

export function useProjectDeleteDialog() {
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithStats | null>(null)
  const { deleteProject, isPending :isDeleting, errorMessage, reset } = useDeleteProject()

  function handleConfirmDelete() {
    if (!projectToDelete) return
    reset()
    deleteProject(projectToDelete.id, {
      onSuccess: () => setProjectToDelete(null),
    })
  }

  function handleClose() {
    reset()
    setProjectToDelete(null)
  }

  return {
    projectToDelete,
    setProjectToDelete,
    isDeleting,
    deleteErrorMessage: errorMessage,
    handleConfirmDelete,
    handleClose,
  }
}