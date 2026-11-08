import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { useCreateTodo } from '../../todos/hooks/useCreateTodo'
import { ErrorBanner } from '../../../components/ErrorBanner'

interface InlineCreateTodoProps {
  projectId: string
}


export function InlineCreateTodo({ projectId }: InlineCreateTodoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const shouldRefocusAfterSubmit = useRef(false)
  const [title, setTitle] = useState('')
  const { createTodo, isPending, errorMessage, reset } = useCreateTodo(projectId)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (isPending || !shouldRefocusAfterSubmit.current) return

    shouldRefocusAfterSubmit.current = false
    inputRef.current?.focus()
  }, [isPending])

  function handleSubmit() {
    const trimmed = title.trim()
    if (!trimmed || isPending) return
    shouldRefocusAfterSubmit.current = true
    createTodo(
      { title: trimmed },
      {
        onSuccess: () => {
          setTitle('')
        },
      },
    )
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      if (title) setTitle('')
      else event.currentTarget.blur()
    }
  }

  function handleChange(value: string) {
    setTitle(value)
    
    if (errorMessage) reset()
  }

  return (
    <div className="flex flex-col gap-2">
      
      <div className="relative">
        <Plus
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-inverse/70"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Create todo: type a title and press enter"
          disabled={isPending}
          className="h-input w-full rounded-md border border-dashed border-text-inverse/40 bg-primary pl-9 pr-3 font-sans text-body text-text-inverse placeholder:text-text-inverse/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
      {errorMessage && <ErrorBanner message={errorMessage} />}
    </div>
  )
}
