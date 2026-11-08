import { useState } from 'react'
import { Button } from '../../../components/Button'
import { TodoDetailsModal } from '../../../components/TodoDetailsModal'
import { useAssistantStore } from '../../ai/store/assistantStore'
import { useSprintModal } from '../store/sprintModalStore'

interface BacklogToolbarProps {
  projectId: string
}


export function BacklogToolbar({ projectId }: BacklogToolbarProps) {
  const openGenerateTodos = useAssistantStore((s) => s.openGenerateTodos)
  const openPlanSprint = useAssistantStore((s) => s.openPlanSprint)
  const openSprintModal = useSprintModal((state) => state.open)
  const [isCreateTodoOpen, setIsCreateTodoOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => openGenerateTodos(projectId)}
          variant="secondary"
          className="flex-1 px-4 py-4"
        >
          Generate todos with AI
        </Button>
        <Button
          type="button"
          onClick={() => openPlanSprint(projectId)}
          variant="secondary"
          className="flex-1 px-4 py-4"
        >
          Plan sprint with AI
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsCreateTodoOpen(true)}
          className="flex-1 px-4 py-2"
        >
          Create todo
        </Button>
        <Button
          type="button"
          onClick={() => openSprintModal({ type: 'create' })}
          variant="primary"
          className="flex-1 px-4 py-4"
        >
          + Create sprint
        </Button>
      </div>

      {isCreateTodoOpen && (
        <TodoDetailsModal
          isOpen
          projectId={projectId}
          onClose={() => setIsCreateTodoOpen(false)}
        />
      )}
    </>
  )
}
