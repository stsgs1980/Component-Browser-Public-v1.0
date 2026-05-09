/**
 * Resilience Suite — Production-ready fault tolerance patterns
 *
 * Combines Circuit Breaker, Fallback Manager, and Health Check
 * into a cohesive resilience layer for API consumers.
 *
 * @example
 * ```ts
 * import { CircuitBreaker, FallbackManager, checkApiHealth } from './ResilienceSuite'
 *
 * const cb = new CircuitBreaker({ failureThreshold: 3, timeout: 30_000 });
 * const result = await cb.execute(() => fetch('https://api.example.com/data'));
 *
 * const health = await checkApiHealth('https://api.example.com/health');
 * console.log(health.healthy ? 'OK' : 'UNHEALTHY');
 * ```
 */

export {
  CircuitBreaker,
  type CircuitState,
  type CircuitBreakerConfig,
  defaultCircuitBreakerConfig,
} from "./CircuitBreaker";

export {
  FallbackManager,
  Provider,
  type ProviderConfig,
  type ChatMessage,
  type ChatOptions,
  type HealthCheckFn,
  type FallbackManagerOptions,
} from "./FallbackManager";

export {
  checkApiHealth,
  checkMultipleEndpoints,
  FailureTracker,
  ResponseTimeMonitor,
  type HealthCheckResult,
  type HealthCheckOptions,
  type HealthMonitorConfig,
  defaultHealthMonitorConfig,
} from "./HealthCheck";
