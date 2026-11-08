import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { Input } from '../../../components/Input'
import { Modal } from '../../../components/common/Modal'
import { useCreateSprint } from '../hooks/useCreateSprint'
import { useUpdateSprint } from '../hooks/useUpdateSprint'
import type { Sprint } from '../../../types/api'

interface SprintFormModalProps {
  projectId: string
  sprint?: Sprint
  isOpen?: boolean
  onClose: () => void
}

export function SprintFormModal({
  projectId,
  sprint,
  isOpen = true,
  onClose,
}: SprintFormModalProps) {
  const [name, setName] = useState(sprint?.name ?? '')
  const [goal, setGoal] = useState(sprint?.goal ?? '')
  const [startDate, setStartDate] = useState(sprint?.startDate ?? '')
  const [endDate, setEndDate] = useState(sprint?.endDate ?? '')
  const [validationError, setValidationError] = useState<string | null>(null)
  const createMutation = useCreateSprint()
  const updateMutation = useUpdateSprint()
  const isPending = createMutation.isPending || updateMutation.isPending
  const errorMessage =
    validationError ??
    createMutation.errorMessage ??
    updateMutation.errorMessage

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)

    if (endDate && startDate && endDate < startDate) {
      setValidationError('End date must be on or after the start date.')
      return
    }

    try {
      if (sprint) {
        await updateMutation.updateSprintAsync({
          projectId,
          sprintId: sprint.id,
          body: {
            name: name.trim(),
            goal: goal.trim(),
            startDate: startDate || null,
            endDate: endDate || null,
          },
        })
      } else {
        await createMutation.createSprintAsync({
          projectId,
          body: {
            ...(name.trim() ? { name: name.trim() } : {}),
            goal: goal.trim(),
            startDate: startDate || null,
            endDate: endDate || null,
          },
        })
      }
      onClose()
    } catch {
      
    }
  }

  return (
    <Modal
      title={sprint ? 'Edit sprint' : 'Create sprint'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex h-btn items-center justify-center rounded-md border border-border bg-surface px-4 font-sans text-btn text-text-primary hover:bg-surface-subtle disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            type="submit"
            form="sprint-form"
            isPending={isPending}
            className="w-auto px-5"
          >
            {sprint ? 'Save changes' : 'Create sprint'}
          </Button>
        </>
      }
    >
      <form id="sprint-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMessage && <ErrorBanner message={errorMessage} />}
        <label className="flex flex-col gap-1 font-sans text-caption text-text-secondary">
          Sprint name {sprint && <span className="sr-only">(required)</span>}
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={sprint ? 'Sprint name' : 'Defaults to the next sprint number'}
            maxLength={80}
            required={Boolean(sprint)}
          />
        </label>
        <label className="flex flex-col gap-1 font-sans text-caption text-text-secondary">
          Goal
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            maxLength={300}
            rows={3}
            className="rounded-md border border-border bg-surface px-3 py-2 font-sans text-body text-text-primary focus:border-text-primary focus:outline-none"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-sans text-caption text-text-secondary">
            Start date
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 font-sans text-caption text-text-secondary">
            End date
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              min={startDate || undefined}
            />
          </label>
        </div>
      </form>
    </Modal>
  )
}
