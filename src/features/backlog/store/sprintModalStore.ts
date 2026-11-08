import { create } from 'zustand'
import type { Sprint } from '../../../types/api'


export type SprintModal =
  | { type: 'create' }
  | { type: 'edit'; sprint: Sprint }
  | { type: 'start'; sprint: Sprint }
  | { type: 'delete'; sprint: Sprint }
  | null

interface SprintModalState {
  modal: SprintModal
  open: (modal: Exclude<SprintModal, null>) => void
  close: () => void
}


export const useSprintModal = create<SprintModalState>((set) => ({
  modal: null,
  open: (modal) => set({ modal }),
  close: () => set({ modal: null }),
}))
