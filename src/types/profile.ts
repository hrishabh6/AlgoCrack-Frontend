// User Profile Types — matches GET /api/v1/user/profile/{userId}

export interface UserDetails {
  userId: string;
  name: string;
  rank: string;
  headline: string;
  about: string;
  location: string;
  school: string;
  website: string;
  githubProfile: string;
  twitterProfile: string;
  linkedinProfile: string;
  skills: string; // comma-separated
  imgUrl: string;
}

export interface UserStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
}

export interface LanguageStat {
  language: string;
  problemsSolved: number;
}

export interface RecentSubmission {
  submissionId: string;
  questionTitle: string;
  questionSlug: string;
  verdict: string;
  timestamp: string; // ISO datetime
}

export interface HeatmapActivity {
  date: string;   // yyyy-MM-dd
  count: number;   // >= 1
}

export interface HeatmapResponse {
  year: number | null;
  from: string;            // yyyy-MM-dd
  to: string;              // yyyy-MM-dd
  totalSubmissions: number;
  totalActiveDays: number;
  activity: HeatmapActivity[];
}

export interface UserProfileResponse {
  userDetails: UserDetails;
  userStats: UserStats;
  languageStats: LanguageStat[];
  recentSubmissions: RecentSubmission[];
}
