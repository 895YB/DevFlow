import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Task } from '@devflow/shared';
import { format, isPast, isToday } from 'date-fns';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  none: 'bg-gray-400',
};

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick();
      }}
      role="button"
      tabIndex={0}
    >
      <p className="text-sm font-medium">{task.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {task.priority !== 'none' && (
          <div className="flex items-center gap-1">
            <div className={cn('h-2 w-2 rounded-full', priorityColors[task.priority])} />
            <span className="text-xs capitalize text-muted-foreground">{task.priority}</span>
          </div>
        )}

        {task.dueDate && (
          <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), 'MMM d')}
          </div>
        )}
      </div>

      {(task.assignees.length > 0 || task.subtasks.length > 0) && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((assignee, i) => (
              <div
                key={typeof assignee === 'string' ? assignee : i}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px]"
              >
                <User2 className="h-3 w-3" />
              </div>
            ))}
          </div>

          {task.subtasks.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
