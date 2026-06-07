import { AlertTriangle } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-red-200/70">{description}</p>
        </div>
      </div>
    </div>
  );
}
