import React, { useEffect, useState, lazy, Suspense } from 'react';
import PerformanceMonitor from './components/performance/PerformanceMonitor';
import ResourcePreloader from './components/performance/ResourcePreloader';
import ErrorBoundary from './components/error/ErrorBoundary';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, CircularProgress } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { useUserStore } from './store/userStore';

// 导入布局组件
import AppLayout from './components/layout/AppLayout';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const PomodoroPage = lazy(() => import('./pages/PomodoroPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const CollapsibleDivDemo = lazy(() => import('./pages/CollapsibleDivDemo'));

// 加载中组件
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

// App组件，用于初始化用户状态
const App = () => {
  const initUser = useUserStore(state => state.initUser);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  
  // 测量应用加载性能
  useEffect(() => {
    // 记录开始时间
    const startTime = performance.now();
    
    // 初始化用户
    initUser();
    
    // 在组件挂载完成后计算加载时间
    window.addEventListener('load', () => {
      const endTime = performance.now();
      const timeElapsed = endTime - startTime;
      setLoadTime(timeElapsed);
      console.log(`应用加载完成，耗时: ${timeElapsed.toFixed(2)}ms`);
      
      // 记录性能指标
      if ('performance' in window && 'getEntriesByType' in performance) {
        const paintMetrics = performance.getEntriesByType('paint');
        const navigationMetrics = performance.getEntriesByType('navigation');
        
        console.log('性能指标:', {
          paintMetrics,
          navigationMetrics,
          memoryInfo: (performance as any).memory ? (performance as any).memory : '不可用'
        });
      }
    });
  }, [initUser]);
  
  // 错误处理函数
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('应用错误:', error);
    console.error('错误详情:', errorInfo);
    // 这里可以添加错误上报逻辑
  };

  return (
    <ErrorBoundary onError={handleError} componentName="应用根组件">
      <ThemeProvider>
        <CssBaseline />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={
                  <ErrorBoundary componentName="首页">
                    <HomePage />
                  </ErrorBoundary>
                } />
                <Route path="tasks" element={
                  <ErrorBoundary componentName="任务页">
                    <TasksPage />
                  </ErrorBoundary>
                } />
                <Route path="goals" element={
                  <ErrorBoundary componentName="目标页">
                    <GoalsPage />
                  </ErrorBoundary>
                } />
                <Route path="pomodoro" element={
                  <ErrorBoundary componentName="番茄钟页">
                    <PomodoroPage />
                  </ErrorBoundary>
                } />
                <Route path="statistics" element={
                  <ErrorBoundary componentName="统计页">
                    <StatisticsPage />
                  </ErrorBoundary>
                } />
                <Route path="settings" element={
                  <ErrorBoundary componentName="设置页">
                    <SettingsPage />
                  </ErrorBoundary>
                } />
                <Route path="test" element={
                  <ErrorBoundary componentName="测试页">
                    <TestPage />
                  </ErrorBoundary>
                } />
                <Route path="collapsible-demo" element={
                  <ErrorBoundary componentName="可折叠组件演示页">
                    <CollapsibleDivDemo />
                  </ErrorBoundary>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <PerformanceMonitor />
        <ResourcePreloader />
      </ThemeProvider>
    </ErrorBoundary>
  );
};


export default App;