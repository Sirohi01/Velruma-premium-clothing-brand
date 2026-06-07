import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-6 text-white">
      <section className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-300">
          The page you are looking for is unavailable or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </section>
    </main>
  );
}
