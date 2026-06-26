import mongoose from 'mongoose';
import { Task } from '../tasks/task.model.js';
import { Project } from '../projects/project.model.js';
import { DocumentModel } from '../documents/document.model.js';
import { Snippet } from '../snippets/snippet.model.js';
import { ApiCollection } from '../api-tester/api-collection.model.js';

const ALL_TYPES = ['tasks', 'projects', 'documents', 'snippets', 'api_collections'] as const;
type ExportType = (typeof ALL_TYPES)[number];

export function parseTypes(raw: string | undefined): ExportType[] {
  if (!raw) return [...ALL_TYPES];
  const requested = raw.split(',').map((s) => s.trim());
  return requested.filter((t): t is ExportType => (ALL_TYPES as readonly string[]).includes(t));
}

export async function exportData(
  workspaceId: string,
  clerkUserId: string,
  types: ExportType[],
): Promise<Record<string, unknown>> {
  const wid = new mongoose.Types.ObjectId(workspaceId);

  const queries: Promise<void>[] = [];
  const result: Record<string, unknown> = {};

  if (types.includes('tasks')) {
    queries.push(
      Task.find({ workspace: wid, deletedAt: null })
        .select('-__v')
        .lean()
        .then((d) => {
          result['tasks'] = d;
        }),
    );
  }

  if (types.includes('projects')) {
    queries.push(
      Project.find({ workspace: wid, deletedAt: null })
        .select('-__v')
        .lean()
        .then((d) => {
          result['projects'] = d;
        }),
    );
  }

  if (types.includes('documents')) {
    queries.push(
      DocumentModel.find({ workspace: wid, deletedAt: null })
        .select('-__v -content')
        .lean()
        .then((d) => {
          result['documents'] = d;
        }),
    );
  }

  if (types.includes('snippets')) {
    queries.push(
      Snippet.find({ workspace: wid, deletedAt: null })
        .select('-__v')
        .lean()
        .then((d) => {
          result['snippets'] = d;
        }),
    );
  }

  if (types.includes('api_collections')) {
    queries.push(
      ApiCollection.find({ userId: clerkUserId })
        .select('-__v')
        .lean()
        .then((d) => {
          result['api_collections'] = d;
        }),
    );
  }

  await Promise.all(queries);
  return result;
}
