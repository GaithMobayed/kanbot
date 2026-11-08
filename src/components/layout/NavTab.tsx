import type { ReactNode } from 'react'
import { NavLink } from 'react-router'

interface NavTabProps {
  to: string
  label: string
  icon: ReactNode
  
  end?: boolean
  
  isCollapsed?: boolean
  
  onClick?: () => void
}


export function NavTab({ to, label, icon, end, isCollapsed = false, onClick }: NavTabProps) {
  return (
    
    <div className="relative group">
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) =>
          [
            'flex min-h-btn items-center rounded-md',
            'font-sans text-body transition-colors duration-150',
            isCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
            isActive
              ? 'bg-nav-active font-bold text-text-primary'
              : 'text-text-secondary hover:bg-nav-hover hover:text-text-primary',
          ].join(' ')
        }
      >
        <span className="shrink-0">{icon}</span>

        {}
        <span className={isCollapsed ? 'sr-only' : undefined}>{label}</span>
      </NavLink>

      {}
      {isCollapsed && (
        <span
          aria-hidden="true"
          className={[
            
            'pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2',
            
            'rounded-md bg-tooltip-bg px-2 py-1',
            'font-sans text-caption text-tooltip-text whitespace-nowrap',
            
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          ].join(' ')}
        >
          {label}
        </span>
      )}
    </div>
  )
}
