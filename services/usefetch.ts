import { useState, useEffect, useRef, useCallback } from "react";

const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const fetchRef = useRef(fetchFunction);
  fetchRef.current = fetchFunction;
  const requestId = useRef(0);

  const reset = useCallback(() => {
    requestId.current += 1;
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const fetchData = useCallback(async (): Promise<T | undefined> => {
    const currentId = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRef.current();
      if (currentId !== requestId.current) return;
      setData(result);
      return result;
    } catch (err) {
      if (currentId === requestId.current) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      }
    } finally {
      if (currentId === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetchData();
    return () => { requestId.current += 1; };
  }, [autoFetch, fetchData]);

  return { data, loading, error, refetch: fetchData, reset };
};

export default useFetch;
