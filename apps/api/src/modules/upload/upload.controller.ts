import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import * as uploadService from './upload.service.js';

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');

  uploadService.validateFile(req.file, 'image');
  const result = await uploadService.uploadToCloudinary(req.file, 'images');
  sendSuccess(res, result, 201);
});

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');

  uploadService.validateFile(req.file, 'file');
  const result = await uploadService.uploadToCloudinary(req.file, 'files');
  sendSuccess(res, result, 201);
});
