import { useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useMoveTodo } from '../../todos/hooks/useMoveTodo'
import {
  TODO_STATUSES,
  type Todo,
  type TodoStatus,
} from '../../../types/api'

export const COLUMN_TITLES: Record<TodoStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

const EMPTY_COLUMNS: Record<TodoStatus, Todo[]> = {
  todo: [],
  in_progress: [],
  in_review: [],
  done: [],
}

export function findContainer(
  columns: Record<TodoStatus, Todo[]>,
  id: string,
): TodoStatus | null {
  if (id in columns) {
    return id as TodoStatus
  }

  for (const status of TODO_STATUSES) {
    if (columns[status].some((todo) => todo.id === id)) {
      return status
    }
  }

  return null
}

interface UseBoardDragDropOptions {
  projectId: string
  sprintId?: string | null
  initialColumns?: Record<TodoStatus, Todo[]>
}

export function useBoardDragDrop({
  projectId,
  sprintId,
  initialColumns,
}: UseBoardDragDropOptions) {
  const [localBoard, setLocalBoard] = useState<{
    source: Record<TodoStatus, Todo[]> | undefined
    columns: Record<TodoStatus, Todo[]>
  } | null>(null)
  const columns =
    localBoard !== null && localBoard.source === initialColumns
      ? localBoard.columns
      : initialColumns ?? EMPTY_COLUMNS

  function updateColumns(nextColumns: Record<TodoStatus, Todo[]>) {
    setLocalBoard({ source: initialColumns, columns: nextColumns })
  }

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)
  const [dragError, setDragError] = useState<string | null>(null)

  const { moveTodoAsync, errorMessage: moveErrorMessage } = useMoveTodo()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const activeId = String(active.id)
    setDragError(null)
    const sourceStatus = findContainer(columns, activeId)
    if (sourceStatus) {
      const todo = columns[sourceStatus].find((t) => t.id === activeId)
      if (todo) {
        setActiveTodo(todo)
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const draggedTodo = activeTodo
    setActiveTodo(null)

    if (!over || !sprintId || !draggedTodo) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const sourceStatus = findContainer(columns, activeId)
    const targetStatus = findContainer(columns, overId)

    if (!sourceStatus || !targetStatus || sourceStatus === targetStatus) return

    const sourceList = columns[sourceStatus]
    const targetList = columns[targetStatus]
    const targetCardIndex = targetList.findIndex((todo) => todo.id === overId)
    const targetIndex =
      targetCardIndex === -1 ? targetList.length : targetCardIndex
    const previousColumns = columns
    const updatedTodo = { ...draggedTodo, status: targetStatus }

    updateColumns({
      ...columns,
      [sourceStatus]: sourceList.filter((todo) => todo.id !== activeId),
      [targetStatus]: [
        ...targetList.slice(0, targetIndex),
        updatedTodo,
        ...targetList.slice(targetIndex),
      ],
    })

    try {
      await moveTodoAsync({
        projectId,
        sprintId,
        todoId: activeId,
        body: {
          status: targetStatus,
          position: targetIndex,
        },
      })
      setDragError(null)
    } catch (err: unknown) {
      setDragError(
        err instanceof Error
          ? err.message
          : 'Failed to move todo to another column',
      )
      updateColumns(previousColumns)
    }
  }

  return {
    columns,
    activeTodo,
    dragError: dragError || moveErrorMessage,
    sensors,
    handleDragStart,
    handleDragEnd,
  }
}
