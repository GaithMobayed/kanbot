import type {
  SprintStatus,
  StoryPoints,
  TodoPriority,
  TodoType,
} from '../../types/api'

export function TypeBadge({ type }: { type: TodoType }) {
  return (
    <span className="rounded-sm border border-border px-2 py-0.5 font-sans text-caption capitalize text-text-secondary">
      {type}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const isUrgent = priority === 'urgent'
  return (
    <span
      className={[
        'rounded-sm px-2 py-0.5 font-sans text-caption capitalize',
        isUrgent
          ? 'border border-primary bg-primary text-text-inverse'
          : 'border border-border text-text-secondary',
      ].join(' ')}
    >
      {priority}
    </span>
  )
}

export function StoryPointsBadge({
  points,
  suffix = false,
}: {
  points: StoryPoints | null
  suffix?: boolean
}) {
  if (points === null || points === undefined) {
    return (
      <span className="rounded-sm border border-border px-2 py-0.5 font-sans text-caption text-text-secondary">
        —
      </span>
    )
  }

  return (
    <span className="rounded-sm border border-border px-2 py-0.5 font-sans text-caption text-text-secondary">
      {suffix ? `${points} pts` : points}
    </span>
  )
}

export function SprintStatusBadge({ status }: { status: SprintStatus }) {
  const isActive = status === 'active'

  return (
    <span
      className={[
        'rounded-sm px-2.5 py-0.5 font-sans text-caption capitalize',
        isActive
          ? 'border border-primary bg-primary text-text-inverse'
          : 'border border-border bg-surface text-text-secondary',
      ].join(' ')}
    >
      {status}
    </span>
  )
}
