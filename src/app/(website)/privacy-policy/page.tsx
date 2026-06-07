import { CmsRenderer } from '@/components/website/CmsRenderer';
import { getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export default async function PrivacyPolicyPage() {
  const page = await getPublishedCmsPage('privacy-policy');
  return <CmsRenderer page={page} fallbackTitle="Privacy Policy" fallbackContent="VELRUMA uses customer data to process orders, provide support, and improve the shopping experience. Sensitive payment gateway storage is not used in this manual payment flow." />;
}
