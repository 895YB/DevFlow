import mongoose from 'mongoose';
import { Project } from '../projects/project.model.js';
import { Task } from '../tasks/task.model.js';
import { DocumentModel } from '../documents/document.model.js';
import { Snippet } from '../snippets/snippet.model.js';
import type { SearchResult } from '@devflow/shared';

const RESULTS_PER_TYPE = 5;

export async function globalSearch(
  workspaceId: string,
  query: string,
): Promise<SearchResult[]> {
  const wid = new mongoose.Types.ObjectId(workspaceId);
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [projects, tasks, documents, snippets] = await Promise.all([
    Project.find({ workspace: wid, deletedAt: null, name: regex })
      .select('_id name description color')
      .limit(RESULTS_PER_TYPE)
      .lean(),

    Task.find({ workspace: wid, deletedAt: null, title: regex })
      .select('_id title description project priority')
      .populate<{ project: { _id: mongoose.Types.ObjectId; name: string } }>('project', 'name')
      .limit(RESULTS_PER_TYPE)
      .lean(),

    DocumentModel.find({ workspace: wid, deletedAt: null, title: regex })
      .select('_id title')
      .limit(RESULTS_PER_TYPE)
      .lean(),

    Snippet.find({ workspace: wid, deletedAt: null, title: regex })
      .select('_id title language description')
      .limit(RESULTS_PER_TYPE)
      .lean(),
  ]);

  const results: SearchResult[] = [];

  for (const p of projects) {
    results.push({
      _id: String(p._id),
      type: 'project',
      title: p.name,
      subtitle: p.description || 'Project',
      url: `/projects/${String(p._id)}`,
    });
  }

  for (const t of tasks) {
    const proj = t.project as unknown as { _id: mongoose.Types.ObjectId; name: string } | null;
    results.push({
      _id: String(t._id),
      type: 'task',
      title: t.title,
      subtitle: proj?.name ?? 'Task',
      url: `/projects/${String(proj?._id ?? '')}`,
    });
  }

  for (const d of documents) {
    results.push({
      _id: String(d._id),
      type: 'document',
      title: d.title,
      subtitle: 'Document',
      url: `/documents`,
    });
  }

  for (const s of snippets) {
    results.push({
      _id: String(s._id),
      type: 'snippet',
      title: s.title,
      subtitle: s.language,
      url: `/snippets`,
    });
  }

  return results;
}
