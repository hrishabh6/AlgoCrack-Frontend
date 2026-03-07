export function normalizeUnknownError(error: unknown, fallback = "Unexpected error"): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (typeof error === "object" && error !== null) {
    const maybeRecord = error as Record<string, unknown>;
    const candidate =
      maybeRecord.message ??
      maybeRecord.error ??
      maybeRecord.detail ??
      maybeRecord.title;

    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return new Error(candidate);
    }

    try {
      return new Error(JSON.stringify(error));
    } catch {
      return new Error(fallback);
    }
  }

  return new Error(fallback);
}

