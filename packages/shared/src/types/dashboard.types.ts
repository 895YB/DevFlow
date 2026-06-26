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

export interface DashboardActivityItem {
  _id: string;
  type: string;
  resourceType: string;
  resourceTitle: string;
  actorName: string;
  actorAvatar: string;
  createdAt: string;
}

export interface DashboardApiRequest {
  _id: string;
  method: string;
  url: string;
  status: number | null;
  duration: number | null;
  executedAt: string;
}

export interface DashboardPomodoroSummary {
  todaySessions: number;
  todayFocusMinutes: number;
  streak: number;
}

export interface DashboardUpcomingTask {
  _id: string;
  title: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  projectName: string;
  projectColor: string;
  projectId: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentProjects: DashboardProject[];
  todaysTasks: DashboardTask[];
  leetcode: DashboardLeetCode | null;
  github: DashboardGitHub | null;
  recentActivity: DashboardActivityItem[];
  recentApiRequests: DashboardApiRequest[];
  pomodoroSummary: DashboardPomodoroSummary;
  unreadNotifications: number;
  upcomingTasks: DashboardUpcomingTask[];
}

export interface SearchResult {
  _id: string;
  type: 'project' | 'task' | 'document' | 'snippet' | 'api_collection' | 'notification';
  title: string;
  subtitle: string;
  url: string;
}
