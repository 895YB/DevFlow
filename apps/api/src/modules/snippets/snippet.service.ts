import { Snippet, type ISnippet } from './snippet.model.js';
import { SnippetFolder, type ISnippetFolder } from './snippet-folder.model.js';
import { AppError } from '../../utils/app-error.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';
import type { CreateSnippetInput, UpdateSnippetInput, SnippetQueryInput } from '@devflow/shared';

export async function createSnippet(
  workspaceId: string,
  userId: string,
  data: CreateSnippetInput,
): Promise<ISnippet> {
  return Snippet.create({
    workspace: workspaceId,
    title: data.title,
    description: data.description ?? '',
    language: data.language,
    code: data.code,
    tags: data.tags ?? [],
    folder: data.folder ?? null,
    visibility: data.visibility ?? 'personal',
    createdBy: userId,
  });
}

export async function getSnippets(
  workspaceId: string,
  userId: string,
  query: SnippetQueryInput,
) {
  const filter: Record<string, unknown> = {
    workspace: workspaceId,
    deletedAt: null,
  };

  if (query.visibility === 'personal') {
    filter['visibility'] = 'personal';
    filter['createdBy'] = userId;
  } else if (query.visibility === 'team') {
    filter['visibility'] = 'team';
  } else {
    filter['$or'] = [
      { visibility: 'team' },
      { visibility: 'personal', createdBy: userId },
    ];
  }

  if (query.language) filter['language'] = query.language;
  if (query.tag) filter['tags'] = query.tag;
  if (query.folder) filter['folder'] = query.folder;
  if (query.favorites === 'true') filter['favoritedBy'] = userId;

  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter['title'] = { $regex: escaped, $options: 'i' };
  }

  const sortField = query.sort ?? 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

  const { skip, limit, page } = parsePagination({ page: query.page, limit: query.limit });

  const [snippets, total] = await Promise.all([
    Snippet.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'displayName avatar'),
    Snippet.countDocuments(filter),
  ]);

  return { snippets, meta: buildPaginationMeta(page, limit, total) };
}

export async function getSnippetById(
  workspaceId: string,
  snippetId: string,
): Promise<ISnippet | null> {
  return Snippet.findOne({ _id: snippetId, workspace: workspaceId, deletedAt: null })
    .populate('createdBy', 'displayName avatar');
}

export async function updateSnippet(
  workspaceId: string,
  snippetId: string,
  data: UpdateSnippetInput,
): Promise<ISnippet> {
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update['title'] = data.title;
  if (data.description !== undefined) update['description'] = data.description;
  if (data.language !== undefined) update['language'] = data.language;
  if (data.code !== undefined) update['code'] = data.code;
  if (data.tags !== undefined) update['tags'] = data.tags;
  if (data.folder !== undefined) update['folder'] = data.folder;
  if (data.visibility !== undefined) update['visibility'] = data.visibility;

  const snippet = await Snippet.findOneAndUpdate(
    { _id: snippetId, workspace: workspaceId, deletedAt: null },
    { $set: update },
    { new: true },
  ).populate('createdBy', 'displayName avatar');

  if (!snippet) throw AppError.notFound('Snippet not found');
  return snippet;
}

export async function deleteSnippet(
  workspaceId: string,
  snippetId: string,
): Promise<void> {
  const result = await Snippet.findOneAndUpdate(
    { _id: snippetId, workspace: workspaceId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  if (!result) throw AppError.notFound('Snippet not found');
}

export async function toggleFavorite(
  workspaceId: string,
  snippetId: string,
  userId: string,
): Promise<ISnippet> {
  const snippet = await Snippet.findOne({
    _id: snippetId, workspace: workspaceId, deletedAt: null,
  });
  if (!snippet) throw AppError.notFound('Snippet not found');

  const isFavorited = snippet.favoritedBy.some((id) => String(id) === userId);

  const updated = await Snippet.findOneAndUpdate(
    { _id: snippetId },
    isFavorited
      ? { $pull: { favoritedBy: userId } }
      : { $addToSet: { favoritedBy: userId } },
    { new: true },
  ).populate('createdBy', 'displayName avatar');

  if (!updated) throw AppError.notFound('Snippet not found');
  return updated;
}

// Folders
export async function createFolder(
  workspaceId: string,
  userId: string,
  data: { name: string; parent?: string | null },
): Promise<ISnippetFolder> {
  const maxOrder = await SnippetFolder.findOne(
    { workspace: workspaceId, parent: data.parent ?? null },
    { order: 1 },
    { sort: { order: -1 } },
  );

  return SnippetFolder.create({
    workspace: workspaceId,
    name: data.name,
    parent: data.parent ?? null,
    order: (maxOrder?.order ?? -1) + 1,
    createdBy: userId,
  });
}

export async function getFolders(workspaceId: string): Promise<ISnippetFolder[]> {
  return SnippetFolder.find({ workspace: workspaceId }).sort({ parent: 1, order: 1 });
}

export async function updateFolder(
  workspaceId: string,
  folderId: string,
  data: { name?: string },
): Promise<ISnippetFolder> {
  const folder = await SnippetFolder.findOneAndUpdate(
    { _id: folderId, workspace: workspaceId },
    { $set: data },
    { new: true },
  );
  if (!folder) throw AppError.notFound('Folder not found');
  return folder;
}

export async function deleteFolder(
  workspaceId: string,
  folderId: string,
): Promise<void> {
  const result = await SnippetFolder.findOneAndDelete({
    _id: folderId, workspace: workspaceId,
  });
  if (!result) throw AppError.notFound('Folder not found');

  await Snippet.updateMany(
    { workspace: workspaceId, folder: folderId },
    { $set: { folder: null } },
  );

  await SnippetFolder.updateMany(
    { workspace: workspaceId, parent: folderId },
    { $set: { parent: null } },
  );
}
