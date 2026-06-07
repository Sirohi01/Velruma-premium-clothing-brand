import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center dark:border-white/10 dark:bg-zinc-900">
      <Inbox className="mb-3 h-9 w-9 text-zinc-300 dark:text-zinc-700" />
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
