import { CmsRenderer } from '@/components/website/CmsRenderer';
import { generateCmsMetadata, getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateCmsMetadata('return-policy', 'Return Policy', 'Read VELRUMA return policy, return eligibility, and return request process.');
}

export default async function ReturnPolicyPage() {
  const page = await getPublishedCmsPage('return-policy');
  return <CmsRenderer page={page} fallbackTitle="Return Policy" fallbackContent="Eligible orders can be returned within the configured return window if products are unused, unwashed, and returned with original packaging. Raise returns from your customer account." />;
}
