import { PlusIcon } from 'lucide-react'
import { Button } from '../Button'
import { useNewProjectModalStore } from '../../features/projects/store/newProjectModalStore'

export function NewProjectButton() {
  const openModal = useNewProjectModalStore((s) => s.open)

  return (
    <Button
      type="button"
      variant="primary"
      onClick={()=>openModal()}
      className="w-auto gap-1.5 px-4 py-2"
    >
      <PlusIcon size={16} />
      New Project
    </Button>
  );
}
