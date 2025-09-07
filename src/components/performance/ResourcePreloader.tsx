import React, { useEffect } from 'react';

/**
 * 资源预加载组件
 * 用于预加载关键资源和实现资源提示
 */
const ResourcePreloader: React.FC = () => {
  useEffect(() => {
    // 预加载关键路由
    const preloadRoutes = [
      './pages/HomePage',
      './pages/TasksPage',
      './pages/GoalsPage',
    ];

    // 预加载关键资源
    const preloadResources = () => {
      // 使用requestIdleCallback在浏览器空闲时预加载
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          preloadRoutes.forEach(route => {
            import(/* @vite-ignore */ route)
              .catch(err => console.log(`预加载路由失败: ${route}`, err));
          });
        }, { timeout: 2000 });
      } else {
        // 降级处理
        setTimeout(() => {
          preloadRoutes.forEach(route => {
            import(/* @vite-ignore */ route)
              .catch(err => console.log(`预加载路由失败: ${route}`, err));
          });
        }, 1000);
      }
    };

    // 添加资源提示
    const addResourceHints = () => {
      // DNS预解析
      const dnsPreconnectLinks = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ];

      dnsPreconnectLinks.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = url;
        document.head.appendChild(link);

        // 同时添加preconnect
        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = url;
        document.head.appendChild(preconnectLink);
      });
    };

    // 在页面加载完成后执行预加载
    if (document.readyState === 'complete') {
      preloadResources();
      addResourceHints();
    } else {
      window.addEventListener('load', () => {
        preloadResources();
        addResourceHints();
      });
    }

    // 清理函数
    return () => {
      window.removeEventListener('load', preloadResources);
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
};

export default ResourcePreloader;