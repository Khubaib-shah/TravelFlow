/**
 * error-parser.ts — Centralized Error Parser
 *
 * Converts raw API / network errors into user-friendly messages.
 * No technical details (status codes, stack traces, ECONNREFUSED, etc.)
 * ever reach the UI.
 *
 * Every parsed error includes:
 *   - title:       Short headline (e.g. "Connection lost")
 *   - description: Explanation & next step
 *   - canRetry:    Whether the action can be retried
 *   - severity:    "info" | "warning" | "error"
 *   - code:        Internal classification for logging
 */

import { ApiError } from "@/lib/api-error";

// ─── Public types ─────────────────────────────────────────────────────────────
export type ErrorSeverity = "info" | "warning" | "error";

export type ErrorCode =
  | "OFFLINE"
  | "TIMEOUT"
  | "SERVER_UNAVAILABLE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "UNKNOWN";

export interface UserFriendlyError {
  title: string;
  description: string;
  canRetry: boolean;
  severity: ErrorSeverity;
  code: ErrorCode;
  /** The original status code, if available */
  status?: number;
  /** Field-level validation errors from backend, if any */
  fieldErrors?: Record<string, string>;
}

// ─── Mapping tables ───────────────────────────────────────────────────────────
const STATUS_MAP: Record<number, Omit<UserFriendlyError, "status">> = {
  400: {
    title: "Invalid request",
    description:
      "Some of the information provided is incorrect. Please check and try again.",
    canRetry: false,
    severity: "warning",
    code: "VALIDATION",
  },
  401: {
    title: "Session expired",
    description: "Your session has expired. Please sign in again.",
    canRetry: false,
    severity: "warning",
    code: "UNAUTHORIZED",
  },
  403: {
    title: "Permission denied",
    description: "You don't have permission to perform this action.",
    canRetry: false,
    severity: "warning",
    code: "FORBIDDEN",
  },
  404: {
    title: "Not found",
    description:
      "The resource you're looking for doesn't exist or has been removed.",
    canRetry: false,
    severity: "info",
    code: "NOT_FOUND",
  },
  408: {
    title: "Request timed out",
    description:
      "This request is taking longer than expected. Please try again.",
    canRetry: true,
    severity: "warning",
    code: "TIMEOUT",
  },
  422: {
    title: "Validation error",
    description:
      "Please check the highlighted fields and correct any errors.",
    canRetry: false,
    severity: "warning",
    code: "VALIDATION",
  },
  429: {
    title: "Too many requests",
    description:
      "You've made too many requests. Please wait a moment and try again.",
    canRetry: true,
    severity: "warning",
    code: "RATE_LIMITED",
  },
  500: {
    title: "Server error",
    description:
      "Something went wrong on our end. Please try again in a few moments.",
    canRetry: true,
    severity: "error",
    code: "SERVER_ERROR",
  },
  502: {
    title: "Server unavailable",
    description:
      "We couldn't connect to the server. Please try again in a few moments.",
    canRetry: true,
    severity: "error",
    code: "SERVER_UNAVAILABLE",
  },
  503: {
    title: "Server unavailable",
    description:
      "The server is temporarily unavailable. Please try again shortly.",
    canRetry: true,
    severity: "error",
    code: "SERVER_UNAVAILABLE",
  },
  504: {
    title: "Server timed out",
    description:
      "The server took too long to respond. Please try again.",
    canRetry: true,
    severity: "error",
    code: "SERVER_UNAVAILABLE",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("network request failed") ||
      msg.includes("load failed")
    );
  }
  return false;
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException && error.name === "AbortError"
  );
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/**
 * Attempt to extract field-level validation errors from an API response.
 * Backends may return them in several formats:
 *   { errors: { email: "already exists" } }
 *   { errors: [{ field: "email", message: "..." }] }
 */
function extractFieldErrors(
  error: unknown,
): Record<string, string> | undefined {
  if (!(error instanceof ApiError)) return undefined;
  // Our ApiError stringifies the message from JSON; try to extract
  // structured data if the backend attached it.
  try {
    const parsed = JSON.parse((error as any)._rawBody ?? "{}");
    if (parsed.errors && typeof parsed.errors === "object") {
      if (Array.isArray(parsed.errors)) {
        const map: Record<string, string> = {};
        parsed.errors.forEach(
          (e: { field?: string; path?: string; message?: string; msg?: string }) => {
            const key = e.field || e.path;
            if (key) map[key] = e.message || e.msg || "Invalid value";
          },
        );
        return Object.keys(map).length ? map : undefined;
      }
      return parsed.errors;
    }
  } catch {
    // Not JSON — move on
  }
  return undefined;
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseApiError(error: unknown): UserFriendlyError {
  // 1. Browser is offline
  if (isOffline()) {
    return {
      title: "You're currently offline",
      description:
        "Please check your internet connection and try again.",
      canRetry: true,
      severity: "warning",
      code: "OFFLINE",
    };
  }

  // 2. Request was aborted (timeout via AbortController)
  if (isAbortError(error)) {
    return {
      title: "Request timed out",
      description:
        "This request is taking longer than expected. Please try again.",
      canRetry: true,
      severity: "warning",
      code: "TIMEOUT",
    };
  }

  // 3. Network-level failure (DNS, CORS, ECONNREFUSED, etc.)
  if (isNetworkError(error)) {
    return {
      title: "Connection failed",
      description:
        "We couldn't connect to the server. Please check your connection or try again in a few moments.",
      canRetry: true,
      severity: "error",
      code: "SERVER_UNAVAILABLE",
    };
  }

  // 4. Known ApiError with HTTP status
  if (error instanceof ApiError && error.status) {
    const mapped = STATUS_MAP[error.status];
    if (mapped) {
      const fieldErrors = extractFieldErrors(error);

      // For validation errors, if the backend sent a human-readable
      // message (not "HTTP 400"), prefer that.
      let description = mapped.description;
      if (
        (error.status === 400 || error.status === 422) &&
        error.message &&
        !error.message.startsWith("HTTP ") &&
        !error.message.startsWith("Server Error")
      ) {
        description = error.message;
      }

      return {
        ...mapped,
        description,
        status: error.status,
        fieldErrors,
      };
    }

    // Catch-all for any other 4xx / 5xx
    if (error.status >= 500) {
      return {
        title: "Server error",
        description:
          "Something went wrong on our end. Please try again later.",
        canRetry: true,
        severity: "error",
        code: "SERVER_ERROR",
        status: error.status,
      };
    }

    return {
      title: "Request failed",
      description:
        error.message && !error.message.startsWith("HTTP ")
          ? error.message
          : "Something unexpected happened. Please try again.",
      canRetry: false,
      severity: "warning",
      code: "UNKNOWN",
      status: error.status,
    };
  }

  // 5. ApiError without status (e.g. invalid JSON)
  if (error instanceof ApiError) {
    return {
      title: "Connection error",
      description:
        "We received an unexpected response. Please try again.",
      canRetry: true,
      severity: "error",
      code: "SERVER_ERROR",
    };
  }

  // 6. Completely unknown error
  return {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again later.",
    canRetry: true,
    severity: "error",
    code: "UNKNOWN",
  };
}

// ─── Logging helper (dev only, never shown to users) ──────────────────────────
export function logError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  const timestamp = new Date().toISOString();
  const parsed = parseApiError(error);

  console.error(`[TravelFlow Error] ${timestamp}`, {
    context,
    code: parsed.code,
    status: parsed.status,
    severity: parsed.severity,
    // Include the raw error for developer debugging
    rawError: error,
    ...extra,
  });
}
