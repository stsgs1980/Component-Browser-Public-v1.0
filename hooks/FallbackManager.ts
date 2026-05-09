/**
 * Fallback Provider Manager
 *
 * Automatically switches between API providers when the primary
 * provider fails. Supports priority-based ordering, per-provider
 * circuit breakers, and injectable health-check integration.
 *
 * @example
 * ```ts
 * import { checkApiHealth } from './HealthCheck'
 *
 * class MyProvider extends Provider {
 *   async chat(messages, options) { ... }
 * }
 *
 * const manager = new FallbackManager(
 *   [new MyProvider({ name: 'primary', baseUrl: 'https://api.example.com', priority: 1, enabled: true })],
 *   { healthCheckFn: checkApiHealth }
 * );
 *
 * const reply = await manager.chat([{ role: 'user', content: 'Hello' }]);
 * ```
 */

import { CircuitBreaker } from "./CircuitBreaker";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for a single API provider. */
export interface ProviderConfig {
  /** Human-readable provider name (used as circuit-breaker key). */
  name: string;
  /** Base URL of the provider API. */
  baseUrl: string;
  /** Optional API key for authentication. */
  apiKey?: string;
  /** Supported model identifiers. */
  models?: string[];
  /** Lower number = higher priority. Providers are tried in ascending order. */
  priority: number;
  /** Whether this provider is currently enabled. */
  enabled: boolean;
}

/** A single chat message. */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Optional parameters forwarded to the provider's chat method. */
export interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Signature of a health-check function that the `Provider` class can call.
 * Consumers may inject any implementation (e.g. the `checkApiHealth` from HealthCheck.ts).
 */
export type HealthCheckFn = (url: string, timeout: number) => Promise<{ healthy: boolean }>;

/** Options for constructing a {@link FallbackManager}. */
export interface FallbackManagerOptions {
  /** Health-check function injected into every `Provider` instance. */
  healthCheckFn?: HealthCheckFn;
  /** Timeout (ms) passed to the health-check function. @default 5000 */
  healthCheckTimeout?: number;
  /** Per-provider circuit-breaker failure threshold. @default 5 */
  failureThreshold?: number;
  /** Per-provider circuit-breaker open timeout (ms). @default 60000 */
  circuitBreakerTimeout?: number;
  /** Number of consecutive failures before switching to the next provider. @default 3 */
  switchAfterFailures?: number;
}

// ---------------------------------------------------------------------------
// Provider (base class)
// ---------------------------------------------------------------------------

/**
 * Abstract base class for API providers.
 *
 * Extend this class and implement {@link chat}. The built-in
 * {@link healthCheck} method uses the injectable `healthCheckFn`
 * supplied through the manager options.
 */
export class Provider {
  private healthCheckFn?: HealthCheckFn;
  private healthCheckTimeout: number;

  constructor(
    protected config: ProviderConfig,
    opts?: { healthCheckFn?: HealthCheckFn; healthCheckTimeout?: number }
  ) {
    this.healthCheckFn = opts?.healthCheckFn;
    this.healthCheckTimeout = opts?.healthCheckTimeout ?? 5000;
  }

  /** Provider name (from config). */
  get name(): string {
    return this.config.name;
  }

  /** Whether this provider is currently enabled. */
  get enabled(): boolean {
    return this.config.enabled;
  }

  set enabled(value: boolean) {
    this.config.enabled = value;
  }

  /** Provider priority (lower = higher priority). */
  get priority(): number {
    return this.config.priority;
  }

  /**
   * Send a chat request. Must be implemented by subclasses.
   * @param messages - Array of chat messages.
   * @param options  - Optional generation parameters.
   */
  async chat(_messages: ChatMessage[], _options?: ChatOptions): Promise<unknown> {
    throw new Error("Subclass must implement chat method");
  }

  /**
   * Perform a health check against the provider's base URL.
   * Uses the injected `healthCheckFn` if available, otherwise always returns `false`.
   */
  async healthCheck(): Promise<boolean> {
    if (!this.config.baseUrl) return false;
    if (!this.healthCheckFn) return false;
    const result = await this.healthCheckFn(this.config.baseUrl, this.healthCheckTimeout);
    return result.healthy;
  }
}

// ---------------------------------------------------------------------------
// FallbackManager
// ---------------------------------------------------------------------------

/**
 * Manages multiple {@link Provider} instances with automatic failover.
 *
 * Each provider gets its own {@link CircuitBreaker}. When a provider
 * fails the configured number of consecutive times, the manager
 * automatically rotates to the next enabled provider in priority order.
 */
export class FallbackManager {
  private currentProviderIndex = 0;
  private failureCount = 0;
  private readonly circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private readonly switchAfterFailures: number;

  constructor(
    private readonly providers: Provider[],
    private readonly options: FallbackManagerOptions = {}
  ) {
    this.switchAfterFailures = options.switchAfterFailures ?? 3;

    const cbTimeout = options.circuitBreakerTimeout ?? 60000;
    const cbThreshold = options.failureThreshold ?? 5;

    for (const provider of providers) {
      this.circuitBreakers.set(
        provider.name,
        new CircuitBreaker({ failureThreshold: cbThreshold, timeout: cbTimeout })
      );
    }
  }

  /**
   * Send a chat message through the provider chain.
   *
   * Tries each enabled provider in priority order (current provider first),
   * falling back to the next on failure.
   *
   * @param messages - Chat messages to send.
   * @param options  - Optional generation parameters.
   * @returns The response from the first successful provider.
   * @throws {Error} When no providers are enabled or all providers fail.
   */
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<unknown> {
    const enabledProviders = this.providers.filter((p) => p.enabled);
    if (enabledProviders.length === 0) {
      throw new Error("No providers available");
    }

    const orderedProviders = this.getProvidersInPriorityOrder(enabledProviders);

    for (const provider of orderedProviders) {
      try {
        const cb = this.circuitBreakers.get(provider.name);
        if (!cb) continue;

        const result = await cb.execute(async () => {
          return await provider.chat(messages, options);
        });

        this.currentProviderIndex = this.providers.indexOf(provider);
        this.failureCount = 0;

        return result;
      } catch (error) {
        this.failureCount++;
        console.warn(
          `[fallback] Provider ${provider.name} failed:`,
          error instanceof Error ? error.message : String(error)
        );

        if (this.failureCount >= this.switchAfterFailures) {
          this.switchToNextProvider(enabledProviders);
          this.failureCount = 0;
        }
      }
    }

    throw new Error("All providers failed");
  }

  /** Returns the currently active provider, if any. */
  getCurrentProvider(): Provider | undefined {
    return this.providers[this.currentProviderIndex];
  }

  /** Returns a status snapshot of every provider and its circuit-breaker state. */
  getStatus(): {
    currentProvider: string;
    providers: Array<{ name: string; priority: number; enabled: boolean; circuitState: string }>;
  } {
    return {
      currentProvider: this.getCurrentProvider()?.name ?? "none",
      providers: this.providers.map((p) => ({
        name: p.name,
        priority: p.priority,
        enabled: p.enabled,
        circuitState: this.circuitBreakers.get(p.name)?.getState() ?? "UNKNOWN",
      })),
    };
  }

  // -- Private helpers -----------------------------------------------------

  private getProvidersInPriorityOrder(providers: Provider[]): Provider[] {
    const sorted = [...providers].sort((a, b) => a.priority - b.priority);
    const current = this.providers[this.currentProviderIndex];
    if (current && current.enabled) {
      const idx = sorted.indexOf(current);
      if (idx > 0) {
        sorted.splice(idx, 1);
        sorted.unshift(current);
      }
    }
    return sorted;
  }

  private switchToNextProvider(providers: Provider[]): void {
    const currentIdx = providers.indexOf(this.providers[this.currentProviderIndex]);
    const nextIdx = (currentIdx + 1) % providers.length;
    this.currentProviderIndex = this.providers.indexOf(providers[nextIdx]);
    console.log(
      `[fallback] Switched to provider: ${this.providers[this.currentProviderIndex].name}`
    );
  }
}
