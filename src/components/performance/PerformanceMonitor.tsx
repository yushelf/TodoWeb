import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Collapse } from '@mui/material';

interface PerformanceMetrics {
  loadTime: number;
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  domLoad: number | null; // DOM Content Loaded
  windowLoad: number | null; // Window Load
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    domLoad: null,
    windowLoad: null
  });
  
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    
    // 测量基本加载时间
    const calculateLoadTime = () => {
      const endTime = performance.now();
      setMetrics(prev => ({ ...prev, loadTime: endTime - startTime }));
    };

    // 获取绘制指标
    const getPaintMetrics = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const paintEntries = performance.getEntriesByType('paint');
        
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
        }
        
        // 获取导航指标
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          const nav = navEntries[0] as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            ttfb: nav.responseStart - nav.requestStart,
            domLoad: nav.domContentLoadedEventEnd - nav.fetchStart,
            windowLoad: nav.loadEventEnd - nav.fetchStart
          }));
        }
      }
    };

    // 测量LCP (Largest Contentful Paint)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
            }
          });
          
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
          console.error('LCP观察器错误:', e);
        }
      }
    };

    // 测量FID (First Input Delay)
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        try {
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length > 0) {
              const firstInput = entries[0] as PerformanceEventTiming;
              setMetrics(prev => ({ ...prev, fid: firstInput.processingStart - firstInput.startTime }));
            }
          });
          
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (e) {
          console.error('FID观察器错误:', e);
        }
      }
    };

    // 测量CLS (Cumulative Layout Shift)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
                setMetrics(prev => ({ ...prev, cls: clsValue }));
              }
            }
          });
          
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
          console.error('CLS观察器错误:', e);
        }
      }
    };

    // 初始化所有性能监控
    calculateLoadTime();
    getPaintMetrics();
    observeLCP();
    observeFID();
    observeCLS();

    // 页面完全加载后再次获取指标
    window.addEventListener('load', () => {
      calculateLoadTime();
      getPaintMetrics();
    });

    // 记录到控制台
    const logInterval = setInterval(() => {
      console.log('性能指标:', metrics);
    }, 3000);

    return () => {
      clearInterval(logInterval);
    };
  }, []);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        zIndex: 9999,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          cursor: 'pointer',
          maxWidth: expanded ? 300 : 150,
          transition: 'all 0.3s ease'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
          加载: {metrics.loadTime.toFixed(0)}ms {expanded ? '▲' : '▼'}
        </Typography>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ display: 'block' }}>
              FCP: {metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              LCP: {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              FID: {metrics.fid ? `${metrics.fid.toFixed(1)}ms` : 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              TTFB: {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              DOM加载: {metrics.domLoad ? `${metrics.domLoad.toFixed(0)}ms` : 'N/A'}
            </Typography>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default PerformanceMonitor;