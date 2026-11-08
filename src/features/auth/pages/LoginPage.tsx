import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router'
import { AuthCard } from '../components/AuthCard'
import { ErrorBanner } from '../../../components/ErrorBanner'
import { FormField } from '../../../components/FormField'
import { Input } from '../../../components/Input'
import { Button } from '../../../components/Button'
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas'
import { useLogin } from '../hooks/useLogin'

export function LoginPage() {
  const { login, isPending, errorMessage, reset } = useLogin()
  const [searchParams] = useSearchParams()
  const isSessionExpired = searchParams.get('expired') === '1'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(values: LoginFormValues) {
    reset()
    login(values)
  }

  return (
    <AuthCard>
      <h2 className="m-0 text-center font-sans text-heading font-normal text-text-primary">
        Welcome back
      </h2>

      {isSessionExpired && (
        <ErrorBanner message="Your session has expired. Please log in again." />
      )}
      {errorMessage && <ErrorBanner message={errorMessage} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            hasError={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <Button type="submit" isPending={isPending}>
          Log in
        </Button>
      </form>

      <p className="m-0 text-center font-sans text-body text-text-secondary">
        No account?{' '}
        <Link to="/register" className="text-text-primary underline">
          Create one
        </Link>
      </p>
    </AuthCard>
  )
}
