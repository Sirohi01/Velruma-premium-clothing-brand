'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  folder = 'uploads',
  accept = 'image',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  folder?: string;
  accept?: 'image' | 'video' | 'media';
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const acceptTypes = accept === 'image'
    ? 'image/png,image/jpeg,image/webp,image/gif'
    : accept === 'video'
      ? 'video/mp4,video/webm,video/quicktime'
      : 'image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime';
  const isVideo = value && /\.(mp4|webm|mov)$/i.test(value.split('?')[0]);

  const upload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    setUploading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Upload failed');
        return;
      }
      onChange(data.data.secure_url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/5"
        >
          {value && isVideo ? (
            <video src={value} className="h-full w-full object-cover" muted />
          ) : value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Upload from system'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
            }}
          />
        </div>
      </div>
    </div>
  );
}
