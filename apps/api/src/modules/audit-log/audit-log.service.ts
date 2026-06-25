import type { Request } from 'express';
import { AuditLog } from './audit-log.model.js';
import { logger } from '../../utils/logger.js';
import type mongoose from 'mongoose';

interface LogParams {
  workspace: mongoose.Types.ObjectId | string;
  user: mongoose.Types.ObjectId | string;
  action: string;
  entity: {
    type: string;
    id: mongoose.Types.ObjectId | string;
    name: string;
  };
  details?: Record<string, unknown>;
  req?: Request;
}

export function logAction(params: LogParams): void {
  AuditLog.create({
    workspace: params.workspace,
    user: params.user,
    action: params.action,
    entity: params.entity,
    details: params.details ?? {},
    ipAddress: params.req?.ip ?? '',
    userAgent: params.req?.headers['user-agent'] ?? '',
  }).catch((err) => {
    logger.error('Failed to write audit log', { error: err });
  });
}
