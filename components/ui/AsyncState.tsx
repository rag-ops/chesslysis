"use client";

export function LoadingState({ title = "Loading..." }: { title?: string }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-10 max-w-md animate-pulse rounded bg-slate-100" />
        <p className="mt-5 text-sm text-slate-500">{title}</p>
      </div>
    </main>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">Data unavailable</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Try again
          </button>
        )}
      </div>
    </main>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{message}</p>
    </div>
  );
}
