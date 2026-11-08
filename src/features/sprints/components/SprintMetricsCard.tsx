import type { Sprint } from '../../../types/api'

interface SprintMetricsCardProps {
  sprint: Sprint
}

export function SprintMetricsCard({ sprint }: SprintMetricsCardProps) {
  const isCompleted = sprint.status === 'completed'
  const isPlanned = sprint.status === 'planned'

  const completedTodos = isCompleted
    ? sprint.completedStats?.doneTodos ?? sprint.stats.doneTodos
    : sprint.stats.doneTodos

  const totalPoints = isCompleted
    ? sprint.completedStats?.totalPoints ?? sprint.stats.totalPoints
    : sprint.stats.totalPoints

  const donePoints = isCompleted
    ? sprint.completedStats?.donePoints ?? sprint.stats.donePoints
    : sprint.stats.donePoints

  const carriedOver = isCompleted
    ? `${sprint.completedStats?.carriedOver ?? 0} ${(sprint.completedStats?.carriedOver ?? 0) === 1 ? 'todo' : 'todos'}`
    : isPlanned
      ? '—'
      : '0 todos'

  const completionPct =
    totalPoints > 0 ? Math.min(100, Math.round((donePoints / totalPoints) * 100)) : 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {}
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 shadow-2xs">
        <span className="font-sans text-caption text-text-secondary">
          Completed todos
        </span>
        <span className="font-sans text-brand font-bold text-text-primary">
          {completedTodos}
        </span>
      </div>

      {}
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 shadow-2xs">
        <span className="font-sans text-caption text-text-secondary">
          Points done
        </span>
        <span className="font-sans text-brand font-bold text-text-primary">
          {donePoints} / {totalPoints}
        </span>
      </div>

      {}
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 shadow-2xs">
        <span className="font-sans text-caption text-text-secondary">
          Carried over
        </span>
        <span className="font-sans text-brand font-bold text-text-primary">
          {carriedOver}
        </span>
      </div>

      {}
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 shadow-2xs">
        <span className="font-sans text-caption text-text-secondary">
          Completion %
        </span>
        <span className="font-sans text-brand font-bold text-text-primary">
          {completionPct}%
        </span>
      </div>
    </div>
  )
}

