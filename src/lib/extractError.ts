import axios from 'axios'
import type { ApiErrorBody } from '../types/api'


export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined
    return data?.error?.message ?? 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}
