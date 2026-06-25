import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, CheckCircle2, Circle, MessageSquare, History, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUpdateTask, useTaskComments, useAddComment, useTaskActivities } from '../hooks/use-tasks';
import type { Task, Project } from '@devflow/shared';

interface TaskDetailSheetProps {
  task: Task;
  project: Project;
  workspaceId: string;
  onClose: () => void;
}

export function TaskDetailSheet({ task, project, workspaceId, onClose }: TaskDetailSheetProps) {
  const updateTask = useUpdateTask(workspaceId, project._id);
  const { data: comments } = useTaskComments(workspaceId, project._id, task._id);
  const { data: activities } = useTaskActivities(workspaceId, project._id, task._id);
  const addComment = useAddComment(workspaceId, project._id, task._id);
  const [commentText, setCommentText] = useState('');

  const handleStatusChange = (statusId: string) => {
    updateTask.mutate({ taskId: task._id, status: statusId });
  };

  const handlePriorityChange = (priority: string) => {
    updateTask.mutate({ taskId: task._id, priority });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(
      { content: commentText.trim() },
      { onSuccess: () => setCommentText('') },
    );
  };

  return (
    <Sheet open onOpenChange={() => onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-lg">{task.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select value={String(task.status)} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9" id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {project.statuses.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={task.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-9" id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['urgent', 'high', 'medium', 'low', 'none'].map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}

          <Separator />

          {task.description && (
            <div>
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">Description</h4>
              <p className="whitespace-pre-wrap text-sm">{task.description}</p>
            </div>
          )}

          {task.subtasks.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
              </h4>
              <div className="space-y-1">
                {task.subtasks.map((subtask) => (
                  <div key={subtask._id} className="flex items-center gap-2 text-sm">
                    {subtask.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(subtask.completed && 'text-muted-foreground line-through')}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <Tabs defaultValue="comments">
            <TabsList className="w-full">
              <TabsTrigger value="comments" className="flex-1 gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 gap-1.5">
                <History className="h-3.5 w-3.5" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4 space-y-4">
              <div className="space-y-3">
                {comments?.map((comment) => {
                  const author = typeof comment.author === 'object' ? comment.author : null;
                  return (
                    <div key={comment._id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{author?.displayName ?? 'User'}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  );
                })}
                {!comments?.length && (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addComment.isPending}
                  aria-label="Send comment"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <div className="space-y-3">
                {activities?.map((activity) => {
                  const actor = typeof activity.user === 'object' ? activity.user : null;
                  return (
                    <div key={activity._id} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                      <div>
                        <span className="font-medium">{actor?.displayName ?? 'User'}</span>
                        <span className="text-muted-foreground"> {activity.action.replace(/_/g, ' ')}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {!activities?.length && (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
