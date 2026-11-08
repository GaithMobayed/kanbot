import { useEffect } from 'react'
import { useThemeStore } from '../features/layout/store/themeStore'


export function useTheme(): void {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
}
