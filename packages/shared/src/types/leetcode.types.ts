export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalQuestions: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
  acceptanceRate: number;
}

export interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  difficulty: string;
  status: string;
  language: string;
  timestamp: Date;
}

export interface LeetCodeContest {
  title: string;
  ranking: number;
  score: number;
  date: Date;
}

export interface LeetCodeStreaks {
  current: number;
  longest: number;
  lastSolveDate: Date | null;
}

export interface LeetCodeManualEntry {
  _id: string;
  problemName: string;
  difficulty: string;
  notes: string;
  solutionCode: string;
  solvedAt: Date;
}

export interface LeetCodeProfile {
  _id: string;
  user: string;
  username: string;
  profile: {
    ranking: number;
    reputation: number;
    avatar: string;
  };
  stats: LeetCodeStats;
  recentSubmissions: LeetCodeSubmission[];
  contests: LeetCodeContest[];
  streaks: LeetCodeStreaks;
  manualEntries: LeetCodeManualEntry[];
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
