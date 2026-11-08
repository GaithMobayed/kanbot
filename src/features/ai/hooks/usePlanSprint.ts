import { useMutation } from '@tanstack/react-query'
import { planSprint } from '../api/aiApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { PlanSprintRequest } from '../../../types/api'

interface PlanSprintVariables {
  projectId: string
  body: PlanSprintRequest
}


export function usePlanSprint() {
  const mutation = useMutation({
    mutationFn: ({ projectId, body }: PlanSprintVariables) =>
      planSprint(projectId, body),
  })

  return {
    planSprint: mutation.mutate,
    planSprintAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    data: mutation.data,
    reset: mutation.reset,
  }
}
