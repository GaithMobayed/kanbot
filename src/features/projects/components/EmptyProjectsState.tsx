
import { PlusIcon } from '../../../components/layout/icons'
import { Button } from '../../../components/Button'
import { EmptyState } from '../../../components/common/EmptyState'

interface EmptyProjectsStateProps {
  searchTerm?: string
  onNewProject?: () => void
}

export function EmptyProjectsState({ searchTerm, onNewProject }: EmptyProjectsStateProps) {
  if (searchTerm) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-sans text-body text-text-secondary">
          No projects match &ldquo;{searchTerm}&rdquo;.
        </p>
      </div>
    )
  }

  return (
    <EmptyState
      title="No Projects yet"
      description="Create your first project to start planning sprints."
      
      action={
        onNewProject && (
          <Button
            type="button"
            onClick={onNewProject}
            variant="primary"
            className="w-auto gap-1.5 px-4 py-2"
          >
            <PlusIcon className="h-4 w-4" />
            New Project
          </Button>
        )
      }
    />
  )
}