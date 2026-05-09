/**
 * Health Check Monitoring
 *
 * Proactive health monitoring for external APIs and services.
 * Tracks response times, consecutive failures, and provides
 * automated alerting when services become unhealthy.
 *
 * @example
 * ```ts
 * const result = await checkApiHealth('https://api.example.com/health', 5000);
 * console.log(result.healthy, result.responseTime);
 *
 * const tracker = new FailureTracker(3, (count) => alert(`Failed ${count} times`));
 * tracker.recordFailure();
 *
 * const monitor = new ResponseTimeMonitor(10, 3000);
 * monitor.record(4200); // triggers alert if avg > 3000 ms
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of a single health-check probe. */
export interface HealthCheckResult {
  /** `true` when the endpoint is healthy. */
  healthy: boolean;
  /** HTTP status code (only present when the request succeeded). */
  status?: number;
  /** Error message (only present when the request failed). */
  error?: string;
  /** Response time in milliseconds. */
  responseTime: number;
  /** ISO-8601 timestamp of the check. */
  timestamp: string;
}

/** Alias kept for backward-compatibility with consumers expecting `HealthCheckOptions`. */
export type HealthCheckOptions = HealthMonitorConfig;

/** Configuration for the health-monitor subsystem. */
export interface HealthMonitorConfig {
  /** Interval (ms) between automatic health checks. @default 30000 */
  checkInterval: number;
  /** Timeout (ms) for each health-check request. @default 5000 */
  requestTimeout: number;
  /** Consecutive failures before an alert is raised. @default 3 */
  failureThreshold: number;
  /** Number of response-time samples kept in the sliding window. @default 10 */
  windowSize: number;
  /** Average response time (ms) that triggers a slow-response alert. @default 5000 */
  alertThreshold: number;
}

/** Sensible defaults for {@link HealthMonitorConfig}. */
export const defaultHealthMonitorConfig: HealthMonitorConfig = {
  checkInterval: 30000, // 30 seconds
  requestTimeout: 5000, // 5 seconds
  failureThreshold: 3,
  windowSize: 10,
  alertThreshold: 5000, // 5 seconds
};

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Perform a basic health check on a URL using an HTTP HEAD request.
 *
 * @param url     - The endpoint URL to probe.
 * @param timeout - Maximum time (ms) to wait for a response. @default 5000
 * @returns A {@link HealthCheckResult} with the outcome.
 */
export async function checkApiHealth(
  url: string,
  timeout: number = 5000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(timeout),
    });

    return {
      healthy: response.ok,
      status: response.status,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check multiple named endpoints in parallel and return an aggregate report.
 *
 * @param endpoints - Array of `{ name, url }` objects to probe.
 * @param timeout   - Per-request timeout (ms).
 * @returns An object with `overallHealthy` flag and per-endpoint results.
 */
export async function checkMultipleEndpoints(
  endpoints: Array<{ name: string; url: string }>,
  timeout?: number
): Promise<{
  timestamp: string;
  overallHealthy: boolean;
  endpoints: Array<HealthCheckResult & { name: string }>;
}> {
  const checks = await Promise.all(
    endpoints.map(async (endpoint) => {
      const health = await checkApiHealth(endpoint.url, timeout);
      return { name: endpoint.name, ...health };
    })
  );

  return {
    timestamp: new Date().toISOString(),
    overallHealthy: checks.every((c) => c.healthy),
    endpoints: checks,
  };
}

// ---------------------------------------------------------------------------
// FailureTracker
// ---------------------------------------------------------------------------

/**
 * Tracks consecutive failures and invokes an alert callback when the
 * configured threshold is exceeded. Resets on each successful check.
 *
 * @example
 * ```ts
 * const tracker = new FailureTracker(3, (count, lastTime) => {
 *   console.warn(`${count} failures since ${lastTime}`);
 * });
 * tracker.recordSuccess(); // resets counter
 * tracker.recordFailure(); // count = 1
 * ```
 */
export class FailureTracker {
  private consecutiveFailures = 0;
  private lastFailureTime: string | null = null;

  /**
   * @param threshold - Number of consecutive failures that triggers the alert.
   * @param onAlert   - Callback invoked when `threshold` is reached or exceeded.
   */
  constructor(
    private readonly threshold: number = 3,
    private readonly onAlert?: (failures: number, lastTime: string | null) => void
  ) {}

  /** Record a failure. Increments the counter and may fire the alert. */
  recordFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = new Date().toISOString();

    if (this.consecutiveFailures >= this.threshold) {
      console.warn(
        `[health-check] FAILURE_THRESHOLD_EXCEEDED: ${this.consecutiveFailures} consecutive failures`
      );
      this.onAlert?.(this.consecutiveFailures, this.lastFailureTime);
    }
  }

  /** Record a success. Resets the consecutive-failure counter. */
  recordSuccess(): void {
    if (this.consecutiveFailures > 0) {
      console.log(
        `[health-check] Recovered from ${this.consecutiveFailures} consecutive failures`
      );
    }
    this.consecutiveFailures = 0;
  }

  /** Returns the current number of consecutive failures. */
  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
}

// ---------------------------------------------------------------------------
// ResponseTimeMonitor
// ---------------------------------------------------------------------------

/**
 * Maintains a sliding window of response-time samples and alerts when
 * the rolling average exceeds a configured threshold.
 *
 * @example
 * ```ts
 * const monitor = new ResponseTimeMonitor(10, 3000, (avg, threshold) => {
 *   console.warn(`Slow responses: avg ${avg}ms > ${threshold}ms`);
 * });
 * monitor.record(2500);
 * monitor.record(4500); // may trigger alert
 * ```
 */
export class ResponseTimeMonitor {
  private responseTimes: number[] = [];

  /**
   * @param windowSize      - Number of samples kept in the sliding window.
   * @param alertThreshold  - Average response time (ms) that triggers the alert.
   * @param onAlert         - Callback invoked when the average exceeds the threshold.
   */
  constructor(
    private readonly windowSize: number = 10,
    private readonly alertThreshold: number = 5000,
    private readonly onAlert?: (avgTime: number, threshold: number) => void
  ) {}

  /**
   * Record a response-time sample.
   * Automatically evicts the oldest sample when the window is full.
   */
  record(responseTime: number): void {
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.windowSize) {
      this.responseTimes.shift();
    }

    const avg = this.getAverage();
    if (avg > this.alertThreshold) {
      console.warn(
        `[health-check] SLOW_RESPONSE: average ${avg}ms exceeds threshold ${this.alertThreshold}ms`
      );
      this.onAlert?.(avg, this.alertThreshold);
    }
  }

  /** Returns the rolling average response time, or `0` if no samples exist. */
  getAverage(): number {
    if (this.responseTimes.length === 0) return 0;
    return this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }
}
