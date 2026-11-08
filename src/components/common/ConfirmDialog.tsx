import { Loader2 } from 'lucide-react'
import { Modal } from './Modal'
import { ErrorBanner } from '../ErrorBanner'

interface ConfirmDialogProps {
  title: string
  message: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
  isPending?: boolean
  errorMessage?: string | null
  
  danger?: boolean
}


export function ConfirmDialog({
  title,
  message,
  isOpen,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isPending = false,
  errorMessage = null,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex h-btn cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-4 font-sans text-btn text-text-primary transition-colors duration-150 hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={[
              'flex h-btn cursor-pointer items-center justify-center gap-2 rounded-md border-none px-4 font-sans text-btn text-text-inverse transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:opacity-90',
            ].join(' ')}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      {errorMessage && <ErrorBanner message={errorMessage} />}

      <p className="m-0 font-sans text-body text-text-secondary">{message}</p>
    </Modal>
  )
}
