import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { z } from 'zod'
import { ConfirmDialog } from './common/ConfirmDialog'
import { ErrorBanner } from './ErrorBanner'
import { FormField } from './FormField'
import { Input } from './Input'
import { Modal } from './common/Modal'
import { useCreateTodo } from '../features/todos/hooks/useCreateTodo'
import { useDeleteTodo } from '../features/todos/hooks/useDeleteTodo'
import { useProjectSprints } from '../features/sprints/hooks/useProjectSprints'
import { useUpdateTodo } from '../features/todos/hooks/useUpdateTodo'
import { extractErrorMessage } from '../lib/extractError'
import {
  STORY_POINTS,
  TODO_PRIORITIES,
  TODO_STATUSES,
  TODO_TYPES,
} from '../types/api'
import type {
  ApiErrorBody,
  CreateTodoRequest,
  SprintStatus,
  Todo,
  UpdateTodoRequest,
} from '../types/api'

const storyPointOptions = STORY_POINTS.map(String)
const todoDetailsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(5000, 'Description must be 5000 characters or fewer'),
  type: z.enum(TODO_TYPES),
  status: z.enum(TODO_STATUSES),
  priority: z.enum(TODO_PRIORITIES),
  storyPoints: z.string().refine(
    (value) => value === '' || storyPointOptions.includes(value),
    'Choose a supported story-point value',
  ),
  labels: z.array(z.string().trim().min(1).max(30)).max(10),
  dueDate: z.union([z.literal(''), z.iso.date()]),
  sprintId: z.string(),
})

type TodoDetailsFormValues = z.infer<typeof todoDetailsSchema>

interface TodoDetailsModalProps {
  isOpen: boolean
  projectId: string
  onClose: () => void
  
  todo?: Todo
}

function getFormValues(todo: Todo): TodoDetailsFormValues {
  return {
    title: todo.title,
    description: todo.description,
    type: todo.type,
    status: todo.status,
    priority: todo.priority,
    storyPoints: todo.storyPoints === null ? '' : String(todo.storyPoints),
    labels: todo.labels,
    dueDate: todo.dueDate ?? '',
    sprintId: todo.sprintId ?? '',
  }
}


const defaultFormValues: TodoDetailsFormValues = {
  title: '',
  description: '',
  type: 'task',
  status: 'todo',
  priority: 'medium',
  storyPoints: '',
  labels: [],
  dueDate: '',
  sprintId: '',
}

function getUpdateBody(values: TodoDetailsFormValues): UpdateTodoRequest {
  const storyPoints =
    values.storyPoints === ''
      ? null
      : STORY_POINTS.find((points) => String(points) === values.storyPoints)

  if (storyPoints === undefined) {
    throw new Error('Unsupported story-point value.')
  }

  return {
    ...values,
    storyPoints,
    dueDate: values.dueDate || null,
    sprintId: values.sprintId || null,
  }
}

function getCreateBody(values: TodoDetailsFormValues): CreateTodoRequest {
  const storyPoints =
    values.storyPoints === ''
      ? null
      : STORY_POINTS.find((points) => String(points) === values.storyPoints) ??
        null

  return {
    title: values.title,
    description: values.description,
    type: values.type,
    status: values.status,
    priority: values.priority,
    storyPoints,
    labels: values.labels,
    dueDate: values.dueDate || null,
    sprintId: values.sprintId || null,
  }
}

const editableFields: (keyof TodoDetailsFormValues)[] = [
  'title',
  'description',
  'type',
  'status',
  'priority',
  'storyPoints',
  'labels',
  'dueDate',
  'sprintId',
]

function getCreatedDate(createdAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(createdAt))
}

function getSprintStatusLabel(status: SprintStatus) {
  return status === 'active' ? 'active' : 'planned'
}

export function TodoDetailsModal({
  isOpen,
  projectId,
  onClose,
  todo,
}: TodoDetailsModalProps) {
  const isCreate = !todo
  const [newLabel, setNewLabel] = useState('')
  const [isDiscardConfirmationOpen, setIsDiscardConfirmationOpen] =
    useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<TodoDetailsFormValues>({
    resolver: zodResolver(todoDetailsSchema),
    defaultValues: todo ? getFormValues(todo) : defaultFormValues,
  })
  const {
    updateTodo,
    isPending: isSaving,
  } = useUpdateTodo()
  const {
    createTodo,
    isPending: isCreating,
  } = useCreateTodo(projectId)
  const {
    deleteTodo,
    isPending: isDeleting,
    errorMessage: deleteError,
    reset: resetDelete,
  } = useDeleteTodo()
  const sprintsQuery = useProjectSprints(projectId, isOpen)
  const labels = useWatch({ control, name: 'labels' }) ?? []
  const selectedType = useWatch({ control, name: 'type' })
  const isPending = isSaving || isDeleting || isCreating

  function requestClose() {
    if (isPending) return
    if (isDirty || newLabel.trim()) {
      setIsDiscardConfirmationOpen(true)
      return
    }
    onClose()
  }

  function discardChanges() {
    reset(todo ? getFormValues(todo) : defaultFormValues)
    setIsDiscardConfirmationOpen(false)
    onClose()
  }

  function addLabel(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const value = newLabel.trim()
    if (!value || labels.includes(value)) {
      setNewLabel('')
      return
    }
    setValue('labels', [...labels, value], {
      shouldDirty: true,
      shouldValidate: true,
    })
    setNewLabel('')
  }

  function removeLabel(labelToRemove: string) {
    setValue(
      'labels',
      labels.filter((label) => label !== labelToRemove),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  function handleSave(values: TodoDetailsFormValues) {
    if (newLabel.trim()) {
      setError('labels', {
        type: 'manual',
        message: 'Press Enter to add the label before saving.',
      })
      return
    }

    setSaveError(null)

    const onError = (error: unknown) => {
      let hasFieldError = false
      if (axios.isAxiosError<ApiErrorBody>(error)) {
        const details = error.response?.data.error.details ?? []
        for (const detail of details) {
          const fieldPath = detail.path.split('.')[0]
          const field = editableFields.find((name) => name === fieldPath)
          if (!field) continue
          setError(field, { type: 'server', message: detail.message })
          hasFieldError = true
        }
      }
      setSaveError(hasFieldError ? null : extractErrorMessage(error))
    }

    if (todo) {
      updateTodo(
        {
          projectId,
          todoId: todo.id,
          body: getUpdateBody(values),
        },
        { onSuccess: onClose, onError },
      )
    } else {
      createTodo(getCreateBody(values), { onSuccess: onClose, onError })
    }
  }

  function confirmDelete() {
    if (!todo) return
    deleteTodo(
      { projectId, todoId: todo.id },
      {
        onSuccess: () => {
          setIsDeleteConfirmationOpen(false)
          onClose()
        },
      },
    )
  }

  const modalTitle = isCreate ? (
    <span className="font-sans text-label text-text-primary">Create todo</span>
  ) : (
    <div className="flex flex-wrap items-center gap-2 font-sans text-label">
      <span className="rounded-sm bg-primary px-2 py-0.5 font-bold text-text-inverse">
        {todo!.key}
      </span>
      <span className="font-regular text-text-secondary">
        {selectedType} · created {getCreatedDate(todo!.createdAt)}
      </span>
    </div>
  )

  const footer = (
    <div
      className={`flex w-full items-center gap-3 ${isCreate ? 'justify-end' : 'justify-between'}`}
    >
      {!isCreate && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setIsDeleteConfirmationOpen(true)
          }}
          className="h-btn cursor-pointer rounded-md border border-border bg-surface px-4 font-sans text-btn text-text-primary transition-colors hover:bg-surface-alert disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={requestClose}
          className="h-btn cursor-pointer rounded-md border border-border bg-surface px-4 font-sans text-btn text-text-primary transition-colors hover:bg-surface-alert disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="todo-details-form"
          disabled={isPending}
          className="h-btn cursor-pointer rounded-md bg-primary px-4 font-sans text-btn font-bold text-text-inverse transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreate
            ? isCreating
              ? 'Creating…'
              : 'Create'
            : isSaving
              ? 'Saving…'
              : 'Save'}
        </button>
      </div>
    </div>
  )

  const sprints =
    sprintsQuery.data?.sprints.filter(
      (sprint) => sprint.status === 'planned' || sprint.status === 'active',
    ) ?? []

  return (
    <>
      <Modal
        title={modalTitle}
        isOpen={isOpen}
        onClose={requestClose}
        footer={footer}
        size="wide"
      >
        <form
          id="todo-details-form"
          onSubmit={handleSubmit(handleSave)}
          noValidate
        >
          {saveError && <ErrorBanner message={saveError} />}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="flex flex-col gap-5 md:col-span-7">
              <FormField
                label="Title"
                htmlFor="todo-title"
                error={errors.title?.message}
              >
                <Input
                  id="todo-title"
                  maxLength={200}
                  hasError={Boolean(errors.title)}
                  {...register('title')}
                />
              </FormField>
              <FormField
                label="Description"
                htmlFor="todo-description"
                error={errors.description?.message}
              >
                <textarea
                  id="todo-description"
                  rows={10}
                  maxLength={5000}
                  className="w-full resize-y rounded-md border border-border bg-surface p-3 font-sans text-body text-text-primary focus:border-primary focus:outline-none"
                  {...register('description')}
                />
              </FormField>
              <FormField
                label="Sprint"
                htmlFor="todo-sprint"
                error={sprintsQuery.isError
                  ? 'Could not load this project’s sprints.'
                  : undefined}
              >
                <select
                  id="todo-sprint"
                  disabled={sprintsQuery.isPending || sprintsQuery.isError}
                  className="h-input w-full cursor-pointer rounded-md border border-border bg-surface px-3 font-sans text-body text-text-primary focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('sprintId')}
                >
                  <option value="">Backlog</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({getSprintStatusLabel(sprint.status)})
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="flex flex-col gap-4 md:col-span-5">
              <FormField label="Status" htmlFor="todo-status" error={errors.status?.message}>
                <select
                  id="todo-status"
                  className="h-input w-full cursor-pointer rounded-md border border-border bg-surface px-3 font-sans text-body text-text-primary focus:border-primary focus:outline-none"
                  {...register('status')}
                >
                  {TODO_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {{
                        todo: 'To Do',
                        in_progress: 'In Progress',
                        in_review: 'In Review',
                        done: 'Done',
                      }[status]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Priority"
                htmlFor="todo-priority"
                error={errors.priority?.message}
              >
                <select
                  id="todo-priority"
                  className="h-input w-full cursor-pointer rounded-md border border-border bg-surface px-3 font-sans text-body text-text-primary focus:border-primary focus:outline-none"
                  {...register('priority')}
                >
                  {TODO_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority[0].toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Type" htmlFor="todo-type" error={errors.type?.message}>
                <select
                  id="todo-type"
                  className="h-input w-full cursor-pointer rounded-md border border-border bg-surface px-3 font-sans text-body text-text-primary focus:border-primary focus:outline-none"
                  {...register('type')}
                >
                  {TODO_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type[0].toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Story points"
                htmlFor="todo-points"
                error={errors.storyPoints?.message}
              >
                <select
                  id="todo-points"
                  className="h-input w-full cursor-pointer rounded-md border border-border bg-surface px-3 font-sans text-body text-text-primary focus:border-primary focus:outline-none"
                  {...register('storyPoints')}
                >
                  <option value="">None</option>
                  {STORY_POINTS.map((points) => (
                    <option key={points} value={points}>
                      {points}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Labels"
                htmlFor="todo-labels"
                error={errors.labels?.message}
                hint="Press Enter to add a label. Up to 10 labels, 30 characters each."
              >
                <div className="flex min-h-input flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface p-2">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="flex items-center gap-1 rounded-sm bg-surface-alert px-2 py-0.5 font-sans text-caption text-text-primary"
                    >
                      {label}
                      <button
                        type="button"
                        aria-label={`Remove ${label} label`}
                        onClick={() => removeLabel(label)}
                        className="cursor-pointer text-text-secondary hover:text-text-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    id="todo-labels"
                    type="text"
                    maxLength={30}
                    placeholder="Add label..."
                    value={newLabel}
                    onChange={(event) => setNewLabel(event.target.value)}
                    onKeyDown={addLabel}
                    className="min-w-24 flex-1 bg-transparent px-1 font-sans text-caption text-text-primary outline-none"
                  />
                </div>
              </FormField>
              <FormField
                label="Due date"
                htmlFor="todo-duedate"
                error={errors.dueDate?.message}
              >
                <Input
                  id="todo-duedate"
                  type="date"
                  hasError={Boolean(errors.dueDate)}
                  {...register('dueDate')}
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        title="Discard changes?"
        message="Your unsaved todo changes will be lost."
        isOpen={isDiscardConfirmationOpen}
        onClose={() => setIsDiscardConfirmationOpen(false)}
        onConfirm={discardChanges}
        confirmLabel="Discard"
        danger
      />
      {!isCreate && (
        <ConfirmDialog
          title="Delete todo"
          message={`Are you sure you want to delete “${todo!.title}”? This cannot be undone.`}
          isOpen={isDeleteConfirmationOpen}
          onClose={() => {
            resetDelete()
            setIsDeleteConfirmationOpen(false)
          }}
          onConfirm={confirmDelete}
          confirmLabel="Delete"
          isPending={isDeleting}
          errorMessage={deleteError}
          danger
        />
      )}
    </>
  )
}
