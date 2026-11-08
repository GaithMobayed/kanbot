import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { AuthCard } from '../components/AuthCard'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { FormField } from '../../../components/FormField'
import { Input } from '../../../components/Input'
import { Button } from '../../../components/Button'
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas'
import { useRegister } from '../hooks/useRegister'

export function RegisterPage() {
  const { register: registerUser, isPending, errorMessage, reset } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

function onSubmit(values: RegisterFormValues) {
  const body = { ...values };
  delete (body as Partial<RegisterFormValues>).confirmPassword;

  registerUser(body);
  reset();
}


  return (
    <AuthCard>
      <h2 className="m-0 text-center font-sans text-heading font-normal text-text-primary">
        Create your account
      </h2>

      {errorMessage && <ErrorBanner message={errorMessage} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            hasError={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            hasError={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          hint="min 8 characters"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            hasError={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            hasError={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" isPending={isPending}>
          Create account
        </Button>
      </form>

      <p className="m-0 text-center font-sans text-body text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="text-text-primary underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}
