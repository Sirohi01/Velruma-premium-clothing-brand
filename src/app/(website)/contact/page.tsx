import { CmsRenderer } from '@/components/website/CmsRenderer';
import { getPublishedCmsPage } from '@/lib/cms-page';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const page = await getPublishedCmsPage('contact');
  return <CmsRenderer page={page} fallbackTitle="Contact Us" fallbackContent="Need help with an order, return, sizing, or bulk enquiry? Reach the VELRUMA support team from your account support page or email us from the contact details in the footer." />;
}
