import { format } from 'date-fns'
import type { Sprint } from '../../../types/api'
import { SprintStatusBadge } from '../../../components/common/Badges'
import { SprintAiSummaryTrigger } from './SprintAiSummaryTrigger'
import { SprintMetricsCard } from './SprintMetricsCard'

interface SprintDetailsViewProps {
  sprint: Sprint
  projectId: string
  className?: string
}

function formatHeaderDates(
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

export function SprintDetailsView({
  sprint,
  projectId,
  className,
}: SprintDetailsViewProps) {
  const dates = formatHeaderDates(sprint.startDate, sprint.endDate)

  return (
    <div className={['flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow', className].filter(Boolean).join(' ')}>
      {}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="m-0 font-sans text-brand font-bold text-text-primary">
            {sprint.name}
          </h2>
          <SprintStatusBadge status={sprint.status} />
        </div>
        <p className="m-0 font-sans text-body text-text-secondary">
          {dates}
          {sprint.goal ? ` · Goal: ${sprint.goal}` : ''}
        </p>
      </div>

      {}
      <SprintMetricsCard sprint={sprint} />

      <div className="flex justify-end">
        <SprintAiSummaryTrigger projectId={projectId} sprintId={sprint.id} />
      </div>
    </div>
  )
}
