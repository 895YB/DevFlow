import { Project, type IProject } from './project.model.js';
import { AppError } from '../../utils/app-error.js';
import type { CreateProjectInput, UpdateProjectInput, CreateStatusInput, UpdateStatusInput, CreateLabelInput, UpdateLabelInput } from '@devflow/shared';

export async function createProject(
  workspaceId: string,
  userId: string,
  data: CreateProjectInput,
): Promise<IProject> {
  return Project.create({
    workspace: workspaceId,
    name: data.name,
    description: data.description ?? '',
    icon: data.icon ?? '',
    color: data.color ?? '#3B82F6',
    createdBy: userId,
  });
}

export async function getProjects(workspaceId: string): Promise<IProject[]> {
  return Project.find({ workspace: workspaceId, deletedAt: null }).sort({ createdAt: -1 });
}

export async function getProjectById(
  workspaceId: string,
  projectId: string,
): Promise<IProject | null> {
  return Project.findOne({ _id: projectId, workspace: workspaceId, deletedAt: null });
}

export async function updateProject(
  workspaceId: string,
  projectId: string,
  data: UpdateProjectInput,
): Promise<IProject> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update['name'] = data.name;
  if (data.description !== undefined) update['description'] = data.description;
  if (data.icon !== undefined) update['icon'] = data.icon;
  if (data.color !== undefined) update['color'] = data.color;

  const project = await Project.findOneAndUpdate(
    { _id: projectId, workspace: workspaceId, deletedAt: null },
    { $set: update },
    { new: true },
  );
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

export async function deleteProject(workspaceId: string, projectId: string): Promise<void> {
  const result = await Project.findOneAndUpdate(
    { _id: projectId, workspace: workspaceId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  if (!result) throw AppError.notFound('Project not found');
}

export async function addStatus(
  workspaceId: string,
  projectId: string,
  data: CreateStatusInput,
): Promise<IProject> {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId, deletedAt: null });
  if (!project) throw AppError.notFound('Project not found');

  const maxOrder = project.statuses.reduce((max, s) => Math.max(max, s.order), -1);

  project.statuses.push({
    name: data.name,
    color: data.color,
    order: maxOrder + 1,
    isDefault: data.isDefault ?? false,
    isDone: data.isDone ?? false,
  } as never);

  if (data.isDefault) {
    project.statuses.forEach((s) => {
      if (s.name !== data.name) s.isDefault = false;
    });
  }

  await project.save();
  return project;
}

export async function updateStatus(
  workspaceId: string,
  projectId: string,
  statusId: string,
  data: UpdateStatusInput,
): Promise<IProject> {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId, deletedAt: null });
  if (!project) throw AppError.notFound('Project not found');

  const status = project.statuses.find((s) => String(s._id) === statusId);
  if (!status) throw AppError.notFound('Status not found');

  if (data.name !== undefined) status.name = data.name;
  if (data.color !== undefined) status.color = data.color;
  if (data.isDefault !== undefined) {
    status.isDefault = data.isDefault;
    if (data.isDefault) {
      project.statuses.forEach((s) => {
        if (String(s._id) !== statusId) s.isDefault = false;
      });
    }
  }
  if (data.isDone !== undefined) status.isDone = data.isDone;

  await project.save();
  return project;
}

export async function deleteStatus(
  workspaceId: string,
  projectId: string,
  statusId: string,
): Promise<IProject> {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId, deletedAt: null });
  if (!project) throw AppError.notFound('Project not found');

  if (project.statuses.length <= 1) {
    throw AppError.badRequest('Cannot delete the last status');
  }

  const idx = project.statuses.findIndex((s) => String(s._id) === statusId);
  if (idx === -1) throw AppError.notFound('Status not found');

  project.statuses.splice(idx, 1);
  await project.save();
  return project;
}

export async function reorderStatuses(
  workspaceId: string,
  projectId: string,
  orderedIds: string[],
): Promise<IProject> {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId, deletedAt: null });
  if (!project) throw AppError.notFound('Project not found');

  orderedIds.forEach((id, index) => {
    const status = project.statuses.find((s) => String(s._id) === id);
    if (status) status.order = index;
  });

  project.statuses.sort((a, b) => a.order - b.order);
  await project.save();
  return project;
}

export async function addLabel(
  workspaceId: string,
  projectId: string,
  data: CreateLabelInput,
): Promise<IProject> {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, workspace: workspaceId, deletedAt: null },
    { $push: { labels: { name: data.name, color: data.color } } },
    { new: true },
  );
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

export async function updateLabel(
  workspaceId: string,
  projectId: string,
  labelId: string,
  data: UpdateLabelInput,
): Promise<IProject> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update['labels.$.name'] = data.name;
  if (data.color !== undefined) update['labels.$.color'] = data.color;

  const project = await Project.findOneAndUpdate(
    { _id: projectId, workspace: workspaceId, deletedAt: null, 'labels._id': labelId },
    { $set: update },
    { new: true },
  );
  if (!project) throw AppError.notFound('Project or label not found');
  return project;
}

export async function deleteLabel(
  workspaceId: string,
  projectId: string,
  labelId: string,
): Promise<IProject> {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, workspace: workspaceId, deletedAt: null },
    { $pull: { labels: { _id: labelId } } },
    { new: true },
  );
  if (!project) throw AppError.notFound('Project not found');
  return project;
}
