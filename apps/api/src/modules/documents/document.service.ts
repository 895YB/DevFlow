import { DocumentModel, type IDocument } from './document.model.js';
import { DocumentVersion, type IDocumentVersion } from './document-version.model.js';
import { AppError } from '../../utils/app-error.js';
import type { CreateDocumentInput, UpdateDocumentInput, DocumentTreeNode } from '@devflow/shared';

export async function createDocument(
  workspaceId: string,
  userId: string,
  data: CreateDocumentInput,
): Promise<IDocument> {
  const maxOrder = await DocumentModel.findOne(
    { workspace: workspaceId, parent: data.parent ?? null, deletedAt: null },
    { order: 1 },
    { sort: { order: -1 } },
  );

  return DocumentModel.create({
    workspace: workspaceId,
    title: data.title,
    content: data.content ?? '',
    icon: data.icon ?? '',
    parent: data.parent ?? null,
    order: (maxOrder?.order ?? -1) + 1,
    createdBy: userId,
    lastEditedBy: userId,
  });
}

interface DocumentListItem {
  _id: string;
  title: string;
  icon: string;
  parent: string | null;
  order: number;
}

async function getDocumentList(workspaceId: string): Promise<DocumentListItem[]> {
  const docs = await DocumentModel.find({ workspace: workspaceId, deletedAt: null })
    .sort({ parent: 1, order: 1 })
    .select('title icon parent order')
    .lean();

  return docs.map((d) => ({
    _id: String(d._id),
    title: d.title,
    icon: d.icon,
    parent: d.parent ? String(d.parent) : null,
    order: d.order,
  }));
}

export async function buildDocumentTree(workspaceId: string): Promise<DocumentTreeNode[]> {
  const docs = await getDocumentList(workspaceId);

  const nodeMap = new Map<string, DocumentTreeNode>();
  const roots: DocumentTreeNode[] = [];

  for (const doc of docs) {
    nodeMap.set(String(doc._id), {
      _id: String(doc._id),
      title: doc.title,
      icon: doc.icon,
      parent: doc.parent ? String(doc.parent) : null,
      order: doc.order,
      children: [],
    });
  }

  for (const node of nodeMap.values()) {
    if (node.parent) {
      const parentNode = nodeMap.get(node.parent);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  const sortChildren = (nodes: DocumentTreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    for (const n of nodes) sortChildren(n.children);
  };
  sortChildren(roots);

  return roots;
}

export async function getDocumentById(
  workspaceId: string,
  documentId: string,
): Promise<IDocument | null> {
  return DocumentModel.findOne({ _id: documentId, workspace: workspaceId, deletedAt: null })
    .populate('createdBy', 'displayName avatar')
    .populate('lastEditedBy', 'displayName avatar');
}

export async function updateDocument(
  workspaceId: string,
  documentId: string,
  userId: string,
  data: UpdateDocumentInput,
): Promise<IDocument> {
  const existing = await DocumentModel.findOne({
    _id: documentId, workspace: workspaceId, deletedAt: null,
  });
  if (!existing) throw AppError.notFound('Document not found');

  const contentChanged =
    data.content !== undefined && data.content !== existing.content;

  if (contentChanged) {
    await DocumentVersion.create({
      document: documentId,
      title: existing.title,
      content: existing.content,
      editedBy: userId,
    });
  }

  const update: Record<string, unknown> = { lastEditedBy: userId };
  if (data.title !== undefined) update['title'] = data.title;
  if (data.content !== undefined) update['content'] = data.content;
  if (data.icon !== undefined) update['icon'] = data.icon;
  if (data.coverImage !== undefined) update['coverImage'] = data.coverImage;

  const doc = await DocumentModel.findOneAndUpdate(
    { _id: documentId },
    { $set: update },
    { new: true },
  )
    .populate('createdBy', 'displayName avatar')
    .populate('lastEditedBy', 'displayName avatar');

  if (!doc) throw AppError.notFound('Document not found');
  return doc;
}

export async function deleteDocument(
  workspaceId: string,
  documentId: string,
): Promise<void> {
  const result = await DocumentModel.findOneAndUpdate(
    { _id: documentId, workspace: workspaceId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  if (!result) throw AppError.notFound('Document not found');

  await DocumentModel.updateMany(
    { workspace: workspaceId, parent: documentId, deletedAt: null },
    { $set: { parent: result.parent } },
  );
}

async function wouldCreateCycle(
  documentId: string,
  targetParentId: string | null,
): Promise<boolean> {
  if (!targetParentId) return false;
  if (targetParentId === documentId) return true;

  let currentId: string | null = targetParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === documentId) return true;
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const ancestor = await DocumentModel.findById(currentId).select('parent').lean() as { parent?: unknown } | null;
    currentId = ancestor?.parent ? String(ancestor.parent) : null;
  }

  return false;
}

export async function moveDocument(
  workspaceId: string,
  documentId: string,
  parent: string | null,
  order?: number,
): Promise<IDocument> {
  if (await wouldCreateCycle(documentId, parent)) {
    throw AppError.badRequest('Cannot move a document under one of its own descendants');
  }

  const update: Record<string, unknown> = { parent };

  if (order !== undefined) {
    update['order'] = order;
  } else {
    const maxOrder = await DocumentModel.findOne(
      { workspace: workspaceId, parent, deletedAt: null },
      { order: 1 },
      { sort: { order: -1 } },
    );
    update['order'] = (maxOrder?.order ?? -1) + 1;
  }

  const doc = await DocumentModel.findOneAndUpdate(
    { _id: documentId, workspace: workspaceId, deletedAt: null },
    { $set: update },
    { new: true },
  );
  if (!doc) throw AppError.notFound('Document not found');
  return doc;
}

export async function reorderDocuments(
  workspaceId: string,
  orderedIds: string[],
): Promise<void> {
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, workspace: workspaceId },
      update: { $set: { order: index } },
    },
  }));
  await DocumentModel.bulkWrite(bulkOps as never);
}

export async function searchDocuments(
  workspaceId: string,
  query: string,
  limit = 20,
) {
  const docs = await DocumentModel.find(
    { workspace: workspaceId, deletedAt: null, $text: { $search: query } },
    { score: { $meta: 'textScore' } },
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .select('title icon parent updatedAt')
    .lean();

  return docs.map((d) => ({
    _id: String(d._id),
    title: d.title,
    icon: d.icon,
    parent: d.parent ? String(d.parent) : null,
    updatedAt: d.updatedAt,
  }));
}

// Versions
export async function getVersions(documentId: string): Promise<IDocumentVersion[]> {
  return DocumentVersion.find({ document: documentId })
    .populate('editedBy', 'displayName avatar')
    .sort({ createdAt: -1 })
    .limit(50);
}

export async function getVersion(
  documentId: string,
  versionId: string,
): Promise<IDocumentVersion | null> {
  return DocumentVersion.findOne({ _id: versionId, document: documentId })
    .populate('editedBy', 'displayName avatar');
}

export async function restoreVersion(
  workspaceId: string,
  documentId: string,
  versionId: string,
  userId: string,
): Promise<IDocument> {
  const version = await DocumentVersion.findOne({
    _id: versionId,
    document: documentId,
  });
  if (!version) throw AppError.notFound('Version not found');

  const current = await DocumentModel.findOne({
    _id: documentId, workspace: workspaceId, deletedAt: null,
  });
  if (!current) throw AppError.notFound('Document not found');

  await DocumentVersion.create({
    document: documentId,
    title: current.title,
    content: current.content,
    editedBy: userId,
  });

  const doc = await DocumentModel.findOneAndUpdate(
    { _id: documentId },
    {
      $set: {
        title: version.title,
        content: version.content,
        lastEditedBy: userId,
      },
    },
    { new: true },
  )
    .populate('createdBy', 'displayName avatar')
    .populate('lastEditedBy', 'displayName avatar');

  if (!doc) throw AppError.notFound('Document not found');
  return doc;
}
