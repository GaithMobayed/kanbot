import type { CSSProperties } from 'react'
import { memo, useId, useMemo, useState } from 'react'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Sprint, Todo } from '../../../../types/api'
import { TableHeader } from './TableHeader'
import { TodoRow } from './TodoRow'

interface CollapsibleTableCardProps {
  title: string
  todos: Todo[]
  showActions?: boolean
  onEdit?: () => void
  onStartSprint?: () => void
  onDelete?: () => void
  startDisabled?: boolean
  startDisabledReason?: string
  listId?: string
  dragDisabled?: boolean
  availableSprints?: Sprint[]
  onMoveTodo?: (todo: Todo, sprintId: string | null, position: number) => void
  onDeleteTodo?: (todo: Todo) => void
  emptyMessage?: string
  
  
  onTodoClick?: (todo: Todo) => void
  
  staggerIndex?: number
}

export const CollapsibleTableCard = memo(function CollapsibleTableCard({
  title,
  todos,
  showActions = false,
  onEdit,
  onStartSprint,
  onDelete,
  startDisabled = false,
  startDisabledReason,
  listId,
  dragDisabled = false,
  availableSprints = [],
  onMoveTodo,
  onDeleteTodo,
  emptyMessage = 'No todos in the backlog yet.',
  onTodoClick,
  staggerIndex = 0,
}: CollapsibleTableCardProps) {
  const [collapsed, setCollapsed] = useState(false)
  const bodyId = useId()

  const { setNodeRef, isOver } = useDroppable({
    id: listId ?? `disabled-list-${title}`,
    disabled: !listId,
  })

  
  
  
  const sortableIds = useMemo(() => todos.map((todo) => todo.id), [todos])

  const totalPoints = todos.reduce((sum, todo) => sum + (todo.storyPoints ?? 0), 0)
  const canStartSprint = todos.length > 0

  return (
    <section
      className="animate-fade-slide-in flex flex-col rounded-lg border border-border bg-surface shadow"
      style={{ animationDelay: `${staggerIndex * 60}ms` } as CSSProperties}
    >
      <TableHeader
        title={title}
        todosCount={todos.length}
        totalPoints={totalPoints}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        bodyId={bodyId}
        showActions={showActions}
        onEdit={onEdit}
        onDelete={onDelete}
        onStartSprint={canStartSprint ? onStartSprint : undefined}
        startDisabled={startDisabled}
        startDisabledReason={startDisabledReason}
      />

      {startDisabled && startDisabledReason && (
        <div className="bg-warning-bg px-5 py-2 text-label text-text-warning">
          <p id={`${bodyId}-start-reason`}>{startDisabledReason}</p>
        </div>
      )}

      {!collapsed && (
        <div
          id={bodyId}
          ref={setNodeRef}
          className={[
            'transition-[box-shadow] duration-150',
            
            isOver && todos.length > 0
              ? 'ring-2 ring-inset ring-primary/30 rounded-b-lg'
              : '',
          ].join(' ')}
        >
          {todos.length === 0 ? (
            <div
              className={[
                'flex flex-col items-center gap-3 border-t border-border px-5 py-6 text-center',
                'rounded-b-lg transition-colors duration-150',
                isOver ? 'bg-nav-hover' : '',
              ].join(' ')}
            >
              <p className="m-0 font-sans text-body text-text-secondary">
                {emptyMessage}
              </p>
            </div>
          ) : (
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {todos.map((todo, index) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  listId={listId}
                  dragDisabled={dragDisabled}
                  listLength={todos.length}
                  availableSprints={availableSprints}
                  onMoveTodo={onMoveTodo}
                  onDeleteTodo={onDeleteTodo}
                  onTodoClick={onTodoClick}
                  staggerIndex={index}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </section>
  )
})
