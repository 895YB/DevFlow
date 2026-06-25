import { useWorkspace } from '@/app/providers/workspace-provider';
import { useProjects } from '../hooks/use-projects';
import { ProjectCard } from './project-card';
import { CreateProjectDialog } from './create-project-dialog';
import { FolderKanban } from 'lucide-react';

export function ProjectsPage() {
  const { activeWorkspaceId } = useWorkspace();
  const { data: projects, isLoading } = useProjects(activeWorkspaceId);

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        {activeWorkspaceId && (
          <CreateProjectDialog workspaceId={activeWorkspaceId} />
        )}
      </div>

      {!projects?.length ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12">
          <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to start managing tasks.
          </p>
          {activeWorkspaceId && (
            <div className="mt-4">
              <CreateProjectDialog workspaceId={activeWorkspaceId} />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
