import { useCallback, useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import { RotateCw, Sparkles } from 'lucide-react'
import { Modal } from '../../../components/common/Modal'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { useSprintSummary } from '../hooks/useSprintSummary'
import { useSummarizeSprint } from '../hooks/useSummarizeSprint'

interface SprintSummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  sprintId: string
  projectId: string
  autoGenerate?: boolean
}

export function SprintSummaryDialog({
  isOpen,
  onClose,
  sprintId,
  projectId,
  autoGenerate = false,
}: SprintSummaryDialogProps) {
  const autoGenerateStarted = useRef(false)
  const sprintQuery = useSprintSummary(sprintId, isOpen)
  const { summarizeSprintAsync, isPending, errorMessage, reset } =
    useSummarizeSprint()
  const sprint = sprintQuery.data?.sprint
  const summary = sprint?.summary
  const isPlanned = sprint?.status === 'planned'

  const handleGenerate = useCallback(async () => {
    reset()
    try {
      await summarizeSprintAsync({ sprintId, projectId })
    } catch {
      
    }
  }, [projectId, reset, sprintId, summarizeSprintAsync])

  useEffect(() => {
    if (
      !isOpen ||
      !autoGenerate ||
      sprintQuery.isLoading ||
      sprintQuery.isError ||
      !sprint ||
      summary ||
      isPlanned ||
      isPending ||
      autoGenerateStarted.current
    ) {
      return
    }

    autoGenerateStarted.current = true
    void handleGenerate()
  }, [
    autoGenerate,
    handleGenerate,
    isOpen,
    isPending,
    isPlanned,
    sprint,
    sprintQuery.isError,
    sprintQuery.isLoading,
    summary,
  ])

  const footer = (
    <div className="flex w-full items-center justify-between">
      <button
        type="button"
        disabled={isPending || isPlanned || sprintQuery.isLoading}
        onClick={() => void handleGenerate()}
        className="flex h-btn cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-4 font-sans text-btn text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RotateCw
          className={['h-4 w-4', isPending ? 'animate-spin' : ''].join(' ')}
          aria-hidden="true"
        />
        <span>{isPending ? 'Generating…' : summary ? 'Regenerate' : 'Generate'}</span>
      </button>
      <button
        type="button"
        onClick={onClose}
        className="flex h-btn cursor-pointer items-center justify-center rounded-md border-none bg-primary px-5 font-sans text-btn text-text-inverse transition-colors hover:bg-[#555555] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Close
      </button>
    </div>
  )

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-text-primary" aria-hidden="true" />
          <span>AI Sprint Summary{ sprint ? ` — ${sprint.name}` : ''}</span>
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
      size="wide"
      footer={footer}
    >
      {sprintQuery.isError && (
        <ErrorBanner message="Could not load this sprint. Close the dialog and try again." />
      )}
      {errorMessage && <ErrorBanner message={errorMessage} />}

      {sprintQuery.isLoading && (
        <div className="flex items-center justify-center gap-2 py-10 font-sans text-body text-text-secondary">
          <Sparkles className="h-5 w-5 animate-pulse" aria-hidden="true" />
          Loading sprint summary…
        </div>
      )}

      {isPlanned && (
        <p className="m-0 py-6 text-center font-sans text-body text-text-secondary">
          A planned sprint has nothing to summarize yet. Start it first.
        </p>
      )}

      {!sprintQuery.isLoading && !sprintQuery.isError && !isPlanned && isPending && (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <Sparkles className="h-8 w-8 animate-pulse text-text-secondary" aria-hidden="true" />
          <p className="m-0 font-sans text-body text-text-secondary">
            Analyzing sprint metrics and drafting summary…
          </p>
        </div>
      )}

      {!sprintQuery.isLoading && !sprintQuery.isError && !isPlanned && !isPending && !summary && (
        <p className="m-0 py-6 text-center font-sans text-body text-text-secondary">
          No summary has been generated for this sprint yet.
        </p>
      )}

      {summary && (
        <div className="prose prose-sm max-w-none font-sans text-body text-text-primary leading-relaxed [&_h1]:text-heading [&_h1]:font-bold [&_h2]:text-btn [&_h2]:font-bold [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1">
          <Markdown>{summary.content}</Markdown>
          <div className="mt-6 border-t border-border pt-2 text-right">
            <span className="font-sans text-caption text-text-secondary">
              Generated {new Date(summary.generatedAt).toLocaleDateString()} · AI can make mistakes.
            </span>
          </div>
        </div>
      )}
    </Modal>
  )
}
