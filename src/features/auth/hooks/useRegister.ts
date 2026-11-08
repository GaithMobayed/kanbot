import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { register } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import type { RegisterRequest } from '../../../types/api'

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    
    const msg = error.response.data?.error?.message
    if (typeof msg === 'string') return msg
  }
  return 'Something went wrong. Please try again.'
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      void navigate('/projects', { replace: true })
    },
  })

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
