// Problem Service Types

export interface QuestionSummary {
  id: number;
  questionTitle: string;
  difficultyLevel: "Easy" | "Medium" | "Hard";
  tags: string[];
  company: string;
  acceptanceRate: number;
  totalSubmissions: number;
}

export interface QuestionDetail {
  id: number;
  questionTitle: string;
  questionDescription: string;
  isOutputOrderMatters: boolean;
  tags: string[];
  difficultyLevel: "Easy" | "Medium" | "Hard";
  company: string;
  constraints: string;
}

export interface TestCase {
  id: number;
  questionId: number;
  input: string;
  expectedOutput: string;
  orderIndex: number;
  isHidden: boolean;
}

export interface Solution {
  id: number;
  code: string;
  language: string;
  explanation: string;
  questionId: number;
}

export interface Tag {
  id: number;
  name: string;
  description: string;
}

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
  difficulty?: "Easy" | "Medium" | "Hard";
  tag?: string;
  search?: string;
  company?: string;
}
