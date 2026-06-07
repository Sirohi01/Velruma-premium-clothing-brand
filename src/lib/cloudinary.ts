import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImage(
  file: string, // base64 or URL
  folder: string = 'velruma',
  options?: {
    transformation?: Record<string, unknown>[];
    publicId?: string;
  }
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `velruma/${folder}`,
    public_id: options?.publicId,
    transformation: options?.transformation,
    resource_type: 'auto',
  });

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export async function uploadMultipleImages(
  files: string[],
  folder: string = 'velruma'
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map((file) => uploadImage(file, folder))
  );
  return results;
}

export function getOptimizedUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
}): string {
  return cloudinary.url(publicId, {
    fetch_format: options?.format || 'auto',
    quality: options?.quality || 'auto',
    width: options?.width,
    height: options?.height,
    crop: 'fill',
  });
}

export default cloudinary;
