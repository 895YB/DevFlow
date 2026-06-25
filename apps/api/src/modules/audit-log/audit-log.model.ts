import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuditLog extends Document {
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  action: string;
  entity: {
    type: string;
    id: mongoose.Types.ObjectId;
    name: string;
  };
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: {
      type: { type: String, required: true },
      id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, default: '' },
    },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true },
);

auditLogSchema.index({ workspace: 1, createdAt: -1 });
auditLogSchema.index({ workspace: 1, 'entity.type': 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
