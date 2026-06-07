'use client';

import { Search } from 'lucide-react';
import { toast } from 'sonner';

export default function SeoAuditActions() {
  const scan = async () => {
    const res = await fetch('/api/seo-audits/scan', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      toast.success(`SEO scan complete: ${data.data.scanned} pages`);
      window.location.reload();
    } else {
      toast.error(data.error || 'SEO scan failed');
    }
  };

  return (
    <button onClick={scan} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">
      <Search className="h-4 w-4" />
      Run SEO Scan
    </button>
  );
}
