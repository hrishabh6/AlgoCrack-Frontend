"use client";

import { useEffect } from "react";

function isPlainObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

function shouldSilence(reason: unknown): boolean {
  if (reason === "[object Object]") return true;

  if (reason instanceof Error) {
    return reason.message === "[object Object]";
  }

  if (isPlainObject(reason)) {
    const record = reason as Record<string, unknown>;
    if (record.message === "[object Object]") return true;
    if (Object.keys(record).length > 0) return true;
  }

  return false;
}

export function DevErrorSilencer() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const onError = (event: ErrorEvent) => {
      if (event.message === "[object Object]" || shouldSilence(event.error)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (shouldSilence(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", onError, { capture: true });
    window.addEventListener("unhandledrejection", onUnhandledRejection, { capture: true });

    return () => {
      window.removeEventListener("error", onError, { capture: true });
      window.removeEventListener("unhandledrejection", onUnhandledRejection, { capture: true });
    };
  }, []);

  return null;
}
