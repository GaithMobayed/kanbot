import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { registerUnauthorizedHandler } from '../api/client'
import { useAuthStore } from '../features/auth/store/authStore'
import { fetchCurrentUser } from '../features/auth/api/authApi'

export function useAuthSession() {
  const token = useAuthStore((state) => state.token)
  const setAuth = useAuthStore((state) => state.setAuth)

  const navigate = useNavigate()

  const sessionQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  
  useEffect(() => {
    return registerUnauthorizedHandler((returnTo) => {
      const params = new URLSearchParams({
        redirect: returnTo,
        expired: '1',
      })

      void navigate(`/login?${params.toString()}`, {
        replace: true,
      })
    })
  }, [navigate])

  
  useEffect(() => {
    if (token && sessionQuery.data) {
      setAuth(token, sessionQuery.data.user)
    }
  }, [sessionQuery.data, setAuth, token])

  return {
    isPending: Boolean(token) && sessionQuery.isPending,
    isError: Boolean(token) && sessionQuery.isError,
    refetch: sessionQuery.refetch,
  }
}