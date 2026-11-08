import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useSearchParams } from 'react-router'
import axios from 'axios'
import { login } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { getSafeReturnPath } from '../lib/redirect'
import type { LoginRequest } from '../../../types/api'

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    
    const msg = error.response.data?.error?.message
    if (typeof msg === 'string') return msg
  }
  return 'Something went wrong. Please try again.'
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const mutation = useMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      const redirect = getSafeReturnPath(searchParams.get('redirect'))
      void navigate(redirect ?? '/projects', { replace: true })
    },
  })

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
