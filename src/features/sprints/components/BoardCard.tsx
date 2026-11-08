import type { CSSProperties, KeyboardEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Todo } from '../../../types/api'
import {
  PriorityBadge,
  StoryPointsBadge,
  TypeBadge,
} from '../../../components/common/Badges'

interface BoardCardProps {
  todo: Todo
  onClick?: (todo: Todo) => void
  isOverlay?: boolean
  
  staggerIndex?: number
}

export function BoardCard({
  todo,
  onClick,
  isOverlay = false,
  staggerIndex = 0,
}: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    disabled: isOverlay,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    
    opacity: isDragging ? 0 : 1,
    animationDelay: isOverlay ? undefined : `${staggerIndex * 40}ms`,
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.(todo)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`Todo ${todo.key}: ${todo.title}`}
      onClick={() => onClick?.(todo)}
      onKeyDown={handleKeyDown}
      className={[
        'group flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-sm select-none',
        'transition-[opacity,transform,box-shadow,border-color] duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        isOverlay
          
          ? 'rotate-1 scale-[1.03] shadow-xl ring-2 ring-primary/30 cursor-grabbing border-border'
          
          : 'animate-fade-slide-in cursor-grab active:cursor-grabbing hover:border-text-primary hover:shadow-md',
      ].join(' ')}
    >
      {}
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-caption text-text-secondary">
          {todo.key}
        </span>
        <AssigneeAvatarPlaceholder />
      </div>

      {}
      <h3 className="m-0 font-sans text-body font-normal text-text-primary line-clamp-2 leading-snug">
        {todo.title}
      </h3>

      {}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TypeBadge type={todo.type} />
          <PriorityBadge priority={todo.priority} />
        </div>
        <StoryPointsBadge points={todo.storyPoints} suffix />
      </div>
    </div>
  )
}

function AssigneeAvatarPlaceholder() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-text-secondary"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="8" x2="16" y2="16" />
      <line x1="16" y1="8" x2="8" y2="16" />
    </svg>
  )
}
