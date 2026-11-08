import { format } from 'date-fns'
import type { Sprint } from '../../../types/api'
import { SprintStatusBadge } from '../../../components/common/Badges'

interface SprintListItemProps {
  sprint: Sprint
  isSelected: boolean
  onClick: (sprint: Sprint) => void
  style?: React.CSSProperties
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
): string {
  if (!startDate && !endDate) return 'Dates unassigned'

  if (startDate && endDate) {
    const [sY, sM, sD] = startDate.split('-').map(Number)
    const [eY, eM, eD] = endDate.split('-').map(Number)
    const start = new Date(sY, sM - 1, sD)
    const end = new Date(eY, eM - 1, eD)
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
  }

  if (startDate) {
    const [sY, sM, sD] = startDate.split('-').map(Number)
    return `From ${format(new Date(sY, sM - 1, sD), 'MMM d')}`
  }

  if (endDate) {
    const [eY, eM, eD] = endDate.split('-').map(Number)
    return `Until ${format(new Date(eY, eM - 1, eD), 'MMM d')}`
  }

  return ''
}

export function SprintListItem({
  sprint,
  isSelected,
  onClick,
  style,
}: SprintListItemProps) {
  const dateRange = formatDateRange(sprint.startDate, sprint.endDate)

  const totalPoints =
    sprint.completedStats?.totalPoints ?? sprint.stats.totalPoints
  const donePoints =
    sprint.completedStats?.donePoints ?? sprint.stats.donePoints

  return (
    <button
      type="button"
      onClick={() => onClick(sprint)}
      style={style}
      className={[
        'flex w-full animate-fade-slide-in flex-col gap-2 rounded-lg p-4 text-left transition-all duration-150 cursor-pointer motion-reduce:animate-none',
        isSelected
          ? 'border-2 border-text-primary bg-surface-subtle shadow-xs'
          : 'border border-border bg-surface hover:bg-surface-subtle hover:border-text-secondary',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      ].join(' ')}
    >
      {}
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-body font-bold text-text-primary">
          {sprint.name}
        </span>
        <SprintStatusBadge status={sprint.status} />
      </div>

      {}
      <div className="flex items-center justify-between gap-2 pt-1 font-sans text-caption text-text-secondary">
        <span>{dateRange}</span>
        <span className="font-medium">
          {donePoints}/{totalPoints} pts
        </span>
      </div>
    </button>
  )
}
