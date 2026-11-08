import { Folder, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { IconActionButtons } from '../../../components/common/IconActionButtons'
import type { ProjectWithStats } from '../../../types/api'

interface ProjectCardProps {
  project: ProjectWithStats
  onEditRequest: (project: ProjectWithStats) => void
  onDeleteRequest: (project: ProjectWithStats) => void
}


export function ProjectCard({
  project,
  onEditRequest,
  onDeleteRequest,
}: ProjectCardProps) {
  const activeSprintName = project.stats.activeSprint?.name ?? 'None'

  return (
    <article className="relative w-full max-w-card">
      <Link
        to={`/projects/${project.id}/backlog`}
        aria-label={`Open ${project.name} backlog`}
        className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="flex items-start gap-2 pr-16">
          <Folder className="h-5 w-5 shrink-0 text-text-secondary" aria-hidden="true" />
          <h2 className="m-0 font-sans text-heading font-bold text-text-primary">
            {project.name}
          </h2>
        </div>
        <span className="inline-block w-fit rounded-sm bg-primary px-2 py-0.5 font-sans text-caption text-text-inverse">
          {project.key}
        </span>
        <p className="m-0 font-sans text-body text-text-secondary">
          {project.description}
        </p>
        <hr className="border-t border-border" />
        <p className="m-0 font-sans text-label text-text-primary">
          {project.stats.backlogCount} backlogs . Sprint {activeSprintName} active
        </p>
      </Link>
      <IconActionButtons
        label={`${project.name} actions`}
        className="absolute right-4 top-4 z-10"
        actions={[
          {
            label: `Edit ${project.name}`,
            icon: Pencil,
            onClick: () => onEditRequest(project),
          },
          {
            label: `Delete ${project.name}`,
            icon: Trash2,
            onClick: () => onDeleteRequest(project),
            tone: 'danger',
          },
        ]}
      />
    </article>
  )
}
