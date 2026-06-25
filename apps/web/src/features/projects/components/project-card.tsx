import { useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FolderKanban } from 'lucide-react';
import type { Project } from '@devflow/shared';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/projects/${project._id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/projects/${project._id}`);
      }}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${project.color}20` }}
          >
            {project.icon ? (
              <span className="text-lg">{project.icon}</span>
            ) : (
              <FolderKanban className="h-5 w-5" style={{ color: project.color }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{project.name}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1 line-clamp-2 text-xs">
                {project.description}
              </CardDescription>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>{project.statuses.length} statuses</span>
          <span>{project.labels.length} labels</span>
        </div>
      </CardHeader>
    </Card>
  );
}
