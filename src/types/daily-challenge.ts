export interface DailyChallengeProblemSummary {
  id: number;
  title: string;
  difficulty: string;
  primaryTopic: string | null;
  tags: string[];
  href: string;
}

export interface DailyChallengeResponse {
  id: number;
  challengeDate: string;
  startsAt: string;
  nextResetAt: string;
  problem: DailyChallengeProblemSummary;
}
