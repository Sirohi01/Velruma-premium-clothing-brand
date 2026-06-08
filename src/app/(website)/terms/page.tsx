import { CmsRenderer } from '@/components/website/CmsRenderer';
import { generateCmsMetadata, getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateCmsMetadata('terms', 'Terms & Conditions', 'Read VELRUMA terms and conditions for website usage, orders, payments, shipping, and returns.');
}

export default async function TermsPage() {
  const page = await getPublishedCmsPage('terms');
  return <CmsRenderer page={page} fallbackTitle="Terms & Conditions" fallbackContent="By shopping with VELRUMA, customers agree to product availability, manual payment verification, shipping timelines, return policies, and support workflows published on this website." />;
}
