import { CmsRenderer } from '@/components/website/CmsRenderer';
import { generateCmsMetadata, getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateCmsMetadata('privacy-policy', 'Privacy Policy', 'Read how VELRUMA handles customer data, order details, support information, and privacy practices.');
}

export default async function PrivacyPolicyPage() {
  const page = await getPublishedCmsPage('privacy-policy');
  return <CmsRenderer page={page} fallbackTitle="Privacy Policy" fallbackContent="VELRUMA uses customer data to process orders, provide support, and improve the shopping experience. Sensitive payment gateway storage is not used in this manual payment flow." />;
}
