import { CmsRenderer } from '@/components/website/CmsRenderer';
import { generateCmsMetadata, getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateCmsMetadata('lookbook', 'VELRUMA Lookbook', 'Explore VELRUMA lookbook stories, campaign styling, and seasonal outfit inspiration.');
}

export default async function LookbookPage() {
  const page = await getPublishedCmsPage('lookbook');
  return <CmsRenderer page={page} fallbackTitle="Lookbook" fallbackContent="Explore seasonal styling ideas, campaign visuals, and curated outfit stories from VELRUMA." />;
}
