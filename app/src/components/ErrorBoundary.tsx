import { type ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <div className="mx-auto max-w-xl p-6">
      <h2 className="text-2xl font-semibold text-red-600">
        Something went wrong
      </h2>
      <p className="mt-2 text-zinc-700 dark:text-zinc-300">
        {error.message || "Unexpected error"}
      </p>
      <button
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-200 dark:text-black"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
};

const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
