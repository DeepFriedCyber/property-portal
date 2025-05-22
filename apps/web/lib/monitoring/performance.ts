// lib/monitoring/performance.ts
import logger from '@/lib/logging/logger'

/**
 * Performance monitoring utility
 *
 * This module provides utilities for monitoring performance metrics
 * and reporting them to the logging system.
 */

// Performance metric types
export enum MetricType {
  NAVIGATION = 'navigation',
  RESOURCE = 'resource',
  PAINT = 'paint',
  LAYOUT = 'layout',
  FIRST_INPUT = 'first-input',
  CUSTOM = 'custom',
}

// Performance metric interface
export interface PerformanceMetric {
  name: string
  type: MetricType
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined' || !window.performance) {
    return
  }

  // Report navigation timing metrics
  reportNavigationTiming()

  // Set up performance observers
  setupPerformanceObservers()

  // Report metrics on page unload
  window.addEventListener('unload', () => {
    reportResourceTiming()
  })
}

/**
 * Report navigation timing metrics
 */
function reportNavigationTiming() {
  if (typeof window === 'undefined' || !window.performance) {
    return
  }

  // Wait for the page to be fully loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming

      if (!navigation) {
        return
      }

      const metrics: PerformanceMetric[] = [
        {
          name: 'time_to_first_byte',
          type: MetricType.NAVIGATION,
          value: navigation.responseStart - navigation.requestStart,
          unit: 'ms',
          timestamp: Date.now(),
        },
        {
          name: 'dom_load',
          type: MetricType.NAVIGATION,
          value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          unit: 'ms',
          timestamp: Date.now(),
        },
        {
          name: 'page_load',
          type: MetricType.NAVIGATION,
          value: navigation.loadEventEnd - navigation.loadEventStart,
          unit: 'ms',
          timestamp: Date.now(),
        },
        {
          name: 'total_page_load',
          type: MetricType.NAVIGATION,
          value: navigation.loadEventEnd - navigation.startTime,
          unit: 'ms',
          timestamp: Date.now(),
        },
      ]

      // Log the metrics
      logger.info(
        'Navigation timing metrics',
        {
          metrics,
          url: window.location.href,
          pathname: window.location.pathname,
        },
        ['performance', 'navigation']
      )
    }, 0)
  })
}

/**
 * Report resource timing metrics
 */
function reportResourceTiming() {
  if (typeof window === 'undefined' || !window.performance) {
    return
  }

  const resources = performance.getEntriesByType('resource')

  if (!resources || resources.length === 0) {
    return
  }

  // Group resources by type
  const resourcesByType: Record<string, PerformanceResourceTiming[]> = {}

  resources.forEach(resource => {
    const resourceTiming = resource as PerformanceResourceTiming
    const url = new URL(resourceTiming.name)
    const fileExtension = url.pathname.split('.').pop() || 'unknown'

    if (!resourcesByType[fileExtension]) {
      resourcesByType[fileExtension] = []
    }

    resourcesByType[fileExtension].push(resourceTiming)
  })

  // Calculate metrics for each resource type
  const metrics: Record<
    string,
    {
      count: number
      totalSize: number
      totalDuration: number
      averageDuration: number
    }
  > = {}

  Object.entries(resourcesByType).forEach(([type, resources]) => {
    const totalSize = resources.reduce((sum, resource) => {
      return sum + (resource.transferSize || 0)
    }, 0)

    const totalDuration = resources.reduce((sum, resource) => {
      return sum + (resource.responseEnd - resource.startTime)
    }, 0)

    metrics[type] = {
      count: resources.length,
      totalSize,
      totalDuration,
      averageDuration: totalDuration / resources.length,
    }
  })

  // Log the metrics
  logger.info(
    'Resource timing metrics',
    {
      metrics,
      url: window.location.href,
      pathname: window.location.pathname,
    },
    ['performance', 'resource']
  )
}

/**
 * Set up performance observers
 */
function setupPerformanceObservers() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return
  }

  // Observe paint metrics (FP, FCP)
  try {
    const paintObserver = new PerformanceObserver(entries => {
      entries.getEntries().forEach(entry => {
        const metric: PerformanceMetric = {
          name: entry.name,
          type: MetricType.PAINT,
          value: entry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
        }

        logger.info(
          `Paint metric: ${entry.name}`,
          {
            metric,
            url: window.location.href,
            pathname: window.location.pathname,
          },
          ['performance', 'paint']
        )
      })
    })

    paintObserver.observe({ entryTypes: ['paint'] })
  } catch (error) {
    logger.warn('Failed to observe paint metrics', { error })
  }

  // Observe layout shift metrics (CLS)
  try {
    let cumulativeLayoutShift = 0

    const layoutShiftObserver = new PerformanceObserver(entries => {
      entries.getEntries().forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value
        }
      })

      const metric: PerformanceMetric = {
        name: 'cumulative_layout_shift',
        type: MetricType.LAYOUT,
        value: cumulativeLayoutShift,
        unit: 'count',
        timestamp: Date.now(),
      }

      logger.info(
        'Layout shift metric',
        {
          metric,
          url: window.location.href,
          pathname: window.location.pathname,
        },
        ['performance', 'layout']
      )
    })

    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (error) {
    logger.warn('Failed to observe layout shift metrics', { error })
  }

  // Observe first input delay (FID)
  try {
    const firstInputObserver = new PerformanceObserver(entries => {
      entries.getEntries().forEach(entry => {
        const metric: PerformanceMetric = {
          name: 'first_input_delay',
          type: MetricType.FIRST_INPUT,
          value: entry.processingStart - entry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
        }

        logger.info(
          'First input delay metric',
          {
            metric,
            url: window.location.href,
            pathname: window.location.pathname,
          },
          ['performance', 'first-input']
        )
      })
    })

    firstInputObserver.observe({ entryTypes: ['first-input'] })
  } catch (error) {
    logger.warn('Failed to observe first input delay metrics', { error })
  }
}

/**
 * Measure the execution time of a function
 * @param fn Function to measure
 * @param name Name of the metric
 * @returns Result of the function
 */
export function measureExecutionTime<T>(fn: () => T, name: string): T {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start

  const metric: PerformanceMetric = {
    name,
    type: MetricType.CUSTOM,
    value: duration,
    unit: 'ms',
    timestamp: Date.now(),
  }

  logger.debug(
    `Execution time for ${name}`,
    {
      metric,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
    },
    ['performance', 'execution-time']
  )

  return result
}

/**
 * Measure the execution time of an async function
 * @param fn Async function to measure
 * @param name Name of the metric
 * @returns Promise that resolves to the result of the function
 */
export async function measureAsyncExecutionTime<T>(fn: () => Promise<T>, name: string): Promise<T> {
  const start = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - start

    const metric: PerformanceMetric = {
      name,
      type: MetricType.CUSTOM,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
    }

    logger.debug(
      `Async execution time for ${name}`,
      {
        metric,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      },
      ['performance', 'execution-time']
    )

    return result
  } catch (error) {
    const duration = performance.now() - start

    const metric: PerformanceMetric = {
      name: `${name}_error`,
      type: MetricType.CUSTOM,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
    }

    logger.warn(
      `Error in async execution for ${name}`,
      {
        metric,
        error,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      },
      ['performance', 'execution-time', 'error']
    )

    throw error
  }
}

/**
 * Create a performance monitoring hook for React components
 * @param componentName Name of the component
 * @returns Object with performance monitoring methods
 */
export function usePerformanceMonitoring(componentName: string) {
  const renderStart = performance.now()

  return {
    /**
     * Report component render time
     */
    reportRenderTime: () => {
      const renderTime = performance.now() - renderStart

      const metric: PerformanceMetric = {
        name: `${componentName}_render`,
        type: MetricType.CUSTOM,
        value: renderTime,
        unit: 'ms',
        timestamp: Date.now(),
      }

      logger.debug(
        `Render time for ${componentName}`,
        {
          metric,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
        ['performance', 'render-time']
      )
    },

    /**
     * Measure the execution time of a function
     * @param fn Function to measure
     * @param name Name of the metric
     * @returns Result of the function
     */
    measureExecutionTime: <T>(fn: () => T, name: string): T => {
      return measureExecutionTime(fn, `${componentName}_${name}`)
    },

    /**
     * Measure the execution time of an async function
     * @param fn Async function to measure
     * @param name Name of the metric
     * @returns Promise that resolves to the result of the function
     */
    measureAsyncExecutionTime: <T>(fn: () => Promise<T>, name: string): Promise<T> => {
      return measureAsyncExecutionTime(fn, `${componentName}_${name}`)
    },
  }
}
