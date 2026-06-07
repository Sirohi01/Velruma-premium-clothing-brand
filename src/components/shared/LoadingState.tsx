import { Loader2 } from 'lucide-react';

export default function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-8 text-sm text-zinc-500">
      <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
      <span>{label}</span>
    </div>
  );
}
