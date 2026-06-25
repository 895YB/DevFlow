import { useState } from 'react';
import { useParams } from 'react-router';
import { useWorkspace } from '@/app/providers/workspace-provider';
import { useProject } from '../hooks/use-projects';
import { useTasks, useCreateTask } from '@/features/tasks/hooks/use-tasks';
import { KanbanBoard } from './project-board/kanban-board';
import { ListView } from './project-list/list-view';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, LayoutGrid, List, Calendar as CalendarIcon, Settings } from 'lucide-react';
import type { Task } from '@devflow/shared';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const { activeWorkspaceId } = useWorkspace();
  const { data: project, isLoading: projectLoading } = useProject(activeWorkspaceId, projectId ?? null);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(activeWorkspaceId, projectId ?? null);
  const createTask = useCreateTask(activeWorkspaceId!, projectId!);

  const [view, setView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatusId, setCreateStatusId] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (projectLoading || tasksLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-[500px] animate-pulse rounded-lg bg-muted/50" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-muted-foreground">Project not found.</div>;
  }

  const tasks = tasksData?.tasks ?? [];

  const handleAddTask = (statusId: string) => {
    setCreateStatusId(statusId);
    setCreateOpen(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask.mutate(
      { title: newTaskTitle.trim(), status: createStatusId || undefined },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setNewTaskTitle('');
        },
      },
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${project.color}20` }}
          >
            <span className="text-lg" style={{ color: project.color }}>
              {project.icon || '#'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList>
              <TabsTrigger value="kanban" className="gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button size="sm" onClick={() => handleAddTask('')}>
            <Plus className="mr-1 h-4 w-4" />
            Task
          </Button>

          <Button variant="ghost" size="icon" aria-label="Project settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {view === 'kanban' && (
          <KanbanBoard
            project={project}
            tasks={tasks}
            onTaskClick={setSelectedTask}
            onAddTask={handleAddTask}
          />
        )}
        {view === 'list' && (
          <ListView
            project={project}
            tasks={tasks}
            onTaskClick={setSelectedTask}
          />
        )}
        {view === 'calendar' && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Calendar view coming soon.</p>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          project={project}
          workspaceId={activeWorkspaceId!}
          onClose={() => setSelectedTask(null)}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newTaskTitle.trim() || createTask.isPending}>
                {createTask.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
