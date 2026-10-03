export interface ProgressTier {
  code: string;
  name: string;
  currentMinimum: number;
  nextTierCode: string | null;
  nextThreshold: number | null;
  pointsToNext: number | null;
  progressPercent: number;
}

export interface ProgressScoreBreakdown {
  mastery: number;
  potd: number;
  breadth: number;
  quality: number;
  contest: number;
  total: number;
  qualityStatus: string;
  contestStatus: string;
}

export interface ProgressMetrics {
  uniqueSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalPotdCompleted: number;
  currentPotdStreak: number;
  longestPotdStreak: number;
  breadthQualifiedTopics: number;
}

export interface UserProgressResponse {
  userId: string;
  algorithmVersion: string;
  staleVersion: boolean;
  score: ProgressScoreBreakdown;
  tier: ProgressTier;
  metrics: ProgressMetrics;
  leaderboardPosition: number | null;
  calculatedAt: string | null;
}

export interface EarnedBadge {
  code: string;
  name: string;
  description: string;
  category: string;
  iconKey: string;
  earnedAt: string;
}

export interface LockedBadge {
  code: string;
  name: string;
  description: string;
  category: string;
  iconKey: string;
  progressCurrent?: number | null;
  progressTarget?: number | null;
}

export interface UserBadgesResponse {
  userId: string;
  earned: EarnedBadge[];
  locked: LockedBadge[];
}

export interface LeaderboardRow {
  position: number;
  userId: string;
  totalScore: number;
  tierCode: string;
  uniqueSolved: number;
  hardSolved: number;
  totalPotdCompleted: number;
  currentUser: boolean;
}

export interface LeaderboardResponse {
  content: LeaderboardRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
