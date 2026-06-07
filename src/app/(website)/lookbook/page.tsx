import { CmsRenderer } from '@/components/website/CmsRenderer';
import { getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export default async function LookbookPage() {
  const page = await getPublishedCmsPage('lookbook');
  return <CmsRenderer page={page} fallbackTitle="Lookbook" fallbackContent="Explore seasonal styling ideas, campaign visuals, and curated outfit stories from VELRUMA." />;
}
