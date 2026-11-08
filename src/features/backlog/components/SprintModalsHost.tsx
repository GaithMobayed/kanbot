import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSprintModal } from '../store/sprintModalStore'
import { SprintFormModal } from '../../sprints/components/SprintFormModal'
import { StartSprintModal } from '../../sprints/components/StartSprintModal'
import { DeleteSprintModal } from './DeleteSprintModal'

interface SprintModalsHostProps {
  projectId: string
}


export function SprintModalsHost({ projectId }: SprintModalsHostProps) {
  const modal = useSprintModal((state) => state.modal)
  const close = useSprintModal((state) => state.close)
  const navigate = useNavigate()

  const [displayedModal, setDisplayedModal] = useState(modal)

  if (modal && modal !== displayedModal) {
    setDisplayedModal(modal)
  }

  useEffect(() => {
    if (modal || !displayedModal) return

    const timeoutId = window.setTimeout(() => setDisplayedModal(null), 200)
    return () => window.clearTimeout(timeoutId)
  }, [displayedModal, modal])

  if (!displayedModal) return null

  const isOpen = modal === displayedModal

  switch (displayedModal.type) {
    case 'create':
      return <SprintFormModal projectId={projectId} isOpen={isOpen} onClose={close} />
    case 'edit':
      return (
        <SprintFormModal
          key={displayedModal.sprint.id}
          projectId={projectId}
          sprint={displayedModal.sprint}
          isOpen={isOpen}
          onClose={close}
        />
      )
    case 'start':
      return (
        <StartSprintModal
          projectId={projectId}
          sprint={displayedModal.sprint}
          isOpen={isOpen}
          onClose={close}
          onStarted={() => {
            close()
            navigate(`/projects/${projectId}/board`)
          }}
        />
      )
    case 'delete':
      return (
        <DeleteSprintModal
          projectId={projectId}
          sprint={displayedModal.sprint}
          isOpen={isOpen}
          onClose={close}
        />
      )
  }
}
