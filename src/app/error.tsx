'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-6 text-white">
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10 text-amber-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          We could not load this page properly. Please retry once.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-4 rounded-md bg-black/30 p-3 text-left text-xs text-zinc-400">
            {error.message}
          </p>
        )}
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </section>
    </main>
  );
}
