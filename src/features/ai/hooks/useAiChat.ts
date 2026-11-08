import { useMutation } from '@tanstack/react-query'
import { chat } from '../api/aiApi'
import { extractErrorMessage } from '../../../lib/extractError'
import type { ChatRequest } from '../../../types/api'

interface AiChatVariables {
  projectId: string
  body: ChatRequest
}


export function useAiChat() {
  const mutation = useMutation({
    mutationFn: ({ projectId, body }: AiChatVariables) => chat(projectId, body),
  })

  return {
    sendMessage: mutation.mutate,
    sendMessageAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.isError ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
