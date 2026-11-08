import { useEffect, useState } from 'react'
import { useAssistantStore } from '../store/assistantStore'
import { AssistantDrawer } from './AssistantDrawer'
import { GenerateTodosDialog } from './GenerateTodosDialog'
import { PlanSprintDialog } from './PlanSprintDialog'
import { SprintSummaryDialog } from './SprintSummaryDialog'
import type { ProjectWithStats } from '../../../types/api'

interface AiFeatureHostProps {
  
  project: ProjectWithStats | null
}


export function AiFeatureHost({ project }: AiFeatureHostProps) {
  const workflow = useAssistantStore((s) => s.workflow)
  const activeProjectId = useAssistantStore((s) => s.activeProjectId)
  const close = useAssistantStore((s) => s.close)
  const openGenerateTodos = useAssistantStore((s) => s.openGenerateTodos)
  const openPlanSprint = useAssistantStore((s) => s.openPlanSprint)
  const openSprintSummary = useAssistantStore((s) => s.openSprintSummary)

  const [displayedWorkflow, setDisplayedWorkflow] = useState(workflow)

  if (workflow && workflow !== displayedWorkflow) {
    setDisplayedWorkflow(workflow)
  }

  useEffect(() => {
    if (workflow || !displayedWorkflow) return

    const timeoutId = window.setTimeout(() => setDisplayedWorkflow(null), 200)
    return () => window.clearTimeout(timeoutId)
  }, [displayedWorkflow, workflow])

  
  
  const projectId = activeProjectId ?? project?.id ?? ''
  const projectName = project?.name ?? 'Project'

  if (!displayedWorkflow || !projectId) return null

  const isOpen =
    workflow !== null &&
    workflow.type === displayedWorkflow.type &&
    (workflow.type !== 'sprintSummary' ||
      (displayedWorkflow.type === 'sprintSummary' &&
        workflow.sprintId === displayedWorkflow.sprintId))

  return (
    <>
      {displayedWorkflow.type === 'drawer' && (
        <AssistantDrawer
          projectId={projectId}
          projectName={projectName}
          isOpen={isOpen}
          onClose={close}
          onOpenGenerateTodos={() => {
            close()
            openGenerateTodos(projectId)
          }}
          onOpenPlanSprint={() => {
            close()
            openPlanSprint(projectId)
          }}
          onOpenSprintSummary={(sprintId) => {
            close()
            openSprintSummary(projectId, sprintId)
          }}
        />
      )}

      {displayedWorkflow.type === 'generateTodos' && (
        <GenerateTodosDialog
          isOpen={isOpen}
          projectId={projectId}
          onClose={close}
        />
      )}

      {displayedWorkflow.type === 'planSprint' && (
        <PlanSprintDialog
          isOpen={isOpen}
          projectId={projectId}
          onClose={close}
        />
      )}

      {displayedWorkflow.type === 'sprintSummary' && (
        <SprintSummaryDialog
          isOpen={isOpen}
          projectId={projectId}
          sprintId={displayedWorkflow.sprintId}
          autoGenerate={displayedWorkflow.autoGenerate}
          onClose={close}
        />
      )}
    </>
  )
}
