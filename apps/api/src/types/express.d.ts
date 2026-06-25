import type { WorkspaceRole } from '@devflow/shared';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      userId?: string;
      workspaceId?: string;
      dbUserId?: string;
      workspaceMembership?: {
        role: WorkspaceRole;
        memberId: string;
      };
    }
  }
}

export {};
