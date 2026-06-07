import React from 'react';

export function CmsRenderer({ page, fallbackTitle, fallbackContent }: { page?: any; fallbackTitle: string; fallbackContent: string }) {
  const title = page?.title || fallbackTitle;
  const content = page?.content || fallbackContent;
  const sections = page?.sections || [];

  return (
    <div className="bg-white dark:bg-[#0A0A0F]">
      <section className="mx-auto max-w-5xl px-4 py-16 text-center lg:px-8 lg:py-24">
        {page?.heroImage && <img src={page.heroImage} alt="" className="mx-auto mb-8 max-h-96 w-full rounded-2xl object-cover" />}
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white lg:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
        {page?.excerpt && <p className="mx-auto mt-4 max-w-2xl text-zinc-500">{page.excerpt}</p>}
      </section>
      <section className="mx-auto max-w-4xl px-4 pb-16 lg:px-8">
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          {content.split('\n').filter(Boolean).map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)}
        </div>
        <div className="mt-10 space-y-8">
          {sections.map((section: any, index: number) => (
            <div key={index} className="rounded-2xl border border-zinc-200 p-5 dark:border-white/10">
              {section.image && <img src={section.image} alt="" className="mb-4 max-h-96 w-full rounded-xl object-cover" />}
              {section.title && <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">{section.title}</h2>}
              {section.body && <p className="mt-3 whitespace-pre-line text-zinc-600 dark:text-zinc-400">{section.body}</p>}
              {section.items?.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {section.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="rounded-xl bg-zinc-50 p-4 dark:bg-white/5">
                      {item.image && <img src={item.image} alt="" className="mb-3 h-40 w-full rounded-lg object-cover" />}
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                      {item.body && <p className="mt-2 text-sm text-zinc-500">{item.body}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
