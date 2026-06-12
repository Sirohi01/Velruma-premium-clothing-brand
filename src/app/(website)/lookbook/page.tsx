import dbConnect from '@/lib/db';
import { generateCmsMetadata } from '@/lib/cms-page';
import LookbookItem from '@/models/LookbookItem';
import LookbookGallery, { type WebsiteLookbookItem } from './LookbookGallery';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateCmsMetadata(
    'lookbook',
    'VELRUMA Lookbook',
    'Explore VELRUMA lookbook stories, campaign styling, and seasonal outfit inspiration.'
  );
}

async function getLookbookItems(): Promise<WebsiteLookbookItem[]> {
  await dbConnect();
  const items = await LookbookItem.find({ isActive: true, status: 'published' })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return items.map((item: any) => ({
    id: String(item._id),
    title: item.title || '',
    caption: item.caption || '',
    type: item.type || 'photo',
    mediaUrl: item.mediaUrl || '',
    instagramUrl: item.instagramUrl || '',
    thumbnailUrl: item.thumbnailUrl || '',
    alt: item.alt || item.title || 'VELRUMA lookbook visual',
    category: item.category || '',
    season: item.season || '',
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    sortOrder: Number(item.sortOrder || 0),
    isFeatured: Boolean(item.isFeatured),
  }));
}

export default async function LookbookPage() {
  const items = await getLookbookItems();
  return <LookbookGallery items={items} />;
}
