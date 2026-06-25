import mongoose from 'mongoose';
import { AppError } from './app-error.js';

export function validateObjectId(id: string, label = 'ID'): string {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest(`Invalid ${label}: ${id}`);
  }
  return id;
}
