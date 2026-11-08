import { useState } from 'react'
import { useOutletContext } from 'react-router'
import type { ProjectsQuery } from '../hooks/useProjects'
import { useNewProjectModalStore } from '../store/newProjectModalStore'
import { ProjectCard } from '../components/ProjectCard'
import { EmptyProjectsState } from '../components/EmptyProjectsState'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { QueryState } from '../../../components/common/QueryState'
import { SearchInput } from '../../../components/SearchInput'
import { useProjectDeleteDialog } from '../hooks/useProjectDeleteDialog'

export function ProjectsPage() {
  const { data, isLoading, isError, error } = useOutletContext<ProjectsQuery>()
  const openModal = useNewProjectModalStore((s) => s.open)
  const [search, setSearch] = useState('')

  const {
    projectToDelete,
    setProjectToDelete,
    isDeleting,
    deleteErrorMessage,
    handleConfirmDelete,
    handleClose,
  } = useProjectDeleteDialog()

  const projects = data?.projects ?? []

  
  if (projects.length === 0) {
    return <EmptyProjectsState onNewProject={() => openModal()} />
  }

  const query = search.toLowerCase().trim()
  const filteredProjects = query
    ? projects.filter((p) => p.name.toLowerCase().includes(query) || p.key.toLowerCase().includes(query))
    : projects

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error}>
      <div className="flex min-h-full flex-col gap-4 p-6">
        {}
        <div className="flex justify-end">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search projects…"
            aria-label="Search projects"
            containerClassName="w-64"
          />
        </div>

        {}
        {filteredProjects.length === 0 ? (
          <EmptyProjectsState searchTerm={search} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEditRequest={() => openModal(project)}
                onDeleteRequest={setProjectToDelete}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          title="Delete Project"
          message={projectToDelete ? `Are you sure you want to delete "${projectToDelete.name}"? This action cannot be undone.` : ''}
          isOpen={projectToDelete !== null}
          onClose={handleClose}
          onConfirm={handleConfirmDelete}
          confirmLabel="Delete"
          isPending={isDeleting}
          errorMessage={deleteErrorMessage}
          danger
        />
      </div>
    </QueryState>
  )
}