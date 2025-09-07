import React, { memo, useMemo } from 'react';

/**
 * 优化组件渲染的高阶组件
 * 使用React.memo包装组件，避免不必要的重新渲染
 * @param Component 需要优化的组件
 * @param propsAreEqual 自定义比较函数，用于决定是否重新渲染
 */
export function optimizeComponent<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, propsAreEqual);
}

/**
 * 创建一个记忆化的值，只有当依赖项变化时才重新计算
 * @param factory 创建值的工厂函数
 * @param deps 依赖项数组
 */
export function createMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  // 这是一个自定义钩子的包装器，实际使用时应在组件内部直接使用useMemo
  return useMemo(factory, deps);
}

/**
 * 优化列表渲染的高阶组件
 * 为列表项添加稳定的key，并使用React.memo优化渲染
 * @param Component 列表项组件
 * @param getItemKey 获取列表项key的函数
 */
export function optimizeListItem<P extends object>(
  Component: React.ComponentType<P>,
  getItemKey: (props: P) => string | number
): React.FC<P> {
  const OptimizedComponent = memo(Component);
  
  return (props: P) => {
    const key = getItemKey(props);
    return <OptimizedComponent key={key} {...props} />;
  };
}

/**
 * 创建一个防抖动的事件处理函数
 * @param fn 原始事件处理函数
 * @param delay 延迟时间，单位毫秒
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * 创建一个节流的事件处理函数
 * @param fn 原始事件处理函数
 * @param limit 时间限制，单位毫秒
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      fn(...args);
      lastCall = now;
    }
  };
}