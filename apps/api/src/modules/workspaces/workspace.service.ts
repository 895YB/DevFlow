import { Workspace, type IWorkspace } from './workspace.model.js';
import { WorkspaceMember, type IWorkspaceMember } from './workspace-member.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../utils/app-error.js';
import type { WorkspaceRole } from '@devflow/shared';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 0;
  while (await Workspace.exists({ slug })) {
    counter++;
    slug = `${base}-${counter}`;
  }
  return slug;
}

export async function createWorkspace(
  ownerId: string,
  data: { name: string; description?: string; icon?: string },
): Promise<{ workspace: IWorkspace; member: IWorkspaceMember }> {
  const slug = await uniqueSlug(generateSlug(data.name));

  const workspace = await Workspace.create({
    name: data.name,
    slug,
    description: data.description ?? '',
    icon: data.icon ?? '',
    owner: ownerId,
  });

  const member = await WorkspaceMember.create({
    workspace: workspace._id,
    user: ownerId,
    role: 'owner',
    invitedBy: ownerId,
  });

  return { workspace, member };
}

export async function getWorkspaceById(id: string): Promise<IWorkspace | null> {
  return Workspace.findOne({ _id: id, deletedAt: null });
}

export async function getWorkspaceBySlug(slug: string): Promise<IWorkspace | null> {
  return Workspace.findOne({ slug, deletedAt: null });
}

export async function getUserWorkspaces(userId: string): Promise<IWorkspace[]> {
  const memberships = await WorkspaceMember.find({ user: userId }).select('workspace');
  const workspaceIds = memberships.map((m) => m.workspace);
  return Workspace.find({ _id: { $in: workspaceIds }, deletedAt: null }).sort({ createdAt: -1 });
}

export async function updateWorkspace(
  id: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    settings?: {
      defaultProjectView?: 'kanban' | 'list' | 'calendar';
      allowMemberInvites?: boolean;
    };
  },
): Promise<IWorkspace> {
  const update: Record<string, unknown> = {};

  if (data.name !== undefined) update['name'] = data.name;
  if (data.description !== undefined) update['description'] = data.description;
  if (data.icon !== undefined) update['icon'] = data.icon;

  if (data.settings) {
    if (data.settings.defaultProjectView !== undefined)
      update['settings.defaultProjectView'] = data.settings.defaultProjectView;
    if (data.settings.allowMemberInvites !== undefined)
      update['settings.allowMemberInvites'] = data.settings.allowMemberInvites;
  }

  const workspace = await Workspace.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: update },
    { new: true },
  );

  if (!workspace) throw AppError.notFound('Workspace not found');
  return workspace;
}

export async function deleteWorkspace(id: string): Promise<void> {
  const result = await Workspace.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  if (!result) throw AppError.notFound('Workspace not found');
}

export async function getMembers(workspaceId: string): Promise<IWorkspaceMember[]> {
  return WorkspaceMember.find({ workspace: workspaceId }).populate(
    'user',
    'displayName email avatar profile',
  );
}

export async function getMembership(
  workspaceId: string,
  userId: string,
): Promise<IWorkspaceMember | null> {
  return WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
  invitedBy: string,
): Promise<IWorkspaceMember> {
  const user = await User.findOne({ email, deletedAt: null });
  if (!user) throw AppError.notFound('User not found with that email');

  const existing = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: user._id,
  });
  if (existing) throw AppError.conflict('User is already a member of this workspace');

  return WorkspaceMember.create({
    workspace: workspaceId,
    user: user._id,
    role,
    invitedBy,
  });
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole,
): Promise<IWorkspaceMember> {
  const existing = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId });
  if (!existing) throw AppError.notFound('Member not found');
  if (existing.role === 'owner') throw AppError.forbidden('Cannot change the owner role');

  existing.role = role;
  await existing.save();
  return existing;
}

export async function removeMember(
  workspaceId: string,
  memberId: string,
): Promise<void> {
  const member = await WorkspaceMember.findOne({
    _id: memberId,
    workspace: workspaceId,
  });
  if (!member) throw AppError.notFound('Member not found');
  if (member.role === 'owner')
    throw AppError.forbidden('Cannot remove the workspace owner');

  await WorkspaceMember.deleteOne({ _id: memberId });
}

export async function leaveWorkspace(
  workspaceId: string,
  userId: string,
): Promise<void> {
  const member = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });
  if (!member) throw AppError.notFound('Not a member of this workspace');
  if (member.role === 'owner')
    throw AppError.forbidden('Owner cannot leave the workspace. Transfer ownership first.');

  await WorkspaceMember.deleteOne({ _id: member._id });
}
