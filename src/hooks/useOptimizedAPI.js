"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { debounce } from "@/lib/apiOptimization";

/**
 * Custom hook for optimized API requests with:
 * - Automatic debouncing to reduce rapid API calls
 * - Caching to prevent duplicate requests
 * - Error handling
 * - Loading states
 */
export const useOptimizedAPI = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});
  const requestTimeoutRef = useRef({});

  // Clear cache for specific key
  const invalidateCache = useCallback((cacheKey) => {
    delete cacheRef.current[cacheKey];
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  // Optimized fetch function
  const fetch = useCallback(
    async (url, options = {}, debounceDelay = 300) => {
      const cacheKey = url;
      const method = options.method || "GET";

      // Return cached data for GET requests
      if (method === "GET" && cacheRef.current[cacheKey]) {
        setData(cacheRef.current[cacheKey]);
        return cacheRef.current[cacheKey];
      }

      // Cancel previous request if pending
      if (requestTimeoutRef.current[cacheKey]) {
        clearTimeout(requestTimeoutRef.current[cacheKey]);
      }

      setLoading(true);
      setError(null);

      const debouncedFetch = debounce(async () => {
        try {
          const response = await Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 8000)
            ),
          ]);

          if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
          }

          const result = await response.json();

          // Cache successful GET requests
          if (method === "GET") {
            cacheRef.current[cacheKey] = result;
          }

          setData(result);
          setLoading(false);
          return result;
        } catch (err) {
          setError(err.message || "API request failed");
          setLoading(false);
          throw err;
        }
      }, debounceDelay);

      debouncedFetch();
    },
    []
  );

  // Bulk fetch for multiple requests
  const fetchBulk = useCallback(
    async (requests) => {
      setLoading(true);
      try {
        const results = await Promise.all(
          requests.map(({ url, options }) =>
            fetch(url, options).catch((err) => ({ error: err }))
          )
        );
        setLoading(false);
        return results;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    },
    [fetch]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(requestTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  return {
    data,
    loading,
    error,
    fetch,
    fetchBulk,
    invalidateCache,
    clearCache,
  };
};

/**
 * Hook for batch operations with debouncing
 */
export const useBatchOperation = (batchSize = 5, batchDelay = 100) => {
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);

  const addToBatch = useCallback((operation) => {
    setQueue((prev) => [...prev, operation]);
  }, []);

  const processBatch = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return;

    processingRef.current = true;
    setProcessing(true);

    const batch = queue.splice(0, batchSize);

    try {
      await Promise.all(batch.map((op) => op()));
    } finally {
      processingRef.current = false;
      if (queue.length > 0) {
        setTimeout(() => processBatch(), batchDelay);
      } else {
        setProcessing(false);
      }
    }
  }, [queue, batchSize, batchDelay]);

  return {
    addToBatch,
    processBatch,
    processing,
    queueLength: queue.length,
  };
};
