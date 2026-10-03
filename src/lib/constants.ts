// Prefer an explicit public gateway URL when one is intentionally provided.
// Otherwise default to same-origin so browser requests work behind Ingress
// without baking an environment-specific hostname into the bundle.
const gatewayBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

// Server-side (SSR) uses internal K8s service URL to reach the API gateway.
// Falls back to the public URL if not set.
const serverBaseUrl =
  process.env.INTERNAL_API_BASE_URL?.trim() || gatewayBaseUrl;

// API Configuration
export const API_URLS = {
  GATEWAY: gatewayBaseUrl,
  // Use this for server-side data fetching (runs inside the K8s pod)
  SERVER_GATEWAY: typeof window === "undefined" ? serverBaseUrl : gatewayBaseUrl,
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Problem Service
  QUESTIONS: "/api/v1/questions",
  TAGS: "/api/v1/tags",
  TEST_CASES: "/api/v1/testcases",
  SOLUTIONS: "/api/v1/solutions",
  
  // Submission Service
  SUBMISSIONS: "/api/v1/submissions",
  
  // CXE Service
  EXECUTION: "/api/v1/execution",
  
  // User Profile
  USER_PROFILE: "/api/v1/user/profile",
  USER_HEATMAP: "/api/v1/user/heatmap",
  USER_STREAK: "/api/v1/user/streak",
  MY_SOLVED_IDS: "/api/v1/user/me/solved-question-ids",
  MY_QUESTIONS: "/api/v1/user/me/questions",

  // Problem lists (always authenticated)
  PROBLEM_LISTS: "/api/v1/problem-lists",

  // Daily challenge (public read)
  DAILY_CHALLENGES: "/api/v1/daily-challenges",

  // Progress & gamification (authenticated)
  PROGRESS: "/api/v1/progress",
  LEADERBOARD: "/api/v1/leaderboard",
} as const;

// Difficulty colors
export const DIFFICULTY_COLORS = {
  Easy: "text-green-500",
  Medium: "text-yellow-500",
  Hard: "text-red-500",
} as const;

// Verdict colors
export const VERDICT_COLORS = {
  ACCEPTED: "text-green-500",
  WRONG_ANSWER: "text-red-500",
  TIME_LIMIT_EXCEEDED: "text-orange-500",
  RUNTIME_ERROR: "text-red-500",
  COMPILATION_ERROR: "text-red-500",
} as const;

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
] as const;
