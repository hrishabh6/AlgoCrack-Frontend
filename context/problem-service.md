# AlgoCrack Problem Service API Documentation

This document provides detailed information about the API endpoints exposed by the AlgoCrack Problem Service.

## 1. Questions API

### 1.1 List Questions
**Endpoint:** `GET /api/v1/questions`

**Description:** List questions with pagination and filtering options.

**Query Parameters:**
- `page` (int, default: 0): Page number.
- `size` (int, default: 20): Number of items per page.
- `difficulty` (String, optional): Filter by difficulty (e.g., "Easy", "Medium", "Hard").
- `tag` (String, optional): Filter by tag.
- `search` (String, optional): Search term for question title.
- `company` (String, optional): Filter by company.

**Response:** `Page<QuestionSummaryDto>`
```json
{
  "content": [
    {
      "id": 1,
      "questionTitle": "Two Sum",
      "difficultyLevel": "Easy",
      "tags": ["Array", "Hash Table"],
      "company": "Google",
      "acceptanceRate": 48.5,
      "totalSubmissions": 1000
    }
  ],
  "pageable": { ... },
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

### 1.2 Create Question
**Endpoint:** `POST /api/v1/questions`

**Description:** Create a new question.

**Request Body:** `QuestionRequestDto`
```json
{
  "questionTitle": "Two Sum",
  "questionDescription": "Given an array of integers...",
  "testCases": [
    {
      "input": "[2,7,11,15], target = 9",
      "expectedOutput": "[0,1]",
      "orderIndex": 1,
      "isHidden": false
    }
  ],
  "metadataList": [
    {
      "functionName": "twoSum",
      "returnType": "int[]",
      "paramTypes": ["int[]", "int"],
      "paramNames": ["nums", "target"],
      "language": "JAVA",
      "codeTemplate": "class Solution { ... }",
      "executionStrategy": "DEFAULT",
      "customInputEnabled": true
    }
  ],
  "isOutputOrderMatters": true,
  "tags": [
    { "name": "Array" },
    { "name": "Hash Table" }
  ],
  "difficultyLevel": "Easy",
  "company": "Google",
  "constraints": "2 <= nums.length <= 10^4",
  "timeoutLimit": 2,
  "solution": [
      {
          "code": "...",
          "language": "JAVA"
      }
  ]
}
```

**Response:** `CreateQuestionResponseDto`
```json
{
  "questionId": 1,
  "message": "Question created successfully" // or similar
}
```

### 1.3 Get Question by ID
**Endpoint:** `GET /api/v1/questions/{id}`

**Description:** Retrieve detailed information about a specific question.

**Response:** `QuestionResponseDto`
```json
{
  "id": 1,
  "questionTitle": "Two Sum",
  "questionDescription": "Given an array of integers...",
  "isOutputOrderMatters": true,
  "tags": ["Array", "Hash Table"],
  "difficultyLevel": "Easy",
  "company": "Google",
  "constraints": "2 <= nums.length <= 10^4"
}
```

### 1.4 Update Question
**Endpoint:** `PUT /api/v1/questions/{id}`

**Description:** Update an existing question.

**Request Body:** `QuestionRequestDto` (Same as Create Question)

**Response:** `QuestionResponseDto` (Same as Get Question by ID)

### 1.5 Delete Question
**Endpoint:** `DELETE /api/v1/questions/{id}`

**Description:** Delete a question by its ID.

**Response:** `204 No Content`

---

## 2. Solutions API

### 2.1 Get Solutions by Question
**Endpoint:** `GET /api/v1/solutions/question/{questionId}`

**Description:** Get all solutions associated with a specific question.

**Response:** `List<SolutionResponseDto>`
```json
[
  {
    "id": 1,
    "code": "class Solution { ... }",
    "language": "JAVA",
    "explanation": "Brute force approach...",
    "questionId": 1
  }
]
```

### 2.2 Add Solution
**Endpoint:** `POST /api/v1/solutions`

**Description:** Add a new solution to a question.

**Request Body:** `CreateSolutionRequestDto`
```json
{
  "questionId": 1,
  "code": "class Solution { ... }",
  "language": "JAVA",
  "explanation": "Optimal approach using Hash Map"
}
```

**Response:** `SolutionResponseDto`
```json
{
  "id": 2,
  "code": "class Solution { ... }",
  "language": "JAVA",
  "explanation": "Optimal approach using Hash Map",
  "questionId": 1
}
```

### 2.3 Update Solution
**Endpoint:** `PUT /api/v1/solutions/{solutionId}`

**Description:** Update a specific solution.

**Request Body:** `UpdateSolutionRequestDto`
```json
{
  "code": "updated code...",
  "language": "JAVA",
  "explanation": "Updated explanation"
}
```

**Response:** `SolutionResponseDto`

### 2.4 Delete Solution
**Endpoint:** `DELETE /api/v1/solutions/{solutionId}`

**Description:** Delete a solution by its ID.

**Response:** `204 No Content`

---

## 3. Tags API

### 3.1 List Tags
**Endpoint:** `GET /api/v1/tags`

**Description:** List all available tags.

**Response:** `List<TagResponseDto>`
```json
[
  {
    "id": 1,
    "name": "Array",
    "description": "Problems involving arrays"
  }
]
```

### 3.2 Create Tag
**Endpoint:** `POST /api/v1/tags`

**Description:** Create a new tag.

**Request Body:** `CreateTagRequestDto`
```json
{
  "name": "Dynamic Programming",
  "description": "Problems solvable by breaking down into simpler subproblems"
}
```

**Response:** `201 Created`

### 3.3 Get Tag by ID
**Endpoint:** `GET /api/v1/tags/{id}`

**Description:** Get details of a specific tag.

**Response:** `TagResponseDto`

### 3.4 Delete Tag
**Endpoint:** `DELETE /api/v1/tags/{id}`

**Description:** Delete a tag by its ID.

**Response:** `204 No Content`

---

## 4. Test Cases API

### 4.1 Get Test Cases by Question
**Endpoint:** `GET /api/v1/testcases/question/{questionId}`

**Description:** Get all test cases for a specific question.

**Response:** `List<TestCaseResponseDto>`
```json
[
  {
    "id": 1,
    "questionId": 1,
    "input": "...",
    "expectedOutput": "...",
    "orderIndex": 1,
    "isHidden": false
  }
]
```

### 4.2 Add Test Case
**Endpoint:** `POST /api/v1/testcases`

**Description:** Add a new test case to a question.

**Request Body:** `TestCaseRequestDto`
```json
{
  "questionId": 1,
  "input": "...",
  "expectedOutput": "...",
  "orderIndex": 2,
  "isHidden": true
}
```

**Response:** `201 Created`

### 4.3 Get Test Case by ID
**Endpoint:** `GET /api/v1/testcases/{id}`

**Description:** Get details of a specific test case.

**Response:** `TestCaseResponseDto`

### 4.4 Update Test Case
**Endpoint:** `PUT /api/v1/testcases/{id}`

**Description:** Update a specific test case.

**Request Body:** `TestCaseRequestDto`

**Response:** `TestCaseResponseDto`

### 4.5 Delete Test Case
**Endpoint:** `DELETE /api/v1/testcases/{id}`

**Description:** Delete a test case by its ID.

**Response:** `204 No Content`
