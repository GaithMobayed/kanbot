import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { Modal } from '../../../components/common/Modal'
import { Button } from '../../../components/Button'
import { FormField } from '../../../components/FormField'
import { Input } from '../../../components/Input'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { usePlanSprint } from '../hooks/usePlanSprint'
import { useBacklogTodos } from '../../todos/hooks/useBacklogTodos'
import { useCreateSprint } from '../../sprints/hooks/useCreateSprint'
import { planSprintSchema, type PlanSprintFormValues } from '../schemas/planSprintSchema'
import type { PlanSprintResponse, Todo } from '../../../types/api'



interface PlanSprintDialogProps {
  isOpen: boolean
  projectId: string
  onClose: () => void
}


export function PlanSprintDialog({ isOpen, projectId, onClose }: PlanSprintDialogProps) {
  const [plan, setPlan] = useState<PlanSprintResponse | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editedGoal, setEditedGoal] = useState('')

  const { planSprintAsync, isPending: isPlanning, errorMessage: planError, reset: resetPlan } = usePlanSprint()
  const { createSprintAsync, isPending: isCreating, errorMessage: createError, reset: resetCreate } = useCreateSprint()
  const backlogQuery = useBacklogTodos(projectId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanSprintFormValues>({
    resolver: zodResolver(planSprintSchema),
    defaultValues: { capacity: 20, focus: '' },
  })

  async function onSuggest(values: PlanSprintFormValues) {
    resetCreate()
    try {
      const result = await planSprintAsync({
        projectId,
        body: {
          capacity: values.capacity,
          focus: values.focus || undefined,
        },
      })
      setPlan(result)
      setSelectedIds(new Set(result.todoIds))
      setEditedGoal(result.goal)
    } catch {
      
    }
  }

  async function handleCreateSprint() {
    if (!plan) return
    resetPlan()
    try {
      await createSprintAsync({
        projectId,
        body: {
          goal: editedGoal || plan.goal,
          todoIds: plan.todoIds.filter((id) => selectedIds.has(id)),
        },
      })
      handleClose()
    } catch {
      
    }
  }

  function toggleTodo(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleClose() {
    setPlan(null)
    setSelectedIds(new Set())
    setEditedGoal('')
    resetPlan()
    resetCreate()
    onClose()
  }

  
  const backlogMap = new Map<string, Todo>(
    (backlogQuery.data?.todos ?? []).map((t) => [t.id, t]),
  )

  
  const suggestedTodos = (plan?.todoIds ?? [])
    .map((id) => backlogMap.get(id))
    .filter((t): t is Todo => t !== undefined)

  
  const selectedPoints = suggestedTodos
    .filter((t) => selectedIds.has(t.id))
    .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)

  const hasPlan = plan !== null

  const footer = hasPlan ? (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="cursor-pointer rounded-md border border-border px-4 py-2 font-sans text-btn text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Cancel
      </button>
      <Button
        type="button"
        onClick={() => void handleCreateSprint()}
        isPending={isCreating}
        disabled={selectedIds.size === 0}
      >
        Create sprint with {selectedIds.size} todo{selectedIds.size !== 1 ? 's' : ''}
      </Button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="cursor-pointer rounded-md border border-border px-4 py-2 font-sans text-btn text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Cancel
      </button>
      <Button type="submit" form="plan-sprint-form" isPending={isPlanning}>
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Suggest plan
      </Button>
    </>
  )

  return (
    <Modal
      title="Plan sprint with AI"
      isOpen={isOpen}
      onClose={handleClose}
      footer={footer}
      size="wide"
    >
      {}
      {!hasPlan && (
        <form
          id="plan-sprint-form"
          onSubmit={handleSubmit((v) => void onSuggest(v))}
          className="flex flex-col gap-4"
          noValidate
        >
          <p className="m-0 font-sans text-body text-text-secondary">
            Tell the AI how many story points you can handle this sprint and an optional focus theme. It will pick the best fitting backlog todos.
          </p>

          <FormField
            label="Capacity (story points)"
            htmlFor="plan-capacity"
            error={errors.capacity?.message}
          >
            <Input
              id="plan-capacity"
              type="number"
              min={1}
              max={200}
              {...register('capacity', { valueAsNumber: true })}
              hasError={Boolean(errors.capacity)}
              disabled={isPlanning}
            />
          </FormField>

          <FormField
            label="Focus (optional)"
            htmlFor="plan-focus"
            error={errors.focus?.message}
            hint="e.g. AI features, bug fixes, onboarding"
          >
            <Input
              id="plan-focus"
              type="text"
              placeholder="e.g. Authentication and user profile"
              {...register('focus')}
              hasError={Boolean(errors.focus)}
              disabled={isPlanning}
            />
          </FormField>

          {planError && <ErrorBanner message={planError} />}

          <p className="m-0 font-sans text-caption text-text-secondary">
            AI can make mistakes. Review the suggestion before creating the sprint.
          </p>
        </form>
      )}

      {}
      {hasPlan && plan && (
        <div className="flex flex-col gap-4">
          {plan.source === 'mock' && (
            <p className="m-0 rounded-md border border-border bg-surface-subtle px-3 py-2 font-sans text-caption text-text-secondary">
              Generated by Mock AI. Results are illustrative.
            </p>
          )}

          {}
          <div className="flex flex-col gap-1">
            <label htmlFor="plan-goal" className="font-sans text-label text-text-primary">
              Suggested sprint goal
            </label>
            <input
              id="plan-goal"
              type="text"
              value={editedGoal}
              onChange={(e) => setEditedGoal(e.target.value)}
              className="h-input w-full rounded-md border border-border bg-surface px-3 font-sans text-body text-text-primary outline-none transition-colors focus:border-text-primary"
            />
          </div>

          {}
          <div className="rounded-md border border-border bg-surface-subtle px-3 py-2">
            <p className="m-0 font-sans text-caption font-bold text-text-secondary">AI reasoning</p>
            <p className="m-0 mt-1 font-sans text-body text-text-secondary">{plan.reasoning}</p>
          </div>

          {}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="m-0 font-sans text-label font-bold text-text-primary">
                Suggested todos ({suggestedTodos.length})
              </p>
              <p className="m-0 font-sans text-caption text-text-secondary">
                {selectedPoints} pts selected
              </p>
            </div>

            {suggestedTodos.length === 0 && (
              <p className="m-0 font-sans text-body text-text-secondary">
                No matching backlog todos found. The backlog may have changed since the plan was generated.
              </p>
            )}

            <div
              role="list"
              aria-label="Suggested todos"
              className="flex max-h-[40vh] flex-col gap-1.5 overflow-y-auto"
            >
              {suggestedTodos.map((todo) => {
                const checked = selectedIds.has(todo.id)
                return (
                  <label
                    key={todo.id}
                    role="listitem"
                    className={[
                      'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors',
                      checked ? 'border-primary bg-surface' : 'border-border bg-surface-subtle opacity-60',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTodo(todo.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-sans text-body text-text-primary">{todo.title}</span>
                      <div className="mt-0.5 flex flex-wrap gap-2">
                        <span className="font-sans text-caption text-text-secondary">{todo.key}</span>
                        <span className="font-sans text-caption text-text-secondary capitalize">{todo.priority}</span>
                        {todo.storyPoints && (
                          <span className="font-sans text-caption text-text-secondary">{todo.storyPoints} pts</span>
                        )}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {createError && <ErrorBanner message={createError} />}

          <p className="m-0 font-sans text-caption text-text-secondary">
            AI can make mistakes. Review before creating the sprint.
          </p>
        </div>
      )}
    </Modal>
  )
}
