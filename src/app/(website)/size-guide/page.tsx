import { CmsRenderer } from '@/components/website/CmsRenderer';
import { getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export default async function SizeGuidePage() {
  const page = await getPublishedCmsPage('size-guide');
  return <CmsRenderer page={page} fallbackTitle="Size Guide" fallbackContent="Use product measurements and fit notes before selecting your size. Oversized styles are intentionally relaxed, while regular fits follow standard measurements." />;
}
