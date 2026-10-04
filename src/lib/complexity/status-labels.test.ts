import { describe, expect, it } from "vitest";
import {
  complexityResultKindLabel,
  complexityStatusLabel,
  limitationLabel,
} from "./status-labels";

describe("complexity labels", () => {
  it("maps processing statuses for UI", () => {
    expect(complexityStatusLabel("STATIC_ANALYZING")).toBe("Static analysis");
    expect(complexityStatusLabel("BENCHMARKING")).toBe("Profiling");
  });

  it("maps result kinds", () => {
    expect(complexityResultKindLabel("HYBRID")).toBe("Hybrid estimate");
    expect(complexityResultKindLabel("STATIC_ONLY")).toBe("Static only");
    expect(complexityResultKindLabel("INCONCLUSIVE")).toBe("Inconclusive");
  });

  it("maps limitation codes to readable text", () => {
    expect(limitationLabel("BENCHMARK_NOISY")).toContain("noisy");
  });
});
