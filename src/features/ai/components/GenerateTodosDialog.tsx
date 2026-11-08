import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { Modal } from '../../../components/common/Modal'
import { Button } from '../../../components/Button'
import { FormField } from '../../../components/FormField'
import { Input } from '../../../components/Input'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { useGenerateTodos } from '../hooks/useGenerateTodos'
import { useBulkCreateTodos } from '../hooks/useBulkCreateTodos'
import { generateTodosSchema, type GenerateTodosFormValues } from '../schemas/generateTodosSchema'
import type { DraftTodo, TodoPriority, TodoType } from '../../../types/api'



interface DraftRow extends DraftTodo {
  checked: boolean
}



interface GenerateTodosDialogProps {
  isOpen: boolean
  projectId: string
  onClose: () => void
}

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

const TYPE_LABELS: Record<TodoType, string> = {
  task: 'Task',
  story: 'Story',
  bug: 'Bug',
}


export function GenerateTodosDialog({
  isOpen,
  projectId,
  onClose,
}: GenerateTodosDialogProps) {
  const [drafts, setDrafts] = useState<DraftRow[]>([])
  const [aiSource, setAiSource] = useState<'mock' | 'ai' | null>(null)

  const { generateTodosAsync, isPending: isGenerating, errorMessage: generateError, reset: resetGenerate } = useGenerateTodos()
  const { bulkCreateAsync, isPending: isSaving, errorMessage: saveError, reset: resetSave } = useBulkCreateTodos()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateTodosFormValues>({
    resolver: zodResolver(generateTodosSchema),
    defaultValues: { prompt: '', count: 5 },
  })

  async function onGenerate(values: GenerateTodosFormValues) {
    resetSave()
    try {
      const result = await generateTodosAsync({
        projectId,
        body: { prompt: values.prompt, count: values.count },
      })
      setAiSource(result.source)
      setDrafts(result.todos.map((t) => ({ ...t, checked: true })))
    } catch {
      
    }
  }

  function toggleDraft(index: number) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, checked: !d.checked } : d)),
    )
  }

  function updateTitle(index: number, title: string) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, title } : d)),
    )
  }

  function updateField<K extends keyof DraftTodo>(index: number, field: K, value: DraftTodo[K]) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    )
  }

  const checkedDrafts = drafts.filter((d) => d.checked)

  async function handleAddToBacklog() {
    if (checkedDrafts.length === 0) return
    resetGenerate()
    try {
      await bulkCreateAsync({
        projectId,
        body: {
          
          todos: checkedDrafts.map(({ checked: _checked, ...todo }) => todo),
        },
      })
      handleClose()
    } catch {
      
    }
  }

  function handleClose() {
    setDrafts([])
    setAiSource(null)
    resetGenerate()
    resetSave()
    onClose()
  }

  const hasDrafts = drafts.length > 0

  const footer = hasDrafts ? (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="cursor-pointer rounded-md border border-border px-4 py-2 font-sans text-btn text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Cancel
      </button>
      <Button
        type="button"
        onClick={() => void handleAddToBacklog()}
        isPending={isSaving}
        disabled={checkedDrafts.length === 0}
      >
        Add {checkedDrafts.length > 0 ? checkedDrafts.length : ''} to backlog
      </Button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="cursor-pointer rounded-md border border-border px-4 py-2 font-sans text-btn text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Cancel
      </button>
      <Button
        type="submit"
        form="generate-todos-form"
        isPending={isGenerating}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Generate
      </Button>
    </>
  )

  return (
    <Modal
      title="Generate todos with AI"
      isOpen={isOpen}
      onClose={handleClose}
      footer={footer}
      size="wide"
    >
      {}
      {!hasDrafts && (
        <form
          id="generate-todos-form"
          onSubmit={handleSubmit((v) => void onGenerate(v))}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField
            label="Describe a feature or area of work"
            htmlFor="gen-prompt"
            error={errors.prompt?.message}
          >
            <textarea
              id="gen-prompt"
              {...register('prompt')}
              rows={4}
              placeholder="e.g. User profile page with avatar upload and bio editing"
              disabled={isGenerating}
              aria-describedby={errors.prompt ? 'gen-prompt-error' : undefined}
              className={[
                'w-full resize-none rounded-md border bg-surface px-3 py-2',
                'font-sans text-body text-text-primary outline-none transition-colors',
                'placeholder:text-text-secondary',
                'focus:border-text-primary',
                errors.prompt ? 'border-red-600' : 'border-border',
                isGenerating ? 'opacity-60' : '',
              ].join(' ')}
            />
          </FormField>

          <FormField
            label="Number of todos (1–10)"
            htmlFor="gen-count"
            error={errors.count?.message}
          >
            <Input
              id="gen-count"
              type="number"
              min={1}
              max={10}
              {...register('count', { valueAsNumber: true })}
              hasError={Boolean(errors.count)}
              disabled={isGenerating}
            />
          </FormField>

          {generateError && <ErrorBanner message={generateError} />}

          <p className="m-0 font-sans text-caption text-text-secondary">
            AI can make mistakes. Review all suggestions before adding them.
          </p>
        </form>
      )}

      {}
      {hasDrafts && (
        <div className="flex flex-col gap-3">
          {aiSource === 'mock' && (
            <p className="m-0 rounded-md border border-border bg-surface-subtle px-3 py-2 font-sans text-caption text-text-secondary">
              Generated by Mock AI. Results are illustrative, not backed by a real model.
            </p>
          )}

          <p className="m-0 font-sans text-body text-text-secondary">
            {drafts.length} todos generated. Check the ones you want to add to your backlog.
          </p>

          <div
            role="list"
            aria-label="Generated todo drafts"
            className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto"
          >
            {drafts.map((draft, i) => (
              <DraftTodoRow
                key={i}
                draft={draft}
                onToggle={() => toggleDraft(i)}
                onTitleChange={(v) => updateTitle(i, v)}
                onTypeChange={(v) => updateField(i, 'type', v)}
                onPriorityChange={(v) => updateField(i, 'priority', v)}
                onPointsChange={(v) => updateField(i, 'storyPoints', v)}
              />
            ))}
          </div>

          {saveError && <ErrorBanner message={saveError} />}

          <p className="m-0 font-sans text-caption text-text-secondary">
            AI can make mistakes. Review before saving. · {checkedDrafts.length} of {drafts.length} selected
          </p>
        </div>
      )}
    </Modal>
  )
}



interface DraftTodoRowProps {
  draft: DraftRow
  onToggle: () => void
  onTitleChange: (v: string) => void
  onTypeChange: (v: TodoType) => void
  onPriorityChange: (v: TodoPriority) => void
  onPointsChange: (v: DraftTodo['storyPoints']) => void
}

function DraftTodoRow({
  draft,
  onToggle,
  onTitleChange,
  onTypeChange,
  onPriorityChange,
  onPointsChange,
}: DraftTodoRowProps) {
  return (
    <div
      role="listitem"
      className={[
        'flex flex-col gap-2 rounded-md border p-3 transition-colors',
        draft.checked ? 'border-primary bg-surface' : 'border-border bg-surface-subtle opacity-60',
      ].join(' ')}
    >
      {}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={draft.checked}
          onChange={onToggle}
          aria-label={`Include "${draft.title}"`}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        />
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={!draft.checked}
          aria-label="Todo title"
          className="flex-1 bg-transparent font-sans text-body font-bold text-text-primary outline-none placeholder:text-text-secondary focus:underline disabled:cursor-not-allowed"
        />
      </div>

      {}
      <div className="ml-7 flex flex-wrap items-center gap-2">
        <select
          value={draft.type}
          onChange={(e) => onTypeChange(e.target.value as TodoType)}
          disabled={!draft.checked}
          aria-label="Todo type"
          className="cursor-pointer rounded border border-border bg-surface px-2 py-0.5 font-sans text-caption text-text-secondary focus:border-text-primary focus:outline-none disabled:cursor-not-allowed"
        >
          {(['task', 'story', 'bug'] as const).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        <select
          value={draft.priority}
          onChange={(e) => onPriorityChange(e.target.value as TodoPriority)}
          disabled={!draft.checked}
          aria-label="Priority"
          className="cursor-pointer rounded border border-border bg-surface px-2 py-0.5 font-sans text-caption text-text-secondary focus:border-text-primary focus:outline-none disabled:cursor-not-allowed"
        >
          {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>

        <select
          value={draft.storyPoints ?? ''}
          onChange={(e) => {
            const v = e.target.value
            onPointsChange(v === '' ? null : (Number(v) as DraftTodo['storyPoints']))
          }}
          disabled={!draft.checked}
          aria-label="Story points"
          className="cursor-pointer rounded border border-border bg-surface px-2 py-0.5 font-sans text-caption text-text-secondary focus:border-text-primary focus:outline-none disabled:cursor-not-allowed"
        >
          <option value="">— pts</option>
          {([1, 2, 3, 5, 8, 13] as const).map((p) => (
            <option key={p} value={p}>{p} pt{p !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
