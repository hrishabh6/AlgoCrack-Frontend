import { describe, expect, it } from "vitest";
import { isComplexityAnalysisEligible } from "./eligibility";

describe("isComplexityAnalysisEligible", () => {
  it("allows accepted completed Java submissions", () => {
    expect(
      isComplexityAnalysisEligible({
        verdict: "ACCEPTED",
        status: "COMPLETED",
        language: "java",
      })
    ).toBe(true);
    expect(
      isComplexityAnalysisEligible({
        verdict: "ACCEPTED",
        status: "COMPLETED",
        language: "JAVA",
      })
    ).toBe(true);
  });

  it("rejects non-accepted or non-java submissions", () => {
    expect(
      isComplexityAnalysisEligible({
        verdict: "WRONG_ANSWER",
        status: "COMPLETED",
        language: "java",
      })
    ).toBe(false);
    expect(
      isComplexityAnalysisEligible({
        verdict: "ACCEPTED",
        status: "COMPLETED",
        language: "python",
      })
    ).toBe(false);
  });
});
