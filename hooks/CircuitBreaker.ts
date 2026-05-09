/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures by stopping requests to a service
 * that has repeatedly failed. After a timeout period, allows
 * a "half-open" probe request to test if the service has recovered.
 *
 * States: CLOSED (normal) → OPEN (blocking) → HALF_OPEN (probing) → CLOSED
 *
 * @example
 * ```ts
 * const cb = new CircuitBreaker({
 *   failureThreshold: 5,
 *   timeout: 60000,
 *   onStateChange: (from, to) => console.log(`${from} → ${to}`),
 *   onFailure: (count, error) => console.warn(`Failure #${count}`),
 * });
 *
 * try {
 *   const result = await cb.execute(() => fetch('/api/data'));
 * } catch (err) {
 *   console.error('Circuit open or request failed', err);
 * }
 * ```
 */

/** Possible states of the circuit breaker. */
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

/** Configuration options for the circuit breaker. */
export interface CircuitBreakerConfig {
  /** Number of consecutive failures before the circuit opens. @default 5 */
  failureThreshold: number;
  /** Milliseconds to wait before transitioning from OPEN → HALF_OPEN. @default 60000 */
  timeout: number;
  /** Optional callback invoked whenever the circuit state changes. */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
  /** Optional callback invoked on each failure with the current failure count. */
  onFailure?: (failureCount: number, error: unknown) => void;
}

/** Default configuration values. */
export const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  timeout: 60000, // 60 seconds
};

/**
 * A circuit breaker that wraps async operations and prevents cascading failures.
 *
 * When the wrapped function fails `failureThreshold` times in a row, the circuit
 * opens and immediately rejects subsequent calls. After `timeout` ms the circuit
 * enters HALF_OPEN state and allows a single probe request. If the probe succeeds,
 * the circuit closes; otherwise it re-opens.
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private state: CircuitState = "CLOSED";

  constructor(
    private readonly config: CircuitBreakerConfig = defaultCircuitBreakerConfig
  ) {}

  /**
   * Execute an async function through the circuit breaker.
   * @typeParam T - The return type of the wrapped function.
   * @param fn - The async function to protect.
   * @returns The result of `fn` if successful.
   * @throws {Error} When the circuit is OPEN or when `fn` itself throws.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime < this.config.timeout) {
        throw new Error("Circuit breaker is OPEN - service unavailable");
      }
      this.transition("HALF_OPEN");
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /** Returns the current circuit state. */
  getState(): CircuitState {
    return this.state;
  }

  /** Returns the current consecutive failure count. */
  getFailureCount(): number {
    return this.failureCount;
  }

  /** Manually reset the circuit breaker to CLOSED state, clearing all failure counters. */
  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.transition("CLOSED");
  }

  private transition(to: CircuitState): void {
    if (this.state !== to) {
      const from = this.state;
      this.state = to;
      this.config.onStateChange?.(from, to);
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state !== "CLOSED") {
      this.transition("CLOSED");
    }
  }

  private onFailure(error: unknown): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    this.config.onFailure?.(this.failureCount, error);

    if (this.failureCount >= this.config.failureThreshold) {
      this.transition("OPEN");
    }
  }
}
