import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { useDeleteSprint } from '../../sprints/hooks/useDeleteSprint'
import type { Sprint } from '../../../types/api'

interface DeleteSprintModalProps {
  projectId: string
  sprint: Sprint
  isOpen?: boolean
  onClose: () => void
}


export function DeleteSprintModal({
  projectId,
  sprint,
  isOpen = true,
  onClose,
}: DeleteSprintModalProps) {
  const { deleteSprintAsync, isPending, errorMessage, reset } =
    useDeleteSprint()

  async function handleConfirm() {
    try {
      await deleteSprintAsync({ projectId, sprintId: sprint.id })
      onClose()
    } catch {
      
    }
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <ConfirmDialog
      title="Delete planned sprint?"
      message={`Delete ${sprint.name}? Its todos will be moved back to the backlog.`}
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmLabel="Delete sprint"
      isPending={isPending}
      errorMessage={errorMessage}
      danger
    />
  )
}
