/**
 * Performance Monitoring Utilities
 *
 * Provides tools for monitoring application performance including:
 * - API request timing
 * - Realtime connection health
 * - Component render tracking
 * - Memory usage monitoring
 */

/**
 * Performance metric types
 */
export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

/**
 * Realtime connection status
 */
export interface RealtimeConnectionStatus {
  channelName: string
  state: "connected" | "disconnected" | "connecting" | "error"
  connectedAt?: number
  lastError?: string
  reconnectCount: number
}

/**
 * API request metrics
 */
export interface APIRequestMetric {
  endpoint: string
  method: string
  duration: number
  status: "success" | "error"
  timestamp: number
  error?: string
}

/**
 * In-memory performance metrics store
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private apiMetrics: APIRequestMetric[] = []
  private realtimeConnections: Map<string, RealtimeConnectionStatus> = new Map()
  private maxMetrics = 1000 // Keep last 1000 metrics

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Performance] ${metric.name}: ${metric.duration}ms`, metric.metadata)
    }
  }

  /**
   * Record an API request metric
   */
  recordAPIRequest(metric: APIRequestMetric): void {
    this.apiMetrics.push(metric)

    // Keep only recent metrics
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics.shift()
    }

    // Log slow requests
    if (metric.duration > 1000) {
      console.warn(
        `[Performance] Slow API request: ${metric.method} ${metric.endpoint} took ${metric.duration}ms`
      )
    }
  }

  /**
   * Update Realtime connection status
   */
  updateRealtimeConnection(status: RealtimeConnectionStatus): void {
    this.realtimeConnections.set(status.channelName, status)

    if (status.state === "error") {
      console.error(
        `[Realtime] Connection error for ${status.channelName}:`,
        status.lastError
      )
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get API metrics
   */
  getAPIMetrics(): APIRequestMetric[] {
    return [...this.apiMetrics]
  }

  /**
   * Get Realtime connection statuses
   */
  getRealtimeConnections(): RealtimeConnectionStatus[] {
    return Array.from(this.realtimeConnections.values())
  }

  /**
   * Get average metric duration by name
   */
  getAverageMetric(name: string): number {
    const filtered = this.metrics.filter((m) => m.name === name)
    if (filtered.length === 0) return 0

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0)
    return sum / filtered.length
  }

  /**
   * Get average API request duration by endpoint
   */
  getAverageAPIRequestDuration(endpoint: string): number {
    const filtered = this.apiMetrics.filter((m) => m.endpoint === endpoint)
    if (filtered.length === 0) return 0

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0)
    return sum / filtered.length
  }

  /**
   * Get API error rate
   */
  getAPIErrorRate(): number {
    if (this.apiMetrics.length === 0) return 0

    const errorCount = this.apiMetrics.filter((m) => m.status === "error").length
    return (errorCount / this.apiMetrics.length) * 100
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.apiMetrics = []
    this.realtimeConnections.clear()
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        apiMetrics: this.apiMetrics,
        realtimeConnections: Array.from(this.realtimeConnections.entries()),
        timestamp: Date.now(),
      },
      null,
      2
    )
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor()

/**
 * Measure execution time of a function
 *
 * @param name - Metric name
 * @param fn - Function to measure
 * @param metadata - Optional metadata
 * @returns Function result
 *
 * @example
 * ```ts
 * const result = await measurePerformance('fetchIssues', async () => {
 *   return await getIssues(projectId)
 * }, { projectId })
 * ```
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - startTime

    performanceMonitor.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    })

    return result
  } catch (error) {
    const duration = performance.now() - startTime

    performanceMonitor.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })

    throw error
  }
}

/**
 * Track API request performance
 *
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param fn - Request function
 * @returns Request result
 *
 * @example
 * ```ts
 * const data = await trackAPIRequest('/api/issues', 'GET', async () => {
 *   return await supabase.from('issues').select('*')
 * })
 * ```
 */
export async function trackAPIRequest<T>(
  endpoint: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - startTime

    performanceMonitor.recordAPIRequest({
      endpoint,
      method,
      duration,
      status: "success",
      timestamp: Date.now(),
    })

    return result
  } catch (error) {
    const duration = performance.now() - startTime

    performanceMonitor.recordAPIRequest({
      endpoint,
      method,
      duration,
      status: "error",
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : "Unknown error",
    })

    throw error
  }
}

/**
 * Track Realtime connection status
 *
 * @param channelName - Channel name
 * @param state - Connection state
 * @param error - Optional error message
 *
 * @example
 * ```ts
 * trackRealtimeConnection('issues:project_id=123', 'connected')
 * trackRealtimeConnection('issues:project_id=123', 'error', 'Connection timeout')
 * ```
 */
export function trackRealtimeConnection(
  channelName: string,
  state: RealtimeConnectionStatus["state"],
  error?: string
): void {
  const existing = performanceMonitor.getRealtimeConnections().find(
    (c) => c.channelName === channelName
  )

  const status: RealtimeConnectionStatus = {
    channelName,
    state,
    connectedAt: state === "connected" ? Date.now() : existing?.connectedAt,
    lastError: error,
    reconnectCount: existing?.reconnectCount || 0,
  }

  if (state === "connected" && existing?.state !== "connected") {
    status.reconnectCount = (existing?.reconnectCount || 0) + 1
  }

  performanceMonitor.updateRealtimeConnection(status)
}

/**
 * Get performance summary
 *
 * @returns Performance summary object
 *
 * @example
 * ```ts
 * const summary = getPerformanceSummary()
 * console.log('Average API latency:', summary.avgAPILatency)
 * console.log('API error rate:', summary.apiErrorRate)
 * ```
 */
export function getPerformanceSummary() {
  const apiMetrics = performanceMonitor.getAPIMetrics()
  const realtimeConnections = performanceMonitor.getRealtimeConnections()

  const avgAPILatency =
    apiMetrics.length > 0
      ? apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length
      : 0

  const apiErrorRate = performanceMonitor.getAPIErrorRate()

  const activeRealtimeConnections = realtimeConnections.filter(
    (c) => c.state === "connected"
  ).length

  const failedRealtimeConnections = realtimeConnections.filter(
    (c) => c.state === "error"
  ).length

  return {
    avgAPILatency: Math.round(avgAPILatency),
    apiErrorRate: Math.round(apiErrorRate * 100) / 100,
    totalAPIRequests: apiMetrics.length,
    activeRealtimeConnections,
    failedRealtimeConnections,
    totalRealtimeConnections: realtimeConnections.length,
  }
}

/**
 * Log performance summary to console
 *
 * @example
 * ```ts
 * // In development tools console
 * logPerformanceSummary()
 * ```
 */
export function logPerformanceSummary(): void {
  const summary = getPerformanceSummary()

  console.group("📊 Performance Summary")
  console.log("Average API Latency:", `${summary.avgAPILatency}ms`)
  console.log("API Error Rate:", `${summary.apiErrorRate}%`)
  console.log("Total API Requests:", summary.totalAPIRequests)
  console.log("Active Realtime Connections:", summary.activeRealtimeConnections)
  console.log("Failed Realtime Connections:", summary.failedRealtimeConnections)
  console.log("Total Realtime Connections:", summary.totalRealtimeConnections)
  console.groupEnd()
}

/**
 * Export all metrics
 *
 * @returns JSON string of all metrics
 *
 * @example
 * ```ts
 * const metricsJSON = exportPerformanceMetrics()
 * // Save to file or send to analytics service
 * ```
 */
export function exportPerformanceMetrics(): string {
  return performanceMonitor.exportMetrics()
}

/**
 * Clear all performance metrics
 *
 * @example
 * ```ts
 * clearPerformanceMetrics()
 * ```
 */
export function clearPerformanceMetrics(): void {
  performanceMonitor.clear()
}

/**
 * Track component render (use in React components via useRenderTracking hook)
 *
 * @param componentName - Component name
 *
 * @example
 * ```tsx
 * // In a React component:
 * import { useRenderTracking } from '@/hooks/use-render-tracking'
 *
 * function MyComponent() {
 *   useRenderTracking('MyComponent')
 *   return <div>Content</div>
 * }
 * ```
 */
export function trackComponentRender(componentName: string): void {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[Render] ${componentName} rendered`)
  }
}

// Export singleton for direct access
export const monitor = performanceMonitor

// Make monitor available in browser console for debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  ;(window as any).__performanceMonitor = {
    getMetrics: () => performanceMonitor.getMetrics(),
    getAPIMetrics: () => performanceMonitor.getAPIMetrics(),
    getRealtimeConnections: () => performanceMonitor.getRealtimeConnections(),
    getSummary: getPerformanceSummary,
    logSummary: logPerformanceSummary,
    export: exportPerformanceMetrics,
    clear: clearPerformanceMetrics,
  }

  console.info(
    "💡 Performance Monitor available at window.__performanceMonitor"
  )
}
