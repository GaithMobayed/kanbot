import { Link } from 'react-router'
import { EmptyState } from '../components/common/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Link
          to="/"
          className="rounded-md bg-primary px-4 py-2 font-sans text-btn text-text-inverse transition-opacity hover:opacity-90"
        >
          Go to home
        </Link>
      }
    />
  )
}