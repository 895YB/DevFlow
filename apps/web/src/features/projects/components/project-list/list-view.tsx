import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Task, Project } from '@devflow/shared';

interface ListViewProps {
  project: Project;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const priorityLabels: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
  low: { label: 'Low', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  none: { label: 'None', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

export function ListView({ project, tasks, onTaskClick }: ListViewProps) {
  const getStatusName = (statusId: string) => {
    const status = project.statuses.find((s) => s._id === statusId);
    return status?.name ?? 'Unknown';
  };

  const getStatusColor = (statusId: string) => {
    const status = project.statuses.find((s) => s._id === statusId);
    return status?.color ?? '#6B7280';
  };

  if (!tasks.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">No tasks yet. Create your first task.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Due Date</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Subtasks</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const priority = priorityLabels[task.priority] ?? priorityLabels['none']!;
            return (
              <tr
                key={task._id}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                onClick={() => onTaskClick(task)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onTaskClick(task);
                }}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium">{task.title}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getStatusColor(String(task.status)) }}
                    />
                    <span className="text-xs">{getStatusName(String(task.status))}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={cn('text-[10px]', priority.className)}>
                    {priority.label}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                  {task.subtasks.length > 0
                    ? `${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length}`
                    : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
