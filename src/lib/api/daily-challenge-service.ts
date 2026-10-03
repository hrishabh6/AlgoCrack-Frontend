import { ENDPOINTS } from "../constants";
import { apiClient, serverApiClient } from "../api-client";
import type { DailyChallengeResponse } from "@/types/daily-challenge";

/** Public today's challenge; returns null when none is published (404). */
export async function getTodayDailyChallenge(options?: {
  server?: boolean;
}): Promise<DailyChallengeResponse | null> {
  const client = options?.server ? serverApiClient : apiClient;
  try {
    return await client.get<DailyChallengeResponse>(`${ENDPOINTS.DAILY_CHALLENGES}/today`, {
      skipAuth: true,
    });
  } catch {
    return null;
  }
}
