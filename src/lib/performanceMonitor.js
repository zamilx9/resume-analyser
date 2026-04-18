/**
 * Performance Monitoring Utilities
 * Tracks and optimizes application performance
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.enabled = typeof window !== "undefined";
  }

  // Mark start of an operation
  mark(label) {
    if (!this.enabled) return;
    this.metrics[label] = performance.now();
  }

  // Measure time since mark
  measure(label, startLabel = null) {
    if (!this.enabled) return 0;
    
    const endTime = performance.now();
    const startTime = startLabel ? this.metrics[startLabel] : this.metrics[label];
    const duration = endTime - startTime;

    console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  // Get Core Web Vitals
  async getWebVitals() {
    if (!this.enabled) return null;

    return {
      // Largest Contentful Paint
      lcp: this.getLCP(),
      // First Input Delay
      fid: this.getFID(),
      // Cumulative Layout Shift
      cls: this.getCLS(),
      // Time to First Byte
      ttfb: this.getTTFB(),
    };
  }

  getLCP() {
    if (!this.enabled || !PerformanceObserver) return 0;
    let lcp = 0;
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        lcp = entry.renderTime || entry.loadTime;
      });
    });
    observer.observe({ entryTypes: ["largest-contentful-paint"] });
    return lcp;
  }

  getFID() {
    if (!this.enabled || !PerformanceObserver) return 0;
    let fid = 0;
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        fid = entry.processingDuration;
      });
    });
    observer.observe({ entryTypes: ["first-input"] });
    return fid;
  }

  getCLS() {
    if (!this.enabled || !PerformanceObserver) return 0;
    let cls = 0;
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
    });
    observer.observe({ entryTypes: ["layout-shift"] });
    return cls;
  }

  getTTFB() {
    if (!this.enabled || !performance.timing) return 0;
    return performance.timing.responseStart - performance.timing.navigationStart;
  }

  // Clear metrics
  clear() {
    this.metrics = {};
  }

  // Get all metrics
  getAll() {
    return this.metrics;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for monitoring component performance
 */
export const useComponentPerformance = (componentName) => {
  if (typeof window === "undefined") return;

  React.useEffect(() => {
    performanceMonitor.mark(`${componentName}-render-start`);

    return () => {
      const duration = performanceMonitor.measure(`${componentName}-render`, `${componentName}-render-start`);
      if (duration > 100) {
        console.warn(`[Performance Warning] ${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  }, [componentName]);
};

/**
 * Network speed detection
 */
export const detectNetworkSpeed = () => {
  if (typeof navigator === "undefined" || !navigator.connection) {
    return "4g";
  }

  const effectiveType = navigator.connection.effectiveType;
  return effectiveType; // '4g', '3g', '2g', 'slow-2g'
};

/**
 * Adaptive performance settings based on network
 */
export const getPerformanceSettings = () => {
  const networkSpeed = detectNetworkSpeed();

  const settings = {
    "4g": {
      maxConcurrentRequests: 6,
      requestTimeout: 8000,
      enableCache: true,
      enableCompression: true,
    },
    "3g": {
      maxConcurrentRequests: 3,
      requestTimeout: 15000,
      enableCache: true,
      enableCompression: true,
    },
    "2g": {
      maxConcurrentRequests: 1,
      requestTimeout: 30000,
      enableCache: true,
      enableCompression: true,
    },
    "slow-2g": {
      maxConcurrentRequests: 1,
      requestTimeout: 60000,
      enableCache: true,
      enableCompression: true,
    },
  };

  return settings[networkSpeed] || settings["4g"];
};
