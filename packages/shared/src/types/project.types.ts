export interface ProjectStatus {
  _id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  isDone: boolean;
}

export interface ProjectLabel {
  _id: string;
  name: string;
  color: string;
}

export interface ProjectGitHub {
  repoOwner: string;
  repoName: string;
  connected: boolean;
}

export interface Project {
  _id: string;
  workspace: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  statuses: ProjectStatus[];
  labels: ProjectLabel[];
  github: ProjectGitHub;
  createdBy: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
