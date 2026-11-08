import { useCallback, useMemo, useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { Todo } from '../../../types/api'
import { usePlannedSprints } from '../hooks/usePlannedSprints'
import { useBacklogDragAndDrop } from '../hooks/useBacklogDragAndDrop'
import { useSprintModal } from '../store/sprintModalStore'
import { CollapsibleTableCard } from './CollapsibleTableCard/CollapsibleTableCard'
import { TodoRowOverlay } from './CollapsibleTableCard/TodoRow'
import { TodoDetailsModal } from '../../../components/TodoDetailsModal'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { useDeleteTodo } from '../../todos/hooks/useDeleteTodo'

interface BacklogBoardProps {
  projectId: string
  backlogTodos: Todo[]
  hasActiveFilters: boolean
}

export function BacklogBoard({
  projectId,
  backlogTodos,
  hasActiveFilters,
}: BacklogBoardProps) {
  const { planned, active, available, todoQueries, isLoading, error } =
    usePlannedSprints(projectId)
  const openModal = useSprintModal((state) => state.open)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null)

  const {
    deleteTodo,
    isPending: isDeletingTodo,
    errorMessage: deleteTodoError,
    reset: resetDeleteTodo,
  } = useDeleteTodo()

  
  
  
const sprintCallbacks = useMemo(
  () =>
    planned.reduce<
      Record<
        string,
        { onEdit: () => void; onDelete: () => void; onStartSprint: () => void }
      >
    >((acc, sprint) => {
      acc[sprint.id] = {
        onEdit: () => openModal({ type: 'edit', sprint }),
        onDelete: () => openModal({ type: 'delete', sprint }),
        onStartSprint: () => openModal({ type: 'start', sprint }),
      }

      return acc
    }, {}),
  [planned, openModal],
)

  const requestDeleteTodo = useCallback(
    (todo: Todo) => {
      resetDeleteTodo()
      setTodoToDelete(todo)
    },
    [resetDeleteTodo],
  )

  const {
    sensors,
    moveError,
    moveTodo,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeTodo,
    getEffectiveTodos,
  } = useBacklogDragAndDrop({
    projectId,
    backlogTodos,
    plannedSprints: planned,
    sprintTodosQueries: todoQueries,
    hasActiveFilters,
  })

  function confirmDeleteTodo() {
    if (!todoToDelete) return
    deleteTodo(
      { projectId, todoId: todoToDelete.id },
      { onSuccess: () => setTodoToDelete(null) },
    )
  }

  function closeDeleteTodoDialog() {
    if (isDeletingTodo) return
    setTodoToDelete(null)
    resetDeleteTodo()
  }

  const activeDisabledReason = active
    ? `${active.name} is still active. Complete it before starting another sprint.`
    : undefined

  return (
    <>
      {moveError && <ErrorBanner message={moveError} />}
      {deleteTodoError && !todoToDelete && (
        <ErrorBanner message={deleteTodoError} />
      )}
      {error && (
        <ErrorBanner
          message={
            error instanceof Error ? error.message : 'Could not load sprints.'
          }
        />
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {isLoading ? (
          <p className="m-0 font-sans text-body text-text-secondary">
            Loading planned sprints…
          </p>
        ) : planned.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-5 py-4">
            <p className="m-0 font-sans text-body text-text-secondary">
              No planned sprints yet. Create one to organize backlog work.
            </p>
          </div>
        ) : (
          planned.map((sprint, index) => {
            const cbs = sprintCallbacks[sprint.id]
            return (
              <CollapsibleTableCard
                key={sprint.id}
                title={sprint.name}
                todos={getEffectiveTodos(sprint.id)}
                listId={sprint.id}
                dragDisabled={false}
                availableSprints={available}
                onMoveTodo={moveTodo}
                onDeleteTodo={requestDeleteTodo}
                showActions
                onEdit={cbs?.onEdit}
                onDelete={cbs?.onDelete}
                onStartSprint={cbs?.onStartSprint}
                startDisabled={Boolean(active)}
                startDisabledReason={activeDisabledReason}
                emptyMessage="No todos in this sprint yet. Drag todos here or use their actions menu."
                onTodoClick={setSelectedTodo}
                staggerIndex={index}
              />
            )
          })
        )}

        <CollapsibleTableCard
          title="Backlog"
          todos={getEffectiveTodos('backlog')}
          listId="backlog"
          dragDisabled={hasActiveFilters}
          availableSprints={available}
          onMoveTodo={moveTodo}
          onDeleteTodo={requestDeleteTodo}
          emptyMessage={
            hasActiveFilters
              ? 'No todos match the current search and filters.'
              : 'Your backlog is empty.'
          }
          onTodoClick={setSelectedTodo}
          staggerIndex={planned.length}
        />

        {}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeTodo ? <TodoRowOverlay todo={activeTodo} /> : null}
        </DragOverlay>
      </DndContext>

      {selectedTodo && (
        <TodoDetailsModal
          key={selectedTodo.id}
          isOpen
          projectId={projectId}
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
        />
      )}

      <ConfirmDialog
        title="Delete todo"
        message={
          todoToDelete
            ? `Are you sure you want to delete ${todoToDelete.key}: "${todoToDelete.title}"? This cannot be undone.`
            : ''
        }
        isOpen={Boolean(todoToDelete)}
        onClose={closeDeleteTodoDialog}
        onConfirm={confirmDeleteTodo}
        confirmLabel="Delete"
        isPending={isDeletingTodo}
        errorMessage={deleteTodoError}
        danger
      />
    </>
  )
}
