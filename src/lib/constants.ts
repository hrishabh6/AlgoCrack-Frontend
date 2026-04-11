// Prefer an explicit public gateway URL when one is intentionally provided.
// Otherwise default to same-origin so browser requests work behind Ingress
// without baking an environment-specific hostname into the bundle.
const gatewayBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

// API Configuration
export const API_URLS = {
  GATEWAY: gatewayBaseUrl,
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
