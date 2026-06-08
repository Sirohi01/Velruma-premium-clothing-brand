import { CmsRenderer } from '@/components/website/CmsRenderer';
import { generateCmsMetadata, getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateCmsMetadata('about', 'About VELRUMA', 'Learn about VELRUMA, a premium clothing brand focused on comfort and modern everyday style.');
}

export default async function AboutPage() {
  const page = await getPublishedCmsPage('about');
  return <CmsRenderer page={page} fallbackTitle="About VELRUMA" fallbackContent="VELRUMA is a premium clothing brand built for modern everyday style. Our collections focus on clean silhouettes, comfort-first fits, and quality details that make each piece feel considered." />;
}
