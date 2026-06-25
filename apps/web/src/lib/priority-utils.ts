import type { TaskPriority } from '@devflow/shared';

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dotColor: string; badgeClass: string }> = {
  urgent: { label: 'Urgent', dotColor: 'bg-red-500', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  high: { label: 'High', dotColor: 'bg-orange-500', badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  medium: { label: 'Medium', dotColor: 'bg-yellow-500', badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
  low: { label: 'Low', dotColor: 'bg-blue-500', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  none: { label: 'None', dotColor: 'bg-gray-400', badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

export function getStatusFromProject(
  statuses: Array<{ _id: string; name: string; color: string }>,
  statusId: string,
) {
  return statuses.find((s) => s._id === statusId);
}
