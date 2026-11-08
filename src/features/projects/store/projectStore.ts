import { create } from 'zustand'
import type { ProjectWithStats } from '../../../types/api'

interface ProjectStore {
  projects: ProjectWithStats[]
  setProjects: (projects: ProjectWithStats[]) => void
  upsertProject: (project: ProjectWithStats) => void
  removeProject: (projectId: string) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  upsertProject: (project) =>
    set((state) => ({
      projects: state.projects.some((item) => item.id === project.id)
        ? state.projects.map((item) => item.id === project.id ? project : item)
        : [...state.projects, project],
    })),
  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== projectId),
    })),
}))
