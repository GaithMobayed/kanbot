import { useState } from 'react'
import type { FormEvent } from 'react'
import { addDays, format } from 'date-fns'
import { Button } from '../../../components/Button'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { Input } from '../../../components/Input'
import { Modal } from '../../../components/common/Modal'
import { useStartSprint } from '../hooks/useStartSprint'
import type { Sprint } from '../../../types/api'

interface StartSprintModalProps {
  projectId: string
  sprint: Sprint
  isOpen?: boolean
  onClose: () => void
  onStarted: () => void
}

function todayDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function StartSprintModal({
  projectId,
  sprint,
  isOpen = true,
  onClose,
  onStarted,
}: StartSprintModalProps) {
  const today = todayDate()
  const [startDate, setStartDate] = useState(sprint.startDate ?? today)
  const [endDate, setEndDate] = useState(
    sprint.endDate && sprint.endDate >= (sprint.startDate ?? today)
      ? sprint.endDate
      : format(addDays(new Date(`${today}T00:00:00`), 14), 'yyyy-MM-dd'),
  )
  const [validationError, setValidationError] = useState<string | null>(null)
  const { startSprintAsync, isPending, errorMessage } = useStartSprint()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)

    if (endDate < startDate) {
      setValidationError('End date must be on or after the start date.')
      return
    }

    try {
      await startSprintAsync({
        projectId,
        sprintId: sprint.id,
        body: { startDate, endDate },
      })
      onStarted()
    } catch {
      
    }
  }

  return (
    <Modal
      title={`Start ${sprint.name}`}
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
            form="start-sprint-form"
            isPending={isPending}
            className="w-auto px-5"
          >
            Start sprint
          </Button>
        </>
      }
    >
      <form
        id="start-sprint-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {(validationError || errorMessage) && (
          <ErrorBanner message={validationError ?? errorMessage ?? ''} />
        )}
        <p className="m-0 font-sans text-body text-text-secondary">
          Set the sprint dates. Starting it will open the active sprint board.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-sans text-caption text-text-secondary">
            Start date
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 font-sans text-caption text-text-secondary">
            End date
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              min={startDate}
              required
            />
          </label>
        </div>
      </form>
    </Modal>
  )
}
