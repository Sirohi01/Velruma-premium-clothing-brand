import { CmsRenderer } from '@/components/website/CmsRenderer';
import { generateCmsMetadata, getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateCmsMetadata('faq', 'FAQ', 'Answers to common VELRUMA questions about orders, shipping, payment, returns, sizing, and support.');
}

export default async function FaqPage() {
  const page = await getPublishedCmsPage('faq');
  return <CmsRenderer page={page} fallbackTitle="FAQ" fallbackContent="Orders are processed after checkout confirmation. COD and manual UPI proof flows are supported. Returns are handled from the customer dashboard and support tickets can be raised anytime." />;
}
