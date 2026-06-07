import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';

export async function getPublishedCmsPage(slug: string) {
  await dbConnect();
  return CmsPage.findOne({ slug, status: 'published' }).lean();
}
