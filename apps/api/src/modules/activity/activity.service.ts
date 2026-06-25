import { Activity, type IActivity } from './activity.model.js';
import type { ActivityType, ActivityResourceType } from '@devflow/shared';

export async function createActivity(input: {
  workspaceId: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  type: ActivityType;
  resourceType: ActivityResourceType;
  resourceId: string;
  resourceTitle: string;
}): Promise<IActivity> {
  return Activity.create({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    actorName: input.actorName,
    actorAvatar: input.actorAvatar ?? '',
    type: input.type,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    resourceTitle: input.resourceTitle,
  });
}

export async function listActivity(
  workspaceId: string,
  params: { cursor?: string; limit?: number },
): Promise<{ activities: IActivity[]; hasMore: boolean }> {
  const limit = Math.min(params.limit ?? 20, 50);
  const filter: Record<string, unknown> = { workspaceId };
  if (params.cursor) filter['_id'] = { $lt: params.cursor };

  const rows = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit + 1);
  const hasMore = rows.length > limit;
  return { activities: hasMore ? rows.slice(0, limit) : rows, hasMore };
}
