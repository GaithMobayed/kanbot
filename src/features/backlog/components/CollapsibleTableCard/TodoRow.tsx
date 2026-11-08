import type { CSSProperties } from 'react'
import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { PriorityBadge, StoryPointsBadge, TypeBadge } from '../../../../components/common/Badges'
import type { Sprint, Todo } from '../../../../types/api'
import { TodoActionsMenu } from './TodoActionsMenu'

interface TodoRowProps {
  todo: Todo
  listId?: string
  dragDisabled: boolean
  listLength: number
  availableSprints: Sprint[]
  onMoveTodo?: (todo: Todo, sprintId: string | null, position: number) => void
  onDeleteTodo?: (todo: Todo) => void
  
  
  onTodoClick?: (todo: Todo) => void
  
  staggerIndex?: number
}

export const TodoRow = memo(function TodoRow({
  todo,
  listId,
  dragDisabled,
  listLength,
  availableSprints,
  onMoveTodo,
  onDeleteTodo,
  onTodoClick,
  staggerIndex = 0,
}: TodoRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: { containerId: listId },
    disabled: dragDisabled || !listId,
  })

  return (
    <div
      ref={setNodeRef}
      style={
        {
          transform: CSS.Transform.toString(transform),
          transition,
          
          opacity: isDragging ? 0 : 1,
          animationDelay: `${staggerIndex * 30}ms`,
        } as CSSProperties
      }
      className="animate-fade-slide-in relative flex items-center justify-between gap-3 border-t border-border px-3 py-2 transition-[opacity,transform] duration-150 hover:bg-surface-subtle sm:px-5 sm:py-3"
    >
      {isDragging ? (
        
        <div className="h-10 w-full rounded-md border border-dashed border-border bg-surface-subtle" />
      ) : (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {}
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className={[
                'shrink-0 touch-none rounded-md p-1 text-text-secondary transition-colors duration-150',
                dragDisabled
                  ? 'cursor-not-allowed opacity-40'
                  : 'cursor-grab active:cursor-grabbing hover:bg-nav-hover hover:text-text-primary',
              ].join(' ')}
              aria-label={`Reorder ${todo.key}`}
              disabled={dragDisabled || !listId}
            >
              <GripVertical className="h-5 w-5" aria-hidden="true" />
            </button>

            {}
            <button
              type="button"
              onClick={() => onTodoClick?.(todo)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={`Open ${todo.key}: ${todo.title}`}
            >
              <span className="shrink-0 rounded-sm bg-primary px-2 py-0.5 font-sans text-caption text-text-inverse">
                {todo.key}
              </span>
              <span className="truncate font-sans text-body text-text-primary">
                {todo.title}
              </span>
              {todo.labels.length > 0 && (
                <ul
                  aria-label={`${todo.title} labels`}
                  className="hidden min-w-0 flex-wrap gap-1 md:flex"
                >
                  {todo.labels.map((label) => (
                    <li
                      key={label}
                      className="rounded-sm bg-surface-subtle px-2 py-0.5 font-sans text-caption text-text-secondary"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <TypeBadge type={todo.type} />
              <PriorityBadge priority={todo.priority} />
              <StoryPointsBadge points={todo.storyPoints} />
            </div>
            {onMoveTodo && (
              <TodoActionsMenu
                todo={todo}
                dragDisabled={dragDisabled}
                listLength={listLength}
                availableSprints={availableSprints}
                onMoveTodo={onMoveTodo}
              />
            )}
            {onDeleteTodo && (
              <button
                type="button"
                aria-label={`Delete ${todo.key}`}
                title={`Delete ${todo.key}`}
                onClick={() => onDeleteTodo(todo)}
                className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-danger-bg hover:text-text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-danger"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
})



interface TodoRowOverlayProps {
  todo: Todo
}






export function TodoRowOverlay({ todo }: TodoRowOverlayProps) {
  return (
    <div
      className={[
        'relative flex items-center justify-between gap-3 px-3 py-2 sm:px-5 sm:py-3',
        'rounded-md border border-border bg-surface shadow-lg',
        'ring-2 ring-primary/30',
        'rotate-1 cursor-grabbing select-none',
        'animate-fade-in',
      ].join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <GripVertical className="h-5 w-5 shrink-0 text-text-secondary" aria-hidden="true" />
        <span className="shrink-0 rounded-sm bg-primary px-2 py-0.5 font-sans text-caption text-text-inverse">
          {todo.key}
        </span>
        <span className="truncate font-sans text-body text-text-primary">
          {todo.title}
        </span>
      </div>
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <TypeBadge type={todo.type} />
        <PriorityBadge priority={todo.priority} />
        <StoryPointsBadge points={todo.storyPoints} />
      </div>
    </div>
  )
}
