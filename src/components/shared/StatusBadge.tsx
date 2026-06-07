import { cn } from '@/lib/utils';

const tones: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  archived: 'bg-red-500/10 text-red-500 border-red-500/20',
  inactive: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

export default function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize', tones[value] || tones.inactive, className)}>
      {value}
    </span>
  );
}
