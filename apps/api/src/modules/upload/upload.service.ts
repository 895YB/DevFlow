import { cloudinary } from '../../config/cloudinary.js';
import { AppError } from '../../utils/app-error.js';

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_DOC_SIZE = 25 * 1024 * 1024;

export function validateFile(
  file: Express.Multer.File,
  type: 'image' | 'file',
): void {
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;

  if (!allowedTypes.includes(file.mimetype)) {
    throw AppError.badRequest(`File type ${file.mimetype} is not allowed`);
  }

  if (file.size > maxSize) {
    throw AppError.badRequest(`File size exceeds the ${maxSize / 1024 / 1024}MB limit`);
  }
}

export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `devflow/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(AppError.internal('File upload failed'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          size: result.bytes,
        });
      },
    );

    stream.end(file.buffer);
  });
}
