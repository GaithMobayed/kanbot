import { differenceInCalendarDays, format } from 'date-fns'
import { Sparkles } from 'lucide-react'
import type { Sprint } from '../../../types/api'

interface ActiveSprintHeaderProps {
  sprint: Sprint
  onSummarize: () => void
  onComplete: () => void
  isSummarizing?: boolean
}

function formatSprintDateRange(
  startDate: string | null,
  endDate: string | null,
): string | null {
  if (!startDate && !endDate) return null

  let text = ''
  if (startDate && endDate) {
    
    const [sY, sM, sD] = startDate.split('-').map(Number)
    const [eY, eM, eD] = endDate.split('-').map(Number)
    const start = new Date(sY, sM - 1, sD)
    const end = new Date(eY, eM - 1, eD)
    text = `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`

    const today = new Date()
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )
    const daysLeft = differenceInCalendarDays(end, todayMidnight)
    if (daysLeft > 1) {
      text += ` · ${daysLeft} days left`
    } else if (daysLeft === 1) {
      text += ' · 1 day left'
    } else if (daysLeft === 0) {
      text += ' · Ends today'
    } else {
      text += ` · ${Math.abs(daysLeft)} days overdue`
    }
  } else if (startDate) {
    const [sY, sM, sD] = startDate.split('-').map(Number)
    text = `From ${format(new Date(sY, sM - 1, sD), 'MMM d')}`
  } else if (endDate) {
    const [eY, eM, eD] = endDate.split('-').map(Number)
    text = `Until ${format(new Date(eY, eM - 1, eD), 'MMM d')}`
  }

  return text
}

export function ActiveSprintHeader({
  sprint,
  onSummarize,
  onComplete,
  isSummarizing = false,
}: ActiveSprintHeaderProps) {
  const dateRange = formatSprintDateRange(sprint.startDate, sprint.endDate)
  const totalPoints = sprint.stats.totalPoints
  const donePoints = sprint.stats.donePoints
  const progressPct =
    totalPoints > 0 ? Math.min(100, Math.round((donePoints / totalPoints) * 100)) : 0

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow">
      {}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="m-0 font-sans text-brand font-bold text-text-primary">
            {sprint.name}
          </h2>
          {dateRange && (
            <span className="font-sans text-body text-text-secondary">
              {dateRange}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSummarize}
            disabled={isSummarizing}
            className="flex h-btn cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-4 font-sans text-btn text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>{isSummarizing ? 'Summarizing…' : 'Summarize'}</span>
          </button>

          <button
            type="button"
            onClick={onComplete}
            className="flex h-btn cursor-pointer items-center justify-center rounded-md border-none bg-primary px-4 font-sans text-btn text-text-inverse transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Complete sprint
          </button>
        </div>
      </div>

      {}
      {sprint.goal && (
        <p className="m-0 font-sans text-body text-text-secondary">
          Goal: {sprint.goal}
        </p>
      )}

      {}
      <div className="flex items-center gap-4 pt-1">
        <div
          role="progressbar"
          aria-valuenow={donePoints}
          aria-valuemin={0}
          aria-valuemax={totalPoints}
          aria-label="Sprint story points progress"
          className="h-2 w-64 max-w-full overflow-hidden rounded-full bg-surface-alert"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="font-sans text-label text-text-secondary">
          {donePoints} / {totalPoints} pts done
        </span>
      </div>
    </div>
  )
}

