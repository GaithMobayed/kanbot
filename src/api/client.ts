import axios from 'axios'
import { useAuthStore } from '../features/auth/store/authStore'
import { useProjectStore } from '../features/projects/store/projectStore'
import { queryClient } from '../queryClient'

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim()

export const apiConfigurationError = apiBaseUrl
  ? null
  : 'VITE_API_URL is required. Set it in client/.env before using the app.'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

type UnauthorizedHandler = (returnTo: string) => void
let unauthorizedHandler: UnauthorizedHandler | null = null

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null
    }
  }
}

apiClient.interceptors.request.use((config) => {
  if (!apiBaseUrl) {
    return Promise.reject(
      new Error('VITE_API_URL is required. Set it in client/.env before using the app.'),
    )
  }

  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 401 ||
      /\/auth\/(login|register)\/?$/.test(error.config?.url ?? '') ||
      !useAuthStore.getState().token
    ) {
      return Promise.reject(error)
    }

    const currentPath =
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    const returnTo =
      currentPath.startsWith('/login') || currentPath.startsWith('/register')
        ? '/projects'
        : currentPath

    useAuthStore.getState().clearAuth()
    useProjectStore.getState().setProjects([])
    queryClient.clear()

    if (unauthorizedHandler) {
      unauthorizedHandler(returnTo)
    } else {
      const params = new URLSearchParams({
        redirect: returnTo,
        expired: '1',
      })
      window.location.replace(`/login?${params.toString()}`)
    }

    return Promise.reject(error)
  },
)
