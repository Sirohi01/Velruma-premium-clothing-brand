'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-white/10">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </>
  );
}
