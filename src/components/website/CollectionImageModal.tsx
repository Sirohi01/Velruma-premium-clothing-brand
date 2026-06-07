'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CollectionImageModal({ imageUrl, alt }: { imageUrl: string; alt: string }) {
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
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-100 cursor-zoom-in group text-left"
      >
        <img src={imageUrl} alt={alt} className="absolute inset-0 h-full w-full object-cover object-top transition duration-300 group-hover:opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity duration-300 pointer-events-none">
          <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">View Full Image</span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <button 
            type="button"
            className="absolute right-4 top-4 md:right-8 md:top-8 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-50"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={imageUrl} 
            alt={alt} 
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl relative z-40" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
