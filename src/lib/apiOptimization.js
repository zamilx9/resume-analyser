// API Request Cache to prevent duplicate requests
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  getCacheKey(url, options = {}) {
    return `${url}:${JSON.stringify(options)}`;
  }

  async get(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options);
    
    // Return cached result if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // If request is already in progress, return the pending promise
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Make new request
    const promise = fetch(url, options)
      .then(res => res.json())
      .then(data => {
        this.cache.set(cacheKey, data);
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  invalidate(url) {
    for (const [key] of this.cache) {
      if (key.startsWith(url)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new RequestCache();

// Debounce function to reduce rapid API calls
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function to limit API calls frequency
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Optimized fetch with timeout
export const fetchWithTimeout = (url, options = {}, timeout = 8000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    ),
  ]);
};

// Batch API requests
class BatchRequests {
  constructor(batchSize = 5, batchDelay = 100) {
    this.queue = [];
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
    this.processing = false;
  }

  add(request) {
    this.queue.push(request);
    if (this.queue.length >= this.batchSize) {
      this.process();
    }
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await Promise.all(batch.map(req => req()));
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), this.batchDelay);
      }
    }
  }
}

export const batchRequests = new BatchRequests();

// Memoization hook for expensive operations
export const useMemo = (func, deps) => {
  const [result, setResult] = React.useState(null);
  const [prevDeps, setPrevDeps] = React.useState(deps);

  React.useEffect(() => {
    let changed = !prevDeps || prevDeps.length !== deps.length;
    if (!changed) {
      for (let i = 0; i < prevDeps.length; i++) {
        if (prevDeps[i] !== deps[i]) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      setResult(func());
      setPrevDeps(deps);
    }
  }, [func, deps, prevDeps]);

  return result;
};
