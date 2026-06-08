import { CmsRenderer } from '@/components/website/CmsRenderer';
import { generateCmsMetadata, getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateCmsMetadata('shipping-policy', 'Shipping Policy', 'Read VELRUMA shipping policy, delivery timelines, charges, and order tracking information.');
}

export default async function ShippingPolicyPage() {
  const page = await getPublishedCmsPage('shipping-policy');
  return <CmsRenderer page={page} fallbackTitle="Shipping Policy" fallbackContent="Orders are packed carefully and shipped across supported serviceable locations. Shipping charges and free shipping threshold are configured from admin settings." />;
}
