import type { WorkspaceRole } from '../constants/roles.js';

export interface WorkspaceSettings {
  defaultProjectView: 'kanban' | 'list' | 'calendar';
  allowMemberInvites: boolean;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  owner: string;
  settings: WorkspaceSettings;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  _id: string;
  workspace: string;
  user: string;
  role: WorkspaceRole;
  invitedBy: string;
  invitedAt: Date;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
