import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Modal } from '../../../components/common/Modal'
import { FormField } from '../../../components/FormField'
import { Input } from '../../../components/Input'
import { ErrorBanner } from '../../../components/ErrorBanner'
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from '../schemas/projectSchema'
import { useCreateProject } from '../hooks/useCreateProject'
import { useUpdateProject } from '../hooks/useUpdateProject'
import { useNewProjectModalStore } from '../store/newProjectModalStore'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

const FORM_ID = 'new-project-form'

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const projectToEdit = useNewProjectModalStore((s) => s.projectToEdit)
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const isEditing = projectToEdit !== null
  const isPending = isEditing
    ? updateMutation.isPending
    : createMutation.isPending
  const errorMessage = isEditing
    ? updateMutation.errorMessage
    : createMutation.errorMessage
  const resetMutation = isEditing
    ? updateMutation.reset
    : createMutation.reset

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', key: '', description: '' },
  })

  
  useEffect(() => {
    if (isOpen) {
      reset(
        projectToEdit
          ? {
              name: projectToEdit.name,
              key: projectToEdit.key,
              description: projectToEdit.description,
            }
          : { name: '', key: '', description: '' },
      )
      resetMutation()
    }
  }, [isOpen, projectToEdit, reset, resetMutation])

  function onSubmit(values: CreateProjectFormValues) {
    resetMutation()

    if (projectToEdit) {
      updateMutation.updateProject({
        id: projectToEdit.id,
        body: {
          name: values.name,
          key: values.key || projectToEdit.key,
          description: values.description,
        },
      })
      return
    }

    createMutation.createProject({
      name: values.name,
      key: values.key || undefined,
      description: values.description || undefined,
    })
  }

  return (
    <Modal
      title={isEditing ? 'Edit Project' : 'New Project'}
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
            Cancel
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={isPending}
            className="flex h-btn cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-primary px-4 font-sans text-btn text-text-inverse transition-colors duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-text-secondary"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Save' : 'Create Project'}
          </button>
        </>
      }
    >
      {errorMessage && <ErrorBanner message={errorMessage} />}

      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            type="text"
            placeholder="Project name"
            hasError={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField
          label="Key"
          htmlFor="key"
          error={errors.key?.message}
          hint={
            isEditing
              ? '2–6 letters. Leave empty to keep the current key.'
              : '2–6 letters. Leave empty to auto-generate.'
          }
        >
          <Input
            id="key"
            type="text"
            placeholder="e.g. MAR"
            hasError={!!errors.key}
            className="uppercase"
            {...register('key')}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <Input
            id="description"
            type="text"
            placeholder="Short description"
            hasError={!!errors.description}
            maxLength={500}
            {...register('description')}
          />
        </FormField>
      </form>
    </Modal>
  )
}
