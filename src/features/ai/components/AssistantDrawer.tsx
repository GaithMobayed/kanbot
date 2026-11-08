import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import Markdown from 'react-markdown'
import { Bot, Send, Sparkles, Trash2, X } from 'lucide-react'
import { useAiStatus } from '../hooks/useAiStatus'
import { useAiChat } from '../hooks/useAiChat'
import { useAssistantStore } from '../store/assistantStore'
import { useActiveSprint } from '../../sprints/hooks/useProjectSprints'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { extractErrorMessage } from '../../../lib/extractError'
import type { ChatMessage } from '../../../types/api'

interface AssistantDrawerProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
  onOpenGenerateTodos: () => void
  onOpenPlanSprint: () => void
  onOpenSprintSummary: (sprintId: string) => void
}


export function AssistantDrawer({
  projectId,
  projectName,
  isOpen,
  onClose,
  onOpenGenerateTodos,
  onOpenPlanSprint,
  onOpenSprintSummary,
}: AssistantDrawerProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const messages = useAssistantStore((s) => s.messages)
  const addMessages = useAssistantStore((s) => s.addMessages)
  const clearMessages = useAssistantStore((s) => s.clearMessages)

  const { data: aiStatus } = useAiStatus()
  const { sendMessageAsync, isPending, errorMessage, reset } = useAiChat()
  const activeSprintQuery = useActiveSprint(projectId)

  
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown as unknown as EventListener)
    return () =>
      document.removeEventListener('keydown', handleKeyDown as unknown as EventListener)
  }, [isOpen, onClose])

  async function handleSend(overrideContent?: string) {
    const content = (overrideContent ?? input).trim()
    if (!content || isPending) return

    
    
    const history = overrideContent
      ? [...messages]
      : [...messages, { role: 'user' as const, content }]

    if (!overrideContent) {
      setInput('')
      addMessages([{ role: 'user', content }])
    }
    reset()

    try {
      const response = await sendMessageAsync({
        projectId,
        body: { messages: history },
      })
      addMessages([response.message])
    } catch {
      
    }
  }

  
  function handleRetry() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMsg) return
    reset()
    void handleSend(lastUserMsg.content)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const isMock = aiStatus?.mode === 'mock'

  return (
    <div
      className={[
        'fixed inset-0 z-40 bg-primary/30 transition-opacity duration-200 motion-reduce:transition-none',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="AI Assistant"
        aria-labelledby="assistant-drawer-title"
        data-open={isOpen}
        className={[
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-surface shadow',
          'assistant-drawer-panel',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <Bot className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="assistant-drawer-title"
                  className="m-0 font-sans text-heading font-bold text-text-primary"
                >
                  Ask AI
                </h2>
                {isMock && (
                  <span
                    className="rounded-full border border-border bg-surface-subtle px-2 py-0.5 font-sans text-caption text-text-secondary"
                    aria-label="Running in mock AI mode"
                  >
                    Mock AI
                  </span>
                )}
              </div>
              <p className="m-0 mt-0.5 truncate font-sans text-caption text-text-secondary">
                {projectName}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                aria-label="Clear conversation"
                onClick={clearMessages}
                className="cursor-pointer rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              aria-label="Close AI assistant"
              onClick={onClose}
              className="cursor-pointer rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {}
        <div className="flex flex-col gap-2 border-b border-border px-4 py-3">
          <p className="m-0 font-sans text-caption text-text-secondary">Quick actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenGenerateTodos}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 font-sans text-caption text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Create todos
            </button>
            <button
              type="button"
              onClick={onOpenPlanSprint}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 font-sans text-caption text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Plan sprint
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeSprintQuery.activeSprint) {
                  onOpenSprintSummary(activeSprintQuery.activeSprint.id)
                }
              }}
              disabled={
                activeSprintQuery.isLoading ||
                activeSprintQuery.isError ||
                !activeSprintQuery.activeSprint
              }
              aria-describedby="summarize-sprint-help"
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 font-sans text-caption text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Summarize sprint
            </button>
          </div>
          <p
            id="summarize-sprint-help"
            className="m-0 font-sans text-caption text-text-secondary"
            aria-live="polite"
          >
            {activeSprintQuery.isLoading && 'Checking for an active sprint…'}
            {activeSprintQuery.isError && (
              <>
                {extractErrorMessage(activeSprintQuery.error)}{' '}
                <button
                  type="button"
                  onClick={() => void activeSprintQuery.refetch()}
                  className="cursor-pointer underline hover:opacity-75"
                >
                  Retry
                </button>
              </>
            )}
            {!activeSprintQuery.isLoading &&
              !activeSprintQuery.isError &&
              !activeSprintQuery.activeSprint &&
              'Start a sprint before generating its summary.'}
            {activeSprintQuery.activeSprint &&
              'Generates a summary for the active sprint.'}
          </p>
        </div>

        {}
        <div
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {messages.length === 0 && !isPending && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
              <Bot className="h-10 w-10 text-text-secondary" aria-hidden="true" />
              <p className="m-0 font-sans text-body text-text-secondary">
                Ask me anything about your backlog or sprint.
              </p>
              <p className="m-0 font-sans text-caption text-text-secondary">
                I have context about your project's todos and active sprint.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isPending && <ThinkingIndicator />}

          {errorMessage && !isPending && (
            <div className="flex flex-col gap-2">
              <ErrorBanner message={errorMessage} />
              <button
                type="button"
                onClick={handleRetry}
                className="self-start font-sans text-caption text-primary underline hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Try again
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-end gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-2 focus-within:border-text-primary">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask a question… (Enter to send, Shift+Enter for newline)"
              aria-label="Message input"
              disabled={isPending}
              className="flex-1 resize-none bg-transparent font-sans text-body text-text-primary outline-none placeholder:text-text-secondary disabled:opacity-60"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button
              type="button"
              aria-label="Send message"
              disabled={!input.trim() || isPending}
              onClick={() => void handleSend()}
              className="shrink-0 cursor-pointer rounded-md bg-primary p-1.5 text-text-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 font-sans text-caption text-text-secondary">
            AI can make mistakes. Review before saving.
          </p>
        </div>
      </aside>
    </div>
  )
}



function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[85%] rounded-lg px-3 py-2 font-sans text-body',
          isUser
            ? 'bg-primary text-text-inverse'
            : 'border border-border bg-surface text-text-primary',
        ].join(' ')}
      >
        {isUser ? (
          <p className="m-0 whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-body [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-bold [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-5">
            <Markdown>{message.content}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 font-sans text-body text-text-secondary">
        <Sparkles className="h-4 w-4 animate-pulse text-primary" aria-hidden="true" />
        <span>Thinking…</span>
      </div>
    </div>
  )
}
