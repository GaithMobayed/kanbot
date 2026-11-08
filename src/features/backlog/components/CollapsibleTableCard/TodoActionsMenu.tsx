import { useId, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { Sprint, Todo } from '../../../../types/api'

interface TodoActionsMenuProps {
  todo: Todo
  dragDisabled: boolean
  listLength: number
  availableSprints: Sprint[]
  onMoveTodo: (todo: Todo, sprintId: string | null, position: number) => void
}

export function TodoActionsMenu({
  todo,
  dragDisabled,
  listLength,
  availableSprints,
  onMoveTodo,
}: TodoActionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  function moveTodoToTop() {
    onMoveTodo(todo, todo.sprintId, 0)
    setMenuOpen(false)
  }

  function moveTodoToBottom() {
    const sprint = availableSprints.find(
      (availableSprint) => availableSprint.id === todo.sprintId,
    )
    const position = sprint
      ? sprint.stats.byStatus[todo.status]
      : listLength
    onMoveTodo(todo, todo.sprintId, position)
    setMenuOpen(false)
  }

  function moveTodoToSprint(sprintId: string) {
    const sprint = availableSprints.find(
      (availableSprint) => availableSprint.id === sprintId,
    )
    if (!sprint) return

    onMoveTodo(todo, sprint.id, sprint.stats.byStatus[todo.status])
    setMenuOpen(false)
  }

  function moveTodoToBacklog() {
    onMoveTodo(todo, null, 0)
    setMenuOpen(false)
  }

  return (
    <div className="relative z-50">
      <button
        type="button"
        aria-label={`More actions for ${todo.key}`}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-md p-1.5 text-text-secondary hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      {menuOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={`Move ${todo.key}`}
          className="absolute right-0 z-50 mt-1 flex min-w-44 origin-top-right animate-menu-enter flex-col rounded-md border border-border bg-surface p-1 shadow motion-reduce:animate-none"
        >
          {!dragDisabled && (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={moveTodoToTop}
                className="rounded px-3 py-2 text-left font-sans text-caption text-text-primary hover:bg-surface-subtle"
              >
                Move to top
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={moveTodoToBottom}
                className="rounded px-3 py-2 text-left font-sans text-caption text-text-primary hover:bg-surface-subtle"
              >
                Move to bottom
              </button>
            </>
          )}
          {todo.sprintId && (
            <button
              type="button"
              role="menuitem"
              onClick={moveTodoToBacklog}
              className="rounded px-3 py-2 text-left font-sans text-caption text-text-primary hover:bg-surface-subtle"
            >
              Move to backlog
            </button>
          )}
          {availableSprints
            .filter((sprint) => sprint.id !== todo.sprintId)
            .map((sprint) => (
              <button
                key={sprint.id}
                type="button"
                role="menuitem"
                onClick={() => moveTodoToSprint(sprint.id)}
                className="rounded px-3 py-2 text-left font-sans text-caption text-text-primary hover:bg-surface-subtle"
              >
                Move to {sprint.name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
