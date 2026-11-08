import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../types/api'
import { ChevronDownIcon } from './icons'
import { useNavigate } from 'react-router'

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: Project
  
  isCollapsed?: boolean
}


export function ProjectSelector({
  projects,
  selectedProject,
  isCollapsed = false,
}: ProjectSelectorProps) {
  const navigate = useNavigate()

  const handleSelectProject = (id: string) => {
    void navigate(`/projects/${id}/backlog`)
  }

  const [containerRef, isOpen, setIsOpen] = useClickOutside<HTMLDivElement>()

  
  const initials = selectedProject.key

  return (
    <div ref={containerRef} className="relative">
      {isCollapsed ? (
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Switch project — current: ${selectedProject.name}`}
          onClick={() => setIsOpen((prev) => !prev)}
          className={[
            'flex min-h-btn min-w-btn items-center justify-center rounded-lg',
            'bg-nav-active font-sans text-caption font-bold text-text-primary',
            'mx-auto transition-opacity duration-150 hover:opacity-90',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          ].join(' ')}
        >
          {initials}
        </button>
      ) : (
        
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className={[
            'flex min-h-btn w-full items-center justify-between rounded-md',
            'bg-surface px-3 font-sans text-body text-text-primary',
            'transition-colors duration-150 hover:bg-surface-subtle',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          ].join(' ')}
        >
          <span className="truncate">{selectedProject.name}</span>
          <ChevronDownIcon
            size={16}
            className={`shrink-0 text-text-secondary transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {isOpen && (
        <ul
          role="listbox"
          className={[
            'absolute z-10 mt-1 overflow-hidden rounded-md border border-border bg-surface shadow',
            'animate-menu-enter origin-top motion-reduce:animate-none',
            isCollapsed ? 'left-full top-0 ml-2 w-48' : 'left-0 right-0 top-full',
          ].join(' ')}
        >
          {projects.map((project) => (
            <li
              key={project.id}
              role="option"
              aria-selected={project.id === selectedProject.id}
            >
              <button
                type="button"
                onClick={() => {
                  handleSelectProject(project.id)
                  setIsOpen(false)
                }}
                className={[
                  'flex w-full items-center px-3 py-2 text-left',
                  'font-sans text-body text-text-primary',
                  'transition-colors duration-150 hover:bg-surface-subtle',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                ].join(' ')}
              >
                {project.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}



function useClickOutside<T extends HTMLElement = HTMLElement>() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        event.target instanceof Node &&
        !ref.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return [ref, isOpen, setIsOpen] as const
}
