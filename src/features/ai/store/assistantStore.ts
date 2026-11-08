import { create } from 'zustand'
import type { ChatMessage } from '../../../types/api'


export type AiWorkflow =
  | null
  | { type: 'drawer' }
  | { type: 'generateTodos' }
  | { type: 'planSprint' }
  | { type: 'sprintSummary'; sprintId: string; autoGenerate: boolean }

interface AssistantState {
  
  workflow: AiWorkflow

  
  activeProjectId: string | null

  
  messages: ChatMessage[]

  

  
  openDrawer: (projectId: string) => void
  
  openGenerateTodos: (projectId: string) => void
  
  openPlanSprint: (projectId: string) => void
  
  openSprintSummary: (projectId: string, sprintId: string, autoGenerate?: boolean) => void
  
  close: () => void

  
  addMessages: (msgs: ChatMessage[]) => void
  
  clearMessages: () => void

  
  
  isOpen: boolean
  open: () => void
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  workflow: null,
  activeProjectId: null,
  messages: [],
  isOpen: false,

  openDrawer: (projectId) => {
    const current = get().activeProjectId
    
    const messages = current !== null && current !== projectId ? [] : get().messages
    set({ workflow: { type: 'drawer' }, activeProjectId: projectId, isOpen: true, messages })
  },

  openGenerateTodos: (projectId) => {
    const current = get().activeProjectId
    const messages = current !== null && current !== projectId ? [] : get().messages
    set({ workflow: { type: 'generateTodos' }, activeProjectId: projectId, isOpen: false, messages })
  },

  openPlanSprint: (projectId) => {
    const current = get().activeProjectId
    const messages = current !== null && current !== projectId ? [] : get().messages
    set({ workflow: { type: 'planSprint' }, activeProjectId: projectId, isOpen: false, messages })
  },

  openSprintSummary: (projectId, sprintId, autoGenerate = false) => {
    const current = get().activeProjectId
    const messages = current !== null && current !== projectId ? [] : get().messages
    set({
      workflow: { type: 'sprintSummary', sprintId, autoGenerate },
      activeProjectId: projectId,
      isOpen: false,
      messages,
    })
  },

  close: () => set({ workflow: null, isOpen: false }),

  addMessages: (msgs) => set((state) => ({ messages: [...state.messages, ...msgs] })),

  clearMessages: () => set({ messages: [] }),

  
  open: () => {
    const projectId = get().activeProjectId ?? ''
    set({ workflow: { type: 'drawer' }, isOpen: true, activeProjectId: projectId || null })
  },
}))
