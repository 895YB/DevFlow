export type AnalyticsPeriod = '7d' | '30d' | '90d';

export interface AnalyticsBucket {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface AnalyticsTotals {
  tasksCompleted: number;
  projectsCreated: number;
  focusMinutes: number;
  documentsCreated: number;
  apiRequests: number;
  totalTasks: number;
  openTasks: number;
}

export interface AnalyticsData {
  period: AnalyticsPeriod;
  tasksCompleted: AnalyticsBucket[];
  projectsCreated: AnalyticsBucket[];
  focusMinutes: AnalyticsBucket[];
  documentsCreated: AnalyticsBucket[];
  apiRequests: AnalyticsBucket[];
  totals: AnalyticsTotals;
  taskCompletionRate: number; // 0–100
}
