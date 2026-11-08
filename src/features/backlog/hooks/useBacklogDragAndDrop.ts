import { useCallback, useRef, useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useMoveTodo } from '../../todos/hooks/useMoveTodo'
import type { Sprint, Todo } from '../../../types/api'

type Lists = Record<string, Todo[]>


const NO_TODOS: Todo[] = []

interface UseBacklogDragAndDropProps {
  projectId: string
  backlogTodos: Todo[]
  plannedSprints: Sprint[]
  sprintTodosQueries: Array<{ data?: { todos: Todo[] } }>
  hasActiveFilters: boolean
}

export function useBacklogDragAndDrop({
  projectId,
  backlogTodos,
  plannedSprints,
  sprintTodosQueries,
  hasActiveFilters,
}: UseBacklogDragAndDropProps) {
  const [moveError, setMoveError] = useState<string | null>(null)
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)
  const [localOrder, setLocalOrder] = useState<Lists | null>(null)

  
  const localOrderRef = useRef<Lists | null>(null)

  const { moveTodoAsync } = useMoveTodo()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function allListIds(): string[] {
    return ['backlog', ...plannedSprints.map((s) => s.id)]
  }

  
  
  function getListTodos(listId: string): Todo[] {
    if (listId === 'backlog') return backlogTodos
    const index = plannedSprints.findIndex((s) => s.id === listId)
    return index >= 0 ? (sprintTodosQueries[index]?.data?.todos ?? NO_TODOS) : NO_TODOS
  }

  
  
  
  
  const getEffectiveTodos = useCallback(
    (listId: string): Todo[] => {
      if (localOrder) return localOrder[listId] ?? NO_TODOS
      if (listId === 'backlog') return backlogTodos
      const index = plannedSprints.findIndex((s) => s.id === listId)
      return index >= 0 ? (sprintTodosQueries[index]?.data?.todos ?? NO_TODOS) : NO_TODOS
    },
    
    [localOrder, backlogTodos, plannedSprints, sprintTodosQueries],
  )

  function findListOf(lists: Lists, todoId: string): string | null {
    return Object.keys(lists).find((listId) =>
      lists[listId].some((t) => t.id === todoId),
    ) ?? null
  }

  function applyLocalOrder(next: Lists | null) {
    localOrderRef.current = next
    setLocalOrder(next)
  }

  

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id)

    const lists: Lists = Object.fromEntries(
      allListIds().map((id) => [id, [...getListTodos(id)]]),
    )

    const listId = findListOf(lists, activeId)
    if (!listId) return

    setActiveTodo(lists[listId].find((t) => t.id === activeId) ?? null)
    setMoveError(null)
    applyLocalOrder(lists)
  }

  

  function handleDragOver(event: DragOverEvent) {
    const lists = localOrderRef.current
    if (!lists || !event.over) return

    const activeId = String(event.active.id)
    const overId = String(event.over.id)

    const sourceListId = findListOf(lists, activeId)
    
    const targetListId = lists[overId] ? overId : findListOf(lists, overId)

    if (!sourceListId || !targetListId) return
    
    if (sourceListId === targetListId) return
    if (hasActiveFilters && (sourceListId === 'backlog' || targetListId === 'backlog')) return

    const sourceItems = lists[sourceListId]
    const targetItems = lists[targetListId]
    const dragged = sourceItems.find((t) => t.id === activeId)
    if (!dragged) return

    const overIndex = targetItems.findIndex((t) => t.id === overId)
    const insertAt = overIndex === -1 ? targetItems.length : overIndex

    applyLocalOrder({
      ...lists,
      [sourceListId]: sourceItems.filter((t) => t.id !== activeId),
      [targetListId]: [
        ...targetItems.slice(0, insertAt),
        dragged,
        ...targetItems.slice(insertAt),
      ],
    })
  }

  

  async function handleDragEnd(event: DragEndEvent) {
    const lists = localOrderRef.current
    const draggedTodo = activeTodo

    setActiveTodo(null)

    if (!lists || !draggedTodo || !event.over) {
      applyLocalOrder(null)
      return
    }

    const activeId = String(event.active.id)
    const overId = String(event.over.id)

    const listId = findListOf(lists, activeId)
    if (!listId) {
      applyLocalOrder(null)
      return
    }

    
    let items = lists[listId]
    const oldIndex = items.findIndex((t) => t.id === activeId)
    const overIndex = items.findIndex((t) => t.id === overId)
    if (overIndex !== -1 && overIndex !== oldIndex) {
      items = arrayMove(items, oldIndex, overIndex)
    }
    const finalLists = { ...lists, [listId]: items }
    applyLocalOrder(finalLists)

    const position = items.findIndex((t) => t.id === activeId)

    const originalListId = draggedTodo.sprintId ?? 'backlog'
    const isSameList = listId === originalListId
    const originalPosition = getListTodos(originalListId).findIndex((t) => t.id === activeId)

    
    if (isSameList && position === originalPosition) {
      applyLocalOrder(null)
      return
    }

    if (hasActiveFilters && (listId === 'backlog' || originalListId === 'backlog')) {
      applyLocalOrder(null)
      return
    }

    await moveTodo(draggedTodo, listId === 'backlog' ? null : listId, position)
    applyLocalOrder(null)
  }

  

  async function moveTodo(todo: Todo, targetSprintId: string | null, position: number) {
    setMoveError(null)
    try {
      await moveTodoAsync({
        projectId,
        sprintId: todo.sprintId,
        todoId: todo.id,
        body: { sprintId: targetSprintId, status: todo.status, position },
      })
    } catch (error: unknown) {
      setMoveError(error instanceof Error ? error.message : 'Failed to move todo.')
    }
  }

  return {
    sensors,
    moveError,
    moveTodo,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeTodo,
    localOrder,
    getListTodos,
    getEffectiveTodos,
  }
}