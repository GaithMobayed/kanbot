import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Divider } from './Divider'

interface ModalProps {
  title: ReactNode
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'default' | 'wide'
}

const openModalIds: symbol[] = []


export function Modal({
  title,
  isOpen,
  onClose,
  children,
  footer,
  size = 'default',
}: ModalProps) {
  const onCloseRef = useRef(onClose)
  const modalIdRef = useRef(Symbol('modal'))
  const [isMounted, setIsMounted] = useState(false)

  if (isOpen && !isMounted) {
    setIsMounted(true)
  }

  useEffect(() => {
    if (isOpen || !isMounted) return

    const timeoutId = window.setTimeout(() => setIsMounted(false), 180)
    return () => window.clearTimeout(timeoutId)
  }, [isMounted, isOpen])

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const modalId = modalIdRef.current
    openModalIds.push(modalId)

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === 'Escape' &&
        openModalIds[openModalIds.length - 1] === modalId
      ) {
        onCloseRef.current()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const index = openModalIds.lastIndexOf(modalId)
      if (index !== -1) openModalIds.splice(index, 1)
    }
  }, [isOpen])

  if (!isOpen && !isMounted) return null

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4',
        'transition-opacity duration-200 motion-reduce:transition-none',
        isOpen
          ? 'animate-fade-in opacity-100 motion-reduce:animate-none'
          : 'pointer-events-none opacity-0',
      ].join(' ')}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[
          'flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-lg border border-border bg-surface shadow',
          size === 'wide' ? 'max-w-4xl' : 'max-w-card',
          'transition-[opacity,transform] duration-200 motion-reduce:transition-none',
          isOpen
            ? 'animate-dialog-enter opacity-100'
            : 'translate-y-2 scale-95 opacity-0',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="flex items-center justify-between px-6 py-4">
          <div
            id="modal-title"
            role="heading"
            aria-level={2}
            className="m-0 font-sans text-heading font-bold text-text-primary"
          >
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-sm p-1 text-text-secondary transition-colors hover:bg-surface-alert hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Divider />

        {}
        <div className="flex flex-col gap-4 px-6 py-4">{children}</div>

        <Divider />

        {}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
