import { useProjectId } from '../../../hooks/useProjectId'
import { useBacklogTodos } from '../../todos/hooks/useBacklogTodos'
import { useBacklogFilters } from '../hooks/useBacklogFilters'
import { BacklogToolbar } from '../components/BacklogToolbar'
import { BacklogFilters } from '../components/BacklogFilters'
import { BacklogBoard } from '../components/BacklogBoard'
import { InlineCreateTodo } from '../components/InlineCreateTodo'
import { SprintModalsHost } from '../components/SprintModalsHost'
import { QueryState } from '../../../components/common/QueryState'

export function BacklogPage() {
  const projectId = useProjectId()
  const filters = useBacklogFilters()
  const backlogQuery = useBacklogTodos(projectId, filters.filters)

  return (
    <QueryState
      isLoading={backlogQuery.isLoading}
      isError={backlogQuery.isError}
      error={backlogQuery.error}
    >
      <div className="flex min-h-full flex-col gap-4 p-6">
        <BacklogToolbar projectId={projectId} />
        <BacklogFilters state={filters} />
        <BacklogBoard
          projectId={projectId}
          backlogTodos={backlogQuery.data?.todos ?? []}
          hasActiveFilters={filters.hasActive}
        />
        <InlineCreateTodo projectId={projectId} />
        <SprintModalsHost projectId={projectId} />
      </div>
    </QueryState>
  )
}
