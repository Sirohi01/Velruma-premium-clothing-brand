import { CmsRenderer } from '@/components/website/CmsRenderer';
import { getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export default async function ShippingPolicyPage() {
  const page = await getPublishedCmsPage('shipping-policy');
  return <CmsRenderer page={page} fallbackTitle="Shipping Policy" fallbackContent="Orders are packed carefully and shipped across supported serviceable locations. Shipping charges and free shipping threshold are configured from admin settings." />;
}
