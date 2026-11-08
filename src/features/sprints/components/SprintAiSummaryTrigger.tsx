import { Sparkles } from 'lucide-react'
import { Button } from '../../../components/Button'
import { useAssistantStore } from '../../ai/store/assistantStore'

interface SprintAiSummaryTriggerProps {
  
  projectId: string
  
  sprintId: string
  
  label?: string
  className?: string
}


export function SprintAiSummaryTrigger({
  projectId,
  sprintId,
  label = 'AI summary',
  className = '',
}: SprintAiSummaryTriggerProps) {
  const openSprintSummary = useAssistantStore((s) => s.openSprintSummary)

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => openSprintSummary(projectId, sprintId)}
      className={className}
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  )
}
