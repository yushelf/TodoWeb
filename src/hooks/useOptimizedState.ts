import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 优化的状态钩子，减少不必要的重新渲染
 * @param initialState 初始状态值
 */
export function useOptimizedState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState<T>(initialState);
  
  // 使用useCallback包装setState，确保函数引用稳定
  const optimizedSetState = useCallback((value: T | ((prevState: T) => T)) => {
    setState(value);
  }, []);
  
  return [state, optimizedSetState] as const;
}

/**
 * 带有防抖功能的状态钩子
 * @param initialState 初始状态值
 * @param delay 防抖延迟时间，单位毫秒
 */
export function useDebouncedState<T>(initialState: T, delay: number = 300) {
  const [state, setState] = useState<T>(initialState);
  const [debouncedState, setDebouncedState] = useState<T>(initialState);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const setStateDebounced = useCallback((value: T | ((prevState: T) => T)) => {
    setState(value);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedState(typeof value === 'function' 
        ? (prevState: T) => {
            const updater = value as ((prevState: T) => T);
            return updater(prevState);
          }
        : value
      );
    }, delay);
  }, [delay]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [state, debouncedState, setStateDebounced] as const;
}

/**
 * 带有缓存的数据获取钩子
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param options 配置选项
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number; // 缓存生存时间，单位毫秒
    initialData?: T; // 初始数据
  } = {}
) {
  const { ttl = 5 * 60 * 1000, initialData } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cacheRef = useRef<{
    key: string;
    data: T;
    timestamp: number;
  } | null>(null);
  
  const fetchData = useCallback(async (force: boolean = false) => {
    // 检查缓存是否有效
    if (
      !force &&
      cacheRef.current &&
      cacheRef.current.key === key &&
      Date.now() - cacheRef.current.timestamp < ttl
    ) {
      setData(cacheRef.current.data);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      setData(result);
      
      // 更新缓存
      cacheRef.current = {
        key,
        data: result,
        timestamp: Date.now(),
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, isLoading, error, refetch: () => fetchData(true) };
}

/**
 * 带有本地存储持久化的状态钩子
 * @param key 存储键
 * @param initialState 初始状态值
 */
export function usePersistentState<T>(
  key: string,
  initialState: T | (() => T)
) {
  // 从localStorage获取初始值
  const getInitialValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return typeof initialState === 'function'
        ? (initialState as () => T)()
        : initialState;
    }
  };
  
  const [state, setState] = useState<T>(getInitialValue);
  
  // 当状态变化时，更新localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, state]);
  
  return [state, setState] as const;
}