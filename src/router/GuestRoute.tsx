import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../features/auth/store/authStore'

export function GuestRoute() {
  const token = useAuthStore((s) => s.token)

  return token ? <Navigate to="/projects" replace /> : <Outlet />
}