import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  
  isCollapsed: boolean
  
  isMobileOpen: boolean

  toggleCollapsed: () => void
  openMobile: () => void
  closeMobile: () => void
}


export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      isMobileOpen: false,

      toggleCollapsed: () => set({ isCollapsed: !get().isCollapsed }),
      openMobile: () => set({ isMobileOpen: true }),
      closeMobile: () => set({ isMobileOpen: false }),
    }),
    {
      name: 'kanbot-sidebar',
      
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    },
  ),
)
