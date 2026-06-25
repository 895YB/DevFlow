export interface DashboardStats {
  totalTasks: number;
  completedToday: number;
  activeProjects: number;
  focusMinutesToday: number;
}

export interface DashboardTask {
  _id: string;
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  dueDate: string | null;
  projectId: string;
  projectName: string;
  projectColor: string;
}

export interface DashboardProject {
  _id: string;
  name: string;
  icon: string;
  color: string;
  updatedAt: string;
}

export interface DashboardLeetCode {
  username: string;
  totalSolved: number;
  streak: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export interface DashboardGitHub {
  username: string;
  repoCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentProjects: DashboardProject[];
  todaysTasks: DashboardTask[];
  leetcode: DashboardLeetCode | null;
  github: DashboardGitHub | null;
}

export interface SearchResult {
  _id: string;
  type: 'project' | 'task' | 'document' | 'snippet';
  title: string;
  subtitle: string;
  url: string;
}
