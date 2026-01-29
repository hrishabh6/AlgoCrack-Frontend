# Frontend Integration Guide - Custom Test Cases

## Quick Reference

### Base URL
```
http://localhost:8081/api/v1/execution
```

---

## 1. Submit Code with Custom Test Cases

**Endpoint**: `POST /submit`

### Request Format
```javascript
const submitCode = async (code, officialTestCases, customTestCases) => {
  const response = await fetch('http://localhost:8081/api/v1/execution/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      submissionId: crypto.randomUUID(), // Optional
      userId: currentUserId,
      questionId: currentQuestionId,
      language: "java", // or "python"
      code: code,
      metadata: {
        functionName: "twoSum",
        returnType: "int[]",
        parameters: [
          { name: "nums", type: "int[]" },
          { name: "target", type: "int" }
        ]
      },
      testCases: officialTestCases,      // Official test cases (required)
      customTestCases: customTestCases    // Your custom test cases (optional)
    })
  });
  return response.json();
};
```

### Example Request Body
```json
{
  "language": "java",
  "code": "class Solution { ... }",
  "testCases": [
    {
      "input": {
        "nums": [2, 7, 11, 15],
        "target": 9
      }
    }
  ],
  "customTestCases": [
    {
      "input": {
        "nums": [1, 2, 3],
        "target": 5
      }
    },
    {
      "input": {
        "nums": [],
        "target": 0
      }
    }
  ]
}
```

### Immediate Response (202 Accepted)
```json
{
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "QUEUED",
  "message": "Submission queued for execution",
  "queuePosition": 1,
  "statusUrl": "/api/v1/execution/status/550e8400-...",
  "resultsUrl": "/api/v1/execution/results/550e8400-..."
}
```

---

## 2. Poll for Results

**Endpoint**: `GET /results/{submissionId}`

Poll every **1-2 seconds** until `status === "COMPLETED"` or `status === "FAILED"`.

### Example Polling
```javascript
const pollResults = async (submissionId) => {
  const response = await fetch(
    `http://localhost:8081/api/v1/execution/results/${submissionId}`
  );
  return response.json();
};

// Poll every 1.5 seconds
const interval = setInterval(async () => {
  const result = await pollResults(submissionId);
  
  if (result.status === "COMPLETED" || result.status === "FAILED") {
    clearInterval(interval);
    handleResults(result);
  }
}, 1500);
```

### Final Response Format
```json
{
  "submissionId": "550e8400-...",
  "status": "COMPLETED",
  "verdict": "ACCEPTED",
  "runtimeMs": 15,
  "memoryKb": 12451,
  "testCaseResults": [
    {
      "index": 0,
      "passed": true,
      "actualOutput": "[0,1]",
      "executionTimeMs": 2,
      "memoryBytes": 12746752,
      "isCustom": false,        // Official test case
      "error": null
    },
    {
      "index": 1,
      "passed": false,
      "actualOutput": "[1,2]",
      "executionTimeMs": 1,
      "memoryBytes": 11534336,
      "isCustom": true,         // Custom test case
      "error": null
    },
    {
      "index": 2,
      "passed": true,
      "actualOutput": "[]",
      "executionTimeMs": 0,
      "memoryBytes": 10485760,
      "isCustom": true,         // Custom test case
      "error": null
    }
  ]
}
```

---

## 3. Understanding the Response

### Verdict Rules
- **`verdict`** is calculated **ONLY from official test cases** (`isCustom: false`)
- Custom test case failures **DO NOT affect** the verdict
- If all official TCs pass → `verdict: "ACCEPTED"` (even if custom TCs fail)

### Example Scenarios

| Official TCs | Custom TCs | Verdict |
|--------------|------------|---------|
| ✅ All pass | ✅ All pass | `ACCEPTED` |
| ✅ All pass | ❌ Some fail | `ACCEPTED` ⚠️ Custom failures ignored |
| ❌ Some fail | ✅ All pass | `WRONG_ANSWER` / `RUNTIME_ERROR` |

### Filtering Test Cases in UI
```javascript
// Separate official and custom test case results
const officialResults = results.testCaseResults.filter(tc => !tc.isCustom);
const customResults = results.testCaseResults.filter(tc => tc.isCustom);

// Display them in separate sections
<div>
  <h3>Official Test Cases</h3>
  {officialResults.map(tc => <TestCaseCard key={tc.index} {...tc} />)}
  
  <h3>Your Custom Test Cases</h3>
  {customResults.map(tc => <TestCaseCard key={tc.index} {...tc} />)}
</div>
```

---

## 4. Error Handling

### Compilation Error
```json
{
  "status": "COMPLETED",
  "verdict": "COMPILATION_ERROR",
  "compilationOutput": "Main.java:10: error: ';' expected\n...",
  "testCaseResults": []
}
```

### Runtime Error
```json
{
  "testCaseResults": [
    {
      "index": 0,
      "passed": false,
      "error": "java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 3",
      "errorType": "RUNTIME_ERROR",
      "isCustom": false
    }
  ]
}
```

### Timeout
```json
{
  "verdict": "TIME_LIMIT_EXCEEDED",
  "testCaseResults": [...]
}
```

---

## 5. TypeScript Interface (Optional)

```typescript
interface SubmitRequest {
  submissionId?: string;
  userId: number;
  questionId: number;
  language: "java" | "python";
  code: string;
  metadata: {
    functionName: string;
    returnType: string;
    parameters: Array<{ name: string; type: string }>;
  };
  testCases: Array<{ input: Record<string, any> }>;
  customTestCases?: Array<{ input: Record<string, any> }>;
}

interface TestCaseResult {
  index: number;
  passed: boolean;
  actualOutput: string;
  executionTimeMs: number;
  memoryBytes: number;
  isCustom: boolean;
  error: string | null;
  errorType: string | null;
}

interface SubmissionResult {
  submissionId: string;
  status: "QUEUED" | "COMPILING" | "RUNNING" | "COMPLETED" | "FAILED";
  verdict?: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR";
  runtimeMs?: number;
  memoryKb?: number;
  testCaseResults: TestCaseResult[];
}
```

---

## 6. UI Recommendations

### Display Custom Test Cases Separately
- Show official test cases first (these determine the verdict)
- Show custom test cases in a separate "Your Test Cases" section
- Add a visual indicator (e.g., badge) for custom test cases

### Visual Cues
```jsx
<TestCaseCard>
  {tc.isCustom && <Badge color="purple">Custom</Badge>}
  {tc.passed ? <CheckIcon /> : <XIcon />}
  <Output>{tc.actualOutput}</Output>
  {tc.isCustom && tc.passed === false && (
    <Note>⚠️ This failure doesn't affect your verdict</Note>
  )}
</TestCaseCard>
```

### Verdict Display
```jsx
{verdict === "ACCEPTED" && customResults.some(tc => !tc.passed) && (
  <InfoBox>
    ✅ Accepted! Note: Some custom test cases failed, 
    but they don't affect your score.
  </InfoBox>
)}
```

---

## Quick Start Example

```javascript
// 1. Submit code
const { submissionId } = await submitCode(
  userCode,
  questionTestCases,
  userCustomTestCases
);

// 2. Poll for results
let result;
do {
  await new Promise(r => setTimeout(r, 1500));
  result = await pollResults(submissionId);
} while (result.status !== "COMPLETED" && result.status !== "FAILED");

// 3. Display results
const officialTests = result.testCaseResults.filter(tc => !tc.isCustom);
const customTests = result.testCaseResults.filter(tc => tc.isCustom);

console.log(`Verdict: ${result.verdict}`);
console.log(`Official: ${officialTests.filter(tc => tc.passed).length}/${officialTests.length} passed`);
console.log(`Custom: ${customTests.filter(tc => tc.passed).length}/${customTests.length} passed`);
```

---

## Notes

- `customTestCases` is **optional** - omit if user doesn't provide custom tests
- Maximum execution time: **10 seconds**
- Memory limit: **256 MB**
- Custom test cases count toward execution time but not verdict
