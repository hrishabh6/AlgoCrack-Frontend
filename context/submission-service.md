# AlgoCrack Submission Service - Frontend Reference

This document provides a comprehensive guide for frontend developers integrating with the AlgoCrack Submission Service. It details the exposed API endpoints, the real-time WebSocket communication flow, and the internal processing logic.

## 1. Exposed APIs

### Base URL
`/api/v1/submissions`

### 1.1. Submit Code
Queue a new code submission for execution. The service returns immediately with a `submissionId` while processing continues asynchronously.

- **Endpoint:** `POST /api/v1/submissions`
- **Request Body:**
  ```json
  {
    "userId": 12345,
    "questionId": 100,
    "language": "JAVA",
    "code": "public class Solution { ... }",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 ..."
  }
  ```
- **Response (202 Accepted):**
  ```json
  {
    "submissionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING",
    "message": "Submission queued for processing"
  }
  ```

### 1.2. Get Submission Details
Retrieve the current status and results of a specific submission.

- **Endpoint:** `GET /api/v1/submissions/{submissionId}`
- **Response (200 OK):**
  ```json
  {
    "submissionId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": 12345,
    "questionId": 100,
    "language": "JAVA",
    "code": "public class Solution { ... }",
    "status": "COMPLETED",
    "verdict": "ACCEPTED",
    "runtimeMs": 15,
    "memoryKb": 25600,
    "passedTestCases": 10,
    "totalTestCases": 10,
    "errorMessage": null,
    "queuedAt": "2023-10-27T10:00:00",
    "startedAt": "2023-10-27T10:00:01",
    "completedAt": "2023-10-27T10:00:05"
  }
  ```
  *Note: Fields like `verdict`, `runtimeMs`, etc. will be null if status is PENDING or RUNNING.*

### 1.3. Get User Submission History
Retrieve a paginated list of submissions for a user.

- **Endpoint:** `GET /api/v1/submissions/user/{userId}?page=0&size=20`
- **Response (200 OK):** `Array` of Submission Detail objects (same structure as 1.2).

## 2. Real-time Status Updates (WebSocket)

The service pushes real-time updates to the client via WebSockets so the frontend can display progress without polling.

### Connection
- **Endpoint:** `/ws`
- **Transport:** SockJS is supported as a fallback.

### Subscriptions
Clients should subscribe to the specific topic for the submission they just created.

- **Topic:** `/topic/submission/{submissionId}`

### Message Types

#### A. Status Update
Sent when the state transitions (e.g., from PENDING to COMPILING, or to RUNNING).
```json
{
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "RUNNING"
}
```

#### B. Final Result
Sent when execution completes successfully.
```json
{
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "verdict": "ACCEPTED",
  "runtimeMs": 15,
  "memoryKb": 25600,
  "passedTestCases": 10,
  "totalTestCases": 10
}
```

#### C. Error Notification
Sent if processing fails (e.g., system error, compilation failure leading to exception).
```json
{
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "FAILED",
  "error": "Compilation failed: ..."
}
```

## 3. Internal Flow (End-to-End)

Understanding the backend flow helps in debugging and displaying appropriate UI states.

1.  **Submission Received:**
    *   Client POSTs code.
    *   Server saves the submission as `PENDING` and returns the `submissionId`.
    
2.  **Async Processing Start:**
    *   The request is handed off to the async processing service.
    *   Status updates to `COMPILING`.
    *   **WebSocket Update:** `{"status": "COMPILING"}`.

3.  **Preparation:**
    *   Service fetches `QuestionMetadata` (function signatures, return types) and `TestCases` for the question.
    *   An `ExecutionRequest` is constructed.

4.  **Code Execution (CXE):**
    *   The request is sent to the Code Execution Engine (CXE).
    *   Status updates to `RUNNING`.
    *   **WebSocket Update:** `{"status": "RUNNING"}`.

5.  **Polling & Validation:**
    *   Submission Service polls CXE for completion.
    *   Once results are received, the `ResultValidationService` compares actual outputs against expected outputs.
    *   A `SubmissionVerdict` is calculated (`ACCEPTED`, `WRONG_ANSWER`, `TLE`, etc.).

6.  **Completion:**
    *   Submission record is updated with final stats (runtime, memory, passed cases) and verdict.
    *   Question statistics (total submissions, acceptance rate) are updated.
    *   **WebSocket Result:** Full result object sent to client.

7.  **Failure Handling:**
    *   If any step fails (e.g., compilation error, runtime exception, or system timeout), the status is set to `FAILED`.
    *   **WebSocket Error:** Error message sent to client.
