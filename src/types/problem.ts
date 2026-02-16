// Problem Service Types - v2.0 (Updated for new backend architecture)

// ============================================================================
// Enums & Core Types
// ============================================================================

export type TestCaseType = "DEFAULT" | "HIDDEN";
export type NodeType = "TREE_NODE" | "GRAPH_NODE" | "LIST_NODE" | null;
export type Language = "JAVA" | "PYTHON" | "CPP" | "JAVASCRIPT";
export type Difficulty = "Easy" | "Medium" | "Hard";

// ============================================================================
// Question Types
// ============================================================================

export interface QuestionSummary {
  id: number;
  questionTitle: string;
  difficultyLevel: Difficulty;
  tags: string[];
  company: string;
  acceptanceRate?: number;
  totalSubmissions?: number;
}

export interface QuestionMetadata {
  functionName: string;
  returnType: string;
  paramTypes: string[];
  paramNames: string[];
  language: Language;
  codeTemplate: string;
  executionStrategy: string;
  customInputEnabled: boolean;
}

export interface QuestionDetail {
  id: number;
  questionTitle: string;
  questionDescription: string;
  isOutputOrderMatters: boolean;
  tags: string[];
  difficultyLevel: Difficulty;
  company: string;
  constraints: string;
  timeoutLimit?: number;
  nodeType: NodeType;
  defaultTestcases: TestCase[];
  metadataList: QuestionMetadata[];
}

// ============================================================================
// Testcase Types (v2 - no expectedOutput, uses type enum)
// ============================================================================

export interface TestCase {
  id: number;
  questionId: number;
  input: string;
  type: TestCaseType;
}

/**
 * Editable testcase for frontend state management.
 * Tracks user modifications to default testcases.
 */
export interface EditableTestCase {
  id: number | null;  // null for user-added testcases
  input: string;
  originalInput?: string;  // Original value for reset functionality
  isModified: boolean;
  isUserAdded: boolean;
}

// ============================================================================
// Solution & Tag Types
// ============================================================================

export interface Solution {
  id: number;
  code: string;
  language: string;
  explanation?: string;
  questionId: number;
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface QuestionFilters {
  page?: number;
  size?: number;
  difficulty?: Difficulty;
  tag?: string;
  search?: string;
  company?: string;
}
