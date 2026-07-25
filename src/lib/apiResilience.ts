/**
 * Vorynexa Enterprise API Resilience & Telemetry Layer
 * Provides exponential backoff retries, structured client logging, offline handling, and typed API response wrapping.
 */

export interface ApiRequestOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  timeoutMs?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  isOffline: boolean;
  retriesAttempted: number;
}

/**
 * Structured Logger for Vorynexa Enterprise Client Operations
 */
export class TelemetryLogger {
  static info(module: string, message: string, payload?: any) {
    console.log(`[VORYNEXA::INFO][${module}] ${message}`, payload ? payload : "");
  }

  static warn(module: string, message: string, payload?: any) {
    console.warn(`[VORYNEXA::WARN][${module}] ${message}`, payload ? payload : "");
  }

  static error(module: string, message: string, error?: any) {
    console.error(`[VORYNEXA::ERROR][${module}] ${message}`, error ? error : "");
  }
}

/**
 * Resilient API fetch wrapper with exponential backoff and timeout handling
 */
export async function resilientFetch<T>(
  url: string,
  body: any,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { maxRetries = 2, initialDelayMs = 800, timeoutMs = 25000, headers = {} } = options;

  if (typeof window !== "undefined" && !navigator.onLine) {
    TelemetryLogger.warn("API", `Network offline - request aborted for ${url}`);
    return {
      data: null,
      error: "You are currently offline. Please check your network connection.",
      status: 0,
      isOffline: true,
      retriesAttempted: 0,
    };
  }

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      TelemetryLogger.info("API", `Sending request to ${url} (Attempt ${attempt + 1}/${maxRetries + 1})`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
        signal: options.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        TelemetryLogger.info("API", `Success from ${url}`, { status: response.status });
        return {
          data,
          error: null,
          status: response.status,
          isOffline: false,
          retriesAttempted: attempt,
        };
      }

      // Handle 429 Rate Limiting or 5xx Server Errors with Retry
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        TelemetryLogger.warn("API", `Retrying due to HTTP ${response.status}`, { url, delay });
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        attempt++;
        continue;
      }

      const errorText = await response.text();
      let parsedError = `Server returned HTTP ${response.status}`;
      try {
        const jsonErr = JSON.parse(errorText);
        parsedError = jsonErr.error || jsonErr.message || parsedError;
      } catch {
        // use default error message
      }

      TelemetryLogger.error("API", `Request failed with ${response.status}`, parsedError);
      return {
        data: null,
        error: parsedError,
        status: response.status,
        isOffline: false,
        retriesAttempted: attempt,
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        TelemetryLogger.error("API", `Request timed out after ${timeoutMs}ms`, url);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          attempt++;
          continue;
        }
        return {
          data: null,
          error: "Request timed out. Please try again.",
          status: 408,
          isOffline: false,
          retriesAttempted: attempt,
        };
      }

      if (attempt < maxRetries) {
        TelemetryLogger.warn("API", `Network error on attempt ${attempt + 1}, retrying...`, err.message);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        attempt++;
        continue;
      }

      TelemetryLogger.error("API", "Fatal network exception", err);
      return {
        data: null,
        error: err.message || "Failed to communicate with Vorynexa servers.",
        status: 0,
        isOffline: !navigator.onLine,
        retriesAttempted: attempt,
      };
    }
  }

  return {
    data: null,
    error: "Maximum retry threshold exceeded.",
    status: 500,
    isOffline: false,
    retriesAttempted: maxRetries,
  };
}
