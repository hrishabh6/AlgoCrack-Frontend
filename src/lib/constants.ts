// API Configuration
export const API_URLS = {
  PROBLEM: "http://localhost:8084",
  SUBMISSION: "http://localhost:8080",
  EXECUTION: "http://localhost:8081",
  WEBSOCKET: "http://localhost:8080/ws",
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
