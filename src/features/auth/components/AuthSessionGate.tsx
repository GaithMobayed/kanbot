import { Outlet } from "react-router";
import { ErrorBanner } from "../../../components/ErrorBanner";
import { useAuthSession } from "../../../hooks/useAuthSession";

export function AuthSessionGate() {
  const { isPending, isError, refetch } = useAuthSession();

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-sans text-body text-text-secondary">
          Verifying your session…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <ErrorBanner message="Could not verify your session. Check your connection and try again." />

        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-md bg-primary px-4 py-2 font-sans text-btn text-text-inverse transition-opacity hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return <Outlet />;
}
