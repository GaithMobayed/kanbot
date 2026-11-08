import { create } from 'zustand'
import type { ProjectWithStats } from '../../../types/api'

interface NewProjectModalState {
  isOpen: boolean
  projectToEdit: ProjectWithStats | null
  open: (project?: ProjectWithStats) => void
  close: () => void
}

export const useNewProjectModalStore = create<NewProjectModalState>((set) => ({
  isOpen: false,
  projectToEdit: null,
  open: (project) => set({ isOpen: true, projectToEdit: project ?? null }),
  close: () => set({ isOpen: false, projectToEdit: null }),
}))
