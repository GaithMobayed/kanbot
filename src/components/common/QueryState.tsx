import { extractErrorMessage } from "../../lib/extractError"
import { ErrorBanner } from "../ErrorBanner"

interface QueryStateProps {
  isLoading: boolean
  isError: boolean
  error: unknown
  loadingMessage?: string
  children: React.ReactNode
}

export function QueryState({
  isLoading,
  isError,
  error,
  loadingMessage = 'Loading…',
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-sans text-body text-text-secondary">
          {loadingMessage}
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorBanner message={extractErrorMessage(error)} />
      </div>
    )
  }

  return <>{children}</>
}
