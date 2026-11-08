import { DndContext, DragOverlay } from '@dnd-kit/core'
import { ErrorBanner } from '../../../components/ErrorBanner'
import type { useBoardDragDrop } from '../../board/hooks/useBoardDragDrop'
import { COLUMN_TITLES } from '../../board/hooks/useBoardDragDrop'
import { TODO_STATUSES, type Todo } from '../../../types/api'
import { BoardCard } from './BoardCard'
import { BoardColumn } from './BoardColumn'

interface ActiveSprintBoardProps {
  board: Pick<
    ReturnType<typeof useBoardDragDrop>,
    | 'columns'
    | 'activeTodo'
    | 'dragError'
    | 'sensors'
    | 'handleDragStart'
    | 'handleDragEnd'
  >
  onTodoClick: (todo: Todo) => void
}

export function ActiveSprintBoard({
  board,
  onTodoClick,
}: ActiveSprintBoardProps) {
  const {
    columns,
    activeTodo,
    dragError,
    sensors,
    handleDragStart,
    handleDragEnd,
  } = board

  return (
    <>
      {dragError && <ErrorBanner message={dragError} />}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-wrap gap-2">
          {TODO_STATUSES.map((status, index) => (
            <BoardColumn
              key={status}
              status={status}
              title={COLUMN_TITLES[status]}
              todos={columns[status] ?? []}
              onTodoClick={onTodoClick}
              staggerIndex={index}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeTodo ? <BoardCard todo={activeTodo} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}
