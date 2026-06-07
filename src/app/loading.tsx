import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-6 text-white">
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-5 py-4 shadow-2xl shadow-black/20">
        <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
        <span className="text-sm font-medium tracking-wide text-zinc-200">Loading VELRUMA</span>
      </div>
    </main>
  );
}
