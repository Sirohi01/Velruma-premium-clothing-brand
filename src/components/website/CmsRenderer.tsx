import React from 'react';
import { ArrowUpRight, CheckCircle2, HelpCircle, ImageIcon, ShieldCheck } from 'lucide-react';

function splitParagraphs(content: string) {
  return String(content || '').split('\n').map((line) => line.trim()).filter(Boolean);
}

function sectionLabel(type?: string) {
  if (type === 'faq') return 'FAQ';
  if (type === 'gallery') return 'Lookbook';
  if (type === 'testimonial') return 'Customer Note';
  if (type === 'banner') return 'Highlight';
  if (type === 'image') return 'Visual';
  return 'Detail';
}

function MediaFrame({
  image,
  video,
  imageAspectRatio,
  imagePosition = 'center',
  videoAspectRatio,
  videoPosition = 'center',
  fit = 'cover',
  className = '',
}: {
  image?: string;
  video?: string;
  imageAspectRatio?: string;
  imagePosition?: string;
  videoAspectRatio?: string;
  videoPosition?: string;
  fit?: 'cover' | 'contain';
  className?: string;
}) {
  if (!image && !video) return null;

  return (
    <div className={`grid gap-3 ${className}`}>
      {image && (
        <div
          className="mx-auto max-h-[72vh] w-full overflow-hidden bg-zinc-100"
          style={{
            aspectRatio: imageAspectRatio || '16 / 9',
            maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(imageAspectRatio || '') ? 'min(100%, 520px)' : undefined,
          }}
        >
          <img src={image} alt="" className="h-full w-full" style={{ objectFit: fit, objectPosition: imagePosition || 'center' }} />
        </div>
      )}
      {video && (
        <div
          className="mx-auto max-h-[72vh] w-full overflow-hidden bg-zinc-100"
          style={{
            aspectRatio: videoAspectRatio || '16 / 9',
            maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(videoAspectRatio || '') ? 'min(100%, 520px)' : undefined,
          }}
        >
          <video src={video} className="h-full w-full" style={{ objectFit: fit, objectPosition: videoPosition || 'center' }} controls playsInline preload="metadata" />
        </div>
      )}
    </div>
  );
}

function HeroMedia({
  type,
  src,
  aspectRatio,
  position = 'center',
  fit = 'contain',
}: {
  type: 'image' | 'video';
  src: string;
  aspectRatio?: string;
  position?: string;
  fit?: 'cover' | 'contain';
}) {
  return (
    <div
      className="relative mx-auto max-h-[72vh] w-full overflow-hidden bg-[#EFE2CC] shadow-sm ring-1 ring-zinc-200"
      style={{
        aspectRatio: aspectRatio || '16 / 9',
        maxWidth: ['9 / 16', '4 / 5', '1 / 1'].includes(aspectRatio || '') ? 'min(100%, 520px)' : undefined,
      }}
    >
      {type === 'image' && fit === 'contain' && (
        <img src={src} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-xl" style={{ objectPosition: position }} />
      )}
      {type === 'image' ? (
        <img src={src} alt="" className="relative h-full w-full" style={{ objectFit: fit, objectPosition: position }} />
      ) : (
        <video src={src} className="relative h-full w-full" style={{ objectFit: fit, objectPosition: position }} controls playsInline preload="metadata" />
      )}
    </div>
  );
}

export function CmsRenderer({ page, fallbackTitle, fallbackContent }: { page?: any; fallbackTitle: string; fallbackContent: string }) {
  const title = page?.title || fallbackTitle;
  const content = page?.content || fallbackContent;
  const sections = page?.sections || [];
  const paragraphs = splitParagraphs(content);
  const schemaJson = page?.seo?.schemaJson || '';

  return (
    <div className="bg-[#F7F4EF] text-zinc-950">
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      )}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">{page?.type || 'VELRUMA'}</p>
            <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              {title}
            </h1>
            {page?.excerpt && <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">{page.excerpt}</p>}
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              <span className="rounded-full border border-zinc-200 bg-[#F7F4EF] px-3 py-1.5">Updated Content</span>
              <span className="rounded-full border border-zinc-200 bg-[#F7F4EF] px-3 py-1.5">VELRUMA Official</span>
              <span className="rounded-full border border-zinc-200 bg-[#F7F4EF] px-3 py-1.5">Customer Ready</span>
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl gap-4">
            {page?.heroImage && (
              <HeroMedia
                type="image"
                src={page.heroImage}
                aspectRatio={page?.heroImageAspectRatio}
                position={page?.heroImagePosition || 'center'}
                fit={page?.heroImageFit || 'contain'}
              />
            )}
            {page?.heroVideo && (
              <HeroMedia
                type="video"
                src={page.heroVideo}
                aspectRatio={page?.heroVideoAspectRatio}
                position={page?.heroVideoPosition || 'center'}
                fit={page?.heroVideoFit || 'contain'}
              />
            )}
            {!page?.heroImage && !page?.heroVideo && (
              <div className="relative overflow-hidden bg-[#EFE2CC]" style={{ aspectRatio: '16 / 9' }}>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#efe2cc,#f7f4ef_45%,#d9e6df)]" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8 lg:py-10">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-2 border-l border-zinc-200 pl-4 text-sm text-zinc-500">
            <p className="font-semibold uppercase tracking-wide text-zinc-900">On This Page</p>
            <a href="#overview" className="block hover:text-amber-700">Overview</a>
            {sections.map((section: any, index: number) => (
              <a key={index} href={`#section-${index}`} className="block hover:text-amber-700">
                {section.title || `${sectionLabel(section.type)} ${index + 1}`}
              </a>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div id="overview" className="bg-white px-4 py-5 shadow-sm ring-1 ring-zinc-200 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4 text-[15px] leading-7 text-zinc-600">
                {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </div>
              <div className="grid gap-2 text-sm">
                {['Premium fit notes', 'Admin managed content', 'Customer support ready'].map((item) => (
                  <div key={item} className="flex items-center gap-2 border border-zinc-200 bg-[#F7F4EF] px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-700" />
                    <span className="font-medium text-zinc-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {sections.map((section: any, index: number) => (
            <section key={index} id={`section-${index}`} className="bg-white px-4 py-5 shadow-sm ring-1 ring-zinc-200 sm:px-6 sm:py-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-950 text-sm font-bold text-white">
                  {section.type === 'faq' ? <HelpCircle className="h-4 w-4" /> : section.type === 'gallery' ? <ImageIcon className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">{sectionLabel(section.type)}</p>
                  {section.title && <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>{section.title}</h2>}
                </div>
              </div>

              <MediaFrame
                image={section.image}
                video={section.video}
                imageAspectRatio={section.imageAspectRatio}
                imagePosition={section.imagePosition}
                videoAspectRatio={section.videoAspectRatio}
                videoPosition={section.videoPosition}
                fit={section.mediaFit || 'cover'}
                className="mb-5 w-full"
              />
              {section.body && <p className="whitespace-pre-line text-[15px] leading-7 text-zinc-600">{section.body}</p>}

              {section.items?.length > 0 && (
                <div className={section.type === 'faq' ? 'mt-5 divide-y divide-zinc-200 border-y border-zinc-200' : 'mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
                  {section.items.map((item: any, itemIndex: number) => (
                    section.type === 'faq' ? (
                      <div key={itemIndex} className="py-4">
                        <h3 className="flex items-start gap-2 font-semibold text-zinc-950">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                          {item.title}
                        </h3>
                        {item.body && <p className="mt-2 pl-4 text-sm leading-6 text-zinc-600">{item.body}</p>}
                      </div>
                    ) : (
                      <div key={itemIndex} className="border border-zinc-200 bg-[#F7F4EF] p-4">
                        {item.image && <img src={item.image} alt="" className="mb-3 aspect-[4/3] w-full object-cover" />}
                        <h3 className="font-semibold text-zinc-950">{item.title}</h3>
                        {item.body && <p className="mt-2 text-sm leading-6 text-zinc-600">{item.body}</p>}
                        {item.link && (
                          <a href={item.link} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                            View <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
