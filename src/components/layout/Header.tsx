import { useLocation } from 'react-router'
import { Button } from '../Button'
import { NewProjectButton } from '../common/NewProjectButton'
import { useSidebarStore } from '../../features/layout/store/sidebarStore'
import { useThemeStore } from '../../features/layout/store/themeStore'
import { MenuIcon, CloseIcon, SunIcon, MoonIcon } from './icons'

interface HeaderProps {
  hasSelectedProject: boolean
  onAskAi: () => void
}

function getPageTitle(pathname: string): string {
  if (pathname === '/projects' || pathname === '/') return 'Projects'
  if (/\/projects\/[^/]+\/backlog/.test(pathname)) return 'Backlog'
  if (/\/projects\/[^/]+\/board/.test(pathname)) return 'Active Sprint'
  if (/\/projects\/[^/]+\/sprints/.test(pathname)) return 'Sprints'
  return 'Projects'
}


export function Header({ hasSelectedProject, onAskAi }: HeaderProps) {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen)
  const openMobile = useSidebarStore((s) => s.openMobile)
  const closeMobile = useSidebarStore((s) => s.closeMobile)

  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggle)

  const isDark = theme === 'dark'

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6 md:py-4">
      {}
      <div className="flex items-center gap-3">
        {}
        <button
          type="button"
          aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-sidebar"
          onClick={isMobileOpen ? closeMobile : openMobile}
          className={[
            'flex min-h-btn min-w-[44px] items-center justify-center rounded-md md:hidden',
            'text-text-secondary transition-colors duration-150',
            'hover:bg-surface-subtle hover:text-text-primary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          ].join(' ')}
        >
          {isMobileOpen ? (
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        <h1 className="font-sans text-heading font-bold text-text-primary">
          {pageTitle}
        </h1>
      </div>

      {}
      <div className="flex items-center gap-2">
        {}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={[
            'flex min-h-btn min-w-[44px] items-center justify-center rounded-md',
            'border border-border bg-surface text-text-secondary',
            'transition-colors duration-150',
            'hover:bg-surface-subtle hover:text-text-primary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          ].join(' ')}
        >
          {isDark ? (
            <SunIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {hasSelectedProject && (
          <Button
            type="button"
            onClick={onAskAi}
            variant="secondary"
            className="w-auto max-w-none px-4"
          >
            Ask AI
          </Button>
        )}

        <NewProjectButton />
      </div>
    </header>
  )
}
