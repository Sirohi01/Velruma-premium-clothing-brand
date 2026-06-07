import { CmsRenderer } from '@/components/website/CmsRenderer';
import { getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const page = await getPublishedCmsPage('about');
  return <CmsRenderer page={page} fallbackTitle="About VELRUMA" fallbackContent="VELRUMA is a premium clothing brand built for modern everyday style. Our collections focus on clean silhouettes, comfort-first fits, and quality details that make each piece feel considered." />;
}
