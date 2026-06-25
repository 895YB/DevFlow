import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export function configureCloudinary(): void {
  if (env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    logger.info('Cloudinary configured');
  } else {
    logger.warn('Cloudinary not configured — file uploads will be unavailable');
  }
}

export { cloudinary };
