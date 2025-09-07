import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    // 启用源码映射以便于调试
    sourcemap: false,
    // 启用代码分割
    cssCodeSplit: true,
    // 设置块大小警告限制
    chunkSizeWarningLimit: 1000,
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库打包在一起
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将MUI相关库打包在一起
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          // 将工具库打包在一起
          'utils-vendor': ['uuid', 'date-fns', 'zustand'],
        },
      },
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'zustand',
    ],
  },
  // 启用缓存
  server: {
    hmr: true,
  },
});