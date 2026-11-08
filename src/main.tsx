import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './router/router'
import { apiConfigurationError } from './api/client'
import { queryClient } from './queryClient'
import { useTheme } from './hooks/useTheme'


function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme()
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {apiConfigurationError ? (
          <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <p role="alert" className="font-sans text-body text-text-primary">
              {apiConfigurationError}
            </p>
          </div>
        ) : (
          <RouterProvider router={router} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
