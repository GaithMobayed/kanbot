import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '../features/auth/store/authStore'

export function ProtectedRoute() {
  const location = useLocation()
  const token = useAuthStore((s) => s.token)

  if (!token) {
    const redirect =
      `${location.pathname}${location.search}${location.hash}`

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    )
  }

  return <Outlet />
}