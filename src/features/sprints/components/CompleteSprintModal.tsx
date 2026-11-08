import { useState } from 'react'
import { Modal } from '../../../components/common/Modal'
import { Button } from '../../../components/Button'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { useProjectSprints } from '../hooks/useProjectSprints'
import { useCompleteSprint } from '../hooks/useCompleteSprint'
import { useAssistantStore } from '../../ai/store/assistantStore'
import type { Sprint } from '../../../types/api'

interface CompleteSprintModalProps {
  isOpen: boolean
  onClose: () => void
  sprint: Sprint
  projectId: string
}

export function CompleteSprintModal({
  isOpen,
  onClose,
  sprint,
  projectId,
}: CompleteSprintModalProps) {
  const [moveUnfinishedTo, setMoveUnfinishedTo] = useState<string>('backlog')
  const [generateSummary, setGenerateSummary] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sprintsQuery = useProjectSprints(projectId, isOpen)
  const plannedSprints =
    sprintsQuery.data?.sprints.filter((s) => s.status === 'planned') ?? []

  const { completeSprintAsync, isPending: isCompleting } = useCompleteSprint()
  const openSprintSummary = useAssistantStore((s) => s.openSprintSummary)

  const isPending = isCompleting

  const totalTodos = sprint.stats.totalTodos
  const doneTodos = sprint.stats.doneTodos
  const unfinishedTodos = Math.max(0, totalTodos - doneTodos)
  const donePoints = sprint.stats.donePoints
  const totalPoints = sprint.stats.totalPoints

  async function handleComplete() {
    setError(null)
    try {
      await completeSprintAsync({
        projectId,
        sprintId: sprint.id,
        body: { moveUnfinishedTo },
      })

      if (generateSummary) {
        openSprintSummary(projectId, sprint.id, true)
      }

      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to complete sprint. Please try again.')
      }
    }
  }

  return (
    <Modal
      title={`Complete ${sprint.name}`}
      isOpen={isOpen}
      onClose={isPending ? () => {} : onClose}
      footer={
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="flex h-btn cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-4 font-sans text-btn text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <div className="w-36">
            <Button
              type="button"
              isPending={isPending}
              onClick={handleComplete}
            >
              Complete sprint
            </Button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}

        {}
        <div className="flex flex-col gap-1">
          <p className="m-0 font-sans text-body font-bold text-text-primary">
            {doneTodos} todos done, {unfinishedTodos} not finished
          </p>
          <p className="m-0 font-sans text-body text-text-secondary">
            {donePoints} of {totalPoints} story points completed.
          </p>
        </div>

        {}
        {unfinishedTodos > 0 && (
          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="font-sans text-body font-normal text-text-primary mb-1">
              Move unfinished to:
            </legend>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 font-sans text-body text-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="moveUnfinishedTo"
                  value="backlog"
                  checked={moveUnfinishedTo === 'backlog'}
                  onChange={(e) => setMoveUnfinishedTo(e.target.value)}
                  className="accent-primary"
                />
                Backlog
              </label>

              {plannedSprints.map((planned) => (
                <label
                  key={planned.id}
                  className="flex items-center gap-2 font-sans text-body text-text-primary cursor-pointer"
                >
                  <input
                    type="radio"
                    name="moveUnfinishedTo"
                    value={planned.id}
                    checked={moveUnfinishedTo === planned.id}
                    onChange={(e) => setMoveUnfinishedTo(e.target.value)}
                    className="accent-primary"
                  />
                  {planned.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <hr className="border-t border-border" />

        {}
        <div className="flex items-start gap-2.5">
          <input
            id="generate-summary-checkbox"
            type="checkbox"
            checked={generateSummary}
            onChange={(e) => setGenerateSummary(e.target.checked)}
            className="mt-1 h-4 w-4 accent-primary rounded cursor-pointer"
          />
          <label
            htmlFor="generate-summary-checkbox"
            className="flex flex-col cursor-pointer"
          >
            <span className="font-sans text-body font-bold text-text-primary">
              Generate AI summary
            </span>
            <span className="font-sans text-caption text-text-secondary">
              Opens the summary after the sprint completes.
            </span>
          </label>
        </div>
      </div>
    </Modal>
  )
}
