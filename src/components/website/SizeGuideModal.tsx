'use client';

import React, { useState, useEffect } from 'react';
import { X, Ruler } from 'lucide-react';

export default function SizeGuideModal({ imageUrl }: { imageUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900"
      >
        <Ruler className="h-3.5 w-3.5" />
        Size Guide
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">Size Guide</h2>
              <button 
                type="button"
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 bg-zinc-50 max-h-[80vh] overflow-y-auto">
              <img 
                src={imageUrl} 
                alt="Size Guide" 
                className="w-full h-auto rounded-lg" 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
