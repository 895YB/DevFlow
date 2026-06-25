import { LeetCodeProfile, type ILeetCodeProfile } from './leetcode-profile.model.js';
import { AppError } from '../../utils/app-error.js';
import { logger } from '../../utils/logger.js';

const LEETCODE_API = 'https://leetcode.com/graphql';
const CACHE_TTL = 30 * 60 * 1000;
const REQUEST_TIMEOUT = 15000;

async function leetcodeFetch(
  query: string,
  variables: Record<string, unknown> = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(LEETCODE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DevFlow',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`LeetCode API returned ${res.status}`);
    }

    const data = (await res.json()) as { data: unknown; errors?: unknown[] };
    if (data.errors) {
      throw new Error(
        `LeetCode GraphQL errors: ${JSON.stringify(data.errors)}`,
      );
    }

    return data.data;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw AppError.badRequest(
        'LeetCode API request timed out. Please try again.',
      );
    }
    logger.error('LeetCode API error', { error: err });
    throw AppError.badRequest(
      'Failed to fetch LeetCode data. The username may be incorrect or LeetCode may be unavailable.',
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchUserProfile(username: string) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          userAvatar
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      allQuestionsCount {
        difficulty
        count
      }
    }
  `;

  const data = (await leetcodeFetch(query, { username })) as {
    matchedUser: {
      username: string;
      profile: { ranking: number; reputation: number; userAvatar: string };
      submitStatsGlobal: {
        acSubmissionNum: Array<{ difficulty: string; count: number }>;
      };
    } | null;
    allQuestionsCount: Array<{ difficulty: string; count: number }>;
  };

  if (!data.matchedUser) {
    throw AppError.notFound(`LeetCode user "${username}" not found`);
  }

  const user = data.matchedUser;
  const acStats = user.submitStatsGlobal.acSubmissionNum;
  const totalQuestions = data.allQuestionsCount;

  const getStat = (
    arr: Array<{ difficulty: string; count: number }>,
    diff: string,
  ) => arr.find((s) => s.difficulty === diff)?.count ?? 0;

  return {
    profile: {
      ranking: user.profile.ranking,
      reputation: user.profile.reputation,
      avatar: user.profile.userAvatar,
    },
    stats: {
      totalSolved: getStat(acStats, 'All'),
      easySolved: getStat(acStats, 'Easy'),
      mediumSolved: getStat(acStats, 'Medium'),
      hardSolved: getStat(acStats, 'Hard'),
      totalQuestions: getStat(totalQuestions, 'All'),
      easyTotal: getStat(totalQuestions, 'Easy'),
      mediumTotal: getStat(totalQuestions, 'Medium'),
      hardTotal: getStat(totalQuestions, 'Hard'),
      acceptanceRate: 0,
    },
  };
}

async function fetchRecentSubmissions(username: string) {
  const query = `
    query getRecentSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        lang
      }
    }
  `;

  const data = (await leetcodeFetch(query, { username, limit: 20 })) as {
    recentAcSubmissionList: Array<{
      title: string;
      titleSlug: string;
      timestamp: string;
      lang: string;
    }>;
  };

  return (data.recentAcSubmissionList ?? []).map((s) => ({
    title: s.title,
    titleSlug: s.titleSlug,
    difficulty: '',
    status: 'Accepted',
    language: s.lang,
    timestamp: new Date(Number(s.timestamp) * 1000),
  }));
}

function calculateStreak(
  submissions: Array<{ timestamp: Date }>,
  currentStreak: number,
  longestStreak: number,
) {
  if (submissions.length === 0) {
    return { current: 0, longest: longestStreak, lastSolveDate: null as Date | null };
  }

  const lastSolve = submissions[0]!.timestamp;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastSolveDay = new Date(lastSolve);
  lastSolveDay.setHours(0, 0, 0, 0);

  const daysSinceLastSolve = Math.floor(
    (today.getTime() - lastSolveDay.getTime()) / 86400000,
  );

  let newStreak: number;
  if (daysSinceLastSolve === 0) {
    newStreak = Math.max(currentStreak, 1);
  } else if (daysSinceLastSolve === 1) {
    newStreak = currentStreak + 1;
  } else {
    newStreak = 0;
  }

  return {
    current: newStreak,
    longest: Math.max(longestStreak, newStreak),
    lastSolveDate: lastSolve,
  };
}

export async function connectLeetCode(
  userId: string,
  username: string,
): Promise<ILeetCodeProfile> {
  const profileData = await fetchUserProfile(username);

  const existing = await LeetCodeProfile.findOne({ user: userId });
  if (existing) {
    existing.username = username;
    existing.profile = profileData.profile;
    existing.stats = profileData.stats;
    existing.lastSyncedAt = new Date();
    await existing.save();
    return existing;
  }

  return LeetCodeProfile.create({
    user: userId,
    username,
    profile: profileData.profile,
    stats: profileData.stats,
    lastSyncedAt: new Date(),
  });
}

export async function disconnectLeetCode(userId: string): Promise<void> {
  const result = await LeetCodeProfile.findOneAndDelete({ user: userId });
  if (!result) throw AppError.notFound('LeetCode not connected');
}

export async function getProfile(
  userId: string,
): Promise<ILeetCodeProfile | null> {
  return LeetCodeProfile.findOne({ user: userId });
}

export async function syncProfile(
  userId: string,
): Promise<ILeetCodeProfile> {
  const profile = await LeetCodeProfile.findOne({ user: userId });
  if (!profile) throw AppError.notFound('LeetCode not connected');

  const cacheExpired =
    !profile.lastSyncedAt ||
    Date.now() - profile.lastSyncedAt.getTime() > CACHE_TTL;

  if (!cacheExpired) return profile;

  try {
    const [profileData, submissions] = await Promise.all([
      fetchUserProfile(profile.username),
      fetchRecentSubmissions(profile.username),
    ]);

    profile.profile = profileData.profile;
    profile.stats = profileData.stats;
    profile.recentSubmissions = submissions;
    profile.lastSyncedAt = new Date();

    const streakResult = calculateStreak(
      submissions,
      profile.streaks.current,
      profile.streaks.longest,
    );
    profile.streaks.current = streakResult.current;
    profile.streaks.longest = streakResult.longest;
    profile.streaks.lastSolveDate = streakResult.lastSolveDate;

    await profile.save();
    return profile;
  } catch (err) {
    logger.warn('LeetCode sync failed, returning cached data', { error: err });
    return profile;
  }
}

export async function addManualEntry(
  userId: string,
  data: {
    problemName: string;
    difficulty: string;
    notes?: string;
    solutionCode?: string;
  },
): Promise<ILeetCodeProfile> {
  const profile = await LeetCodeProfile.findOne({ user: userId });
  if (!profile) throw AppError.notFound('LeetCode not connected');

  profile.manualEntries.push({
    problemName: data.problemName,
    difficulty: data.difficulty,
    notes: data.notes ?? '',
    solutionCode: data.solutionCode ?? '',
    solvedAt: new Date(),
  } as never);

  await profile.save();
  return profile;
}

export async function deleteManualEntry(
  userId: string,
  entryId: string,
): Promise<ILeetCodeProfile> {
  const profile = await LeetCodeProfile.findOneAndUpdate(
    { user: userId },
    { $pull: { manualEntries: { _id: entryId } } },
    { new: true },
  );
  if (!profile) throw AppError.notFound('LeetCode not connected');
  return profile;
}
