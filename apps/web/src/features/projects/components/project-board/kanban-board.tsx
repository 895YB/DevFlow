import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import type { Project, Task } from '@devflow/shared';
import { useReorderTasks } from '@/features/tasks/hooks/use-tasks';
import { useWorkspace } from '@/app/providers/workspace-provider';

interface KanbanBoardProps {
  project: Project;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (statusId: string) => void;
}

export function KanbanBoard({ project, tasks, onTaskClick, onAddTask }: KanbanBoardProps) {
  const { activeWorkspaceId } = useWorkspace();
  const reorder = useReorderTasks(activeWorkspaceId!, project._id);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const sortedStatuses = useMemo(
    () => [...project.statuses].sort((a, b) => a.order - b.order),
    [project.statuses],
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const status of sortedStatuses) {
      map[status._id] = [];
    }
    for (const task of tasks) {
      const statusId = String(task.status);
      if (map[statusId]) {
        map[statusId].push(task);
      }
    }
    for (const key of Object.keys(map)) {
      map[key]!.sort((a, b) => a.order - b.order);
    }
    return map;
  }, [tasks, sortedStatuses]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id);

    const targetStatusId = sortedStatuses.find((s) => s._id === overId)?._id;
    if (!targetStatusId) return;

    const currentTasks = tasksByStatus[targetStatusId] ?? [];
    const reorderPayload = currentTasks.map((t, i) => ({
      taskId: t._id,
      status: targetStatusId,
      order: t._id === taskId ? 0 : i + 1,
    }));

    if (!currentTasks.find((t) => t._id === taskId)) {
      reorderPayload.push({ taskId, status: targetStatusId, order: 0 });
    }

    reorder.mutate(reorderPayload);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedStatuses.map((status) => (
          <KanbanColumn
            key={status._id}
            status={status}
            tasks={tasksByStatus[status._id] ?? []}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} onClick={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
}
