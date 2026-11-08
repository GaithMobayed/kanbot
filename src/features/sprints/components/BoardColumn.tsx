import type { CSSProperties } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Todo, TodoStatus } from '../../../types/api'
import { BoardCard } from './BoardCard'

interface BoardColumnProps {
  status: TodoStatus
  title: string
  todos: Todo[]
  onTodoClick: (todo: Todo) => void
  
  staggerIndex?: number
}

export function BoardColumn({
  status,
  title,
  todos,
  onTodoClick,
  staggerIndex = 0,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={[
        'animate-fade-slide-in flex flex-1 max-w-card flex-col rounded-lg p-3',
        
        'bg-surface-subtle',
        'transition-[background-color,box-shadow] duration-200',
        
        isOver ? 'ring-2 ring-inset ring-primary/40 bg-nav-hover' : '',
      ].join(' ')}
      style={{ animationDelay: `${staggerIndex * 80}ms` } as CSSProperties}
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="m-0 font-sans text-label font-bold text-text-primary">
          {title}
        </h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface px-1.5 font-sans text-caption text-text-secondary shadow-xs">
          {todos.length}
        </span>
      </div>

      {/* Column Cards */}
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto min-h-40">
          {todos.length === 0 ? (
            <div
              className={[
                'flex flex-1 items-center justify-center rounded-md border border-dashed p-4 text-center',
                'transition-colors duration-150',
                isOver
                  ? 'border-primary bg-nav-hover'
                  : 'border-border',
              ].join(' ')}
            >
              <p className="m-0 font-sans text-caption text-text-secondary">
                No items
              </p>
            </div>
          ) : (
            todos.map((todo, index) => (
              <BoardCard
                key={todo.id}
                todo={todo}
                onClick={onTodoClick}
                staggerIndex={index}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
