import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Divider, Stack } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import TimerIcon from '@mui/icons-material/Timer';
import ErrorBoundary from '../error/ErrorBoundary';

// 故意崩溃的组件
const CrashingComponent: React.FC = () => {
  throw new Error('这是一个故意抛出的错误，用于测试错误边界');
  return <div>这个组件永远不会渲染</div>;
};

// 内存泄漏测试组件
const MemoryLeakTester: React.FC = () => {
  const [leaks, setLeaks] = useState<any[]>([]);
  
  const createMemoryLeak = () => {
    // 创建一个大对象
    const leak = new Array(1000000).fill('测试内存泄漏').map((item, index) => ({ 
      id: index, 
      data: item + index,
      timestamp: new Date().toISOString(),
      nestedData: { moreData: new Array(100).fill('嵌套数据') }
    }));
    
    setLeaks([...leaks, leak]);
    console.log(`已创建 ${leaks.length + 1} 个内存泄漏对象`);
  };
  
  const clearLeaks = () => {
    setLeaks([]);
    console.log('已清除内存泄漏');
  };
  
  return (
    <Box>
      <Typography variant="subtitle1">内存泄漏测试</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        点击按钮创建大量对象，模拟内存泄漏情况
      </Typography>
      <Stack direction="row" spacing={2} mt={1}>
        <Button 
          variant="outlined" 
          color="warning" 
          onClick={createMemoryLeak}
          startIcon={<MemoryIcon />}
        >
          创建内存泄漏
        </Button>
        <Button 
          variant="outlined" 
          onClick={clearLeaks}
        >
          清除
        </Button>
      </Stack>
      <Typography variant="caption" mt={1}>
        已创建 {leaks.length} 个大对象 (每个约 ~10MB)
      </Typography>
    </Box>
  );
};

// 异步错误测试组件
const AsyncErrorTester: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  
  const triggerAsyncError = () => {
    // 模拟异步操作中的错误
    setTimeout(() => {
      try {
        // 故意制造错误
        const obj: any = null;
        obj.nonExistentMethod();
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
        console.error('捕获到异步错误:', err);
      }
    }, 1000);
  };
  
  const triggerUnhandledPromiseError = () => {
    // 创建一个未处理的Promise错误
    new Promise((_, reject) => {
      reject(new Error('未处理的Promise错误'));
    });
  };
  
  return (
    <Box>
      <Typography variant="subtitle1">异步错误测试</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        测试应用处理异步错误的能力
      </Typography>
      <Stack direction="row" spacing={2} mt={1}>
        <Button 
          variant="outlined" 
          color="info" 
          onClick={triggerAsyncError}
        >
          触发已处理的异步错误
        </Button>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={triggerUnhandledPromiseError}
        >
          触发未处理的Promise错误
        </Button>
      </Stack>
      {error && (
        <Typography color="error" variant="body2" mt={1}>
          错误: {error}
        </Typography>
      )}
    </Box>
  );
};

// 性能测试组件
const PerformanceTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const runHeavyTask = () => {
    setIsRunning(true);
    setResult(null);
    
    const startTime = performance.now();
    
    // 模拟CPU密集型任务
    setTimeout(() => {
      let sum = 0;
      for (let i = 0; i < 10000000; i++) {
        sum += Math.sqrt(i) * Math.sin(i);
      }
      
      const endTime = performance.now();
      setResult(`计算完成，耗时: ${(endTime - startTime).toFixed(2)}ms`);
      setIsRunning(false);
    }, 0);
  };
  
  return (
    <Box>
      <Typography variant="subtitle1">性能测试</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        执行CPU密集型任务，测试应用响应性
      </Typography>
      <Button 
        variant="outlined" 
        color="secondary" 
        onClick={runHeavyTask}
        disabled={isRunning}
        startIcon={<TimerIcon />}
      >
        {isRunning ? '计算中...' : '运行性能测试'}
      </Button>
      {result && (
        <Typography variant="body2" mt={1}>
          {result}
        </Typography>
      )}
    </Box>
  );
};

// 主稳定性测试组件
const StabilityTester: React.FC = () => {
  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <BugReportIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">应用稳定性测试工具</Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        此工具用于测试应用在各种异常情况下的稳定性和错误处理能力。请谨慎使用这些功能，它们可能会导致应用暂时不响应或崩溃。
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Stack spacing={3}>
        {/* 错误边界测试 */}
        <Box>
          <Typography variant="subtitle1">错误边界测试</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            测试ErrorBoundary组件捕获渲染错误的能力
          </Typography>
          <ErrorBoundary componentName="测试组件">
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => {
                const CrashComponent = () => <CrashingComponent />;
                return <CrashComponent />;
              }}
            >
              触发组件错误
            </Button>
          </ErrorBoundary>
        </Box>
        
        <Divider />
        
        {/* 内存泄漏测试 */}
        <MemoryLeakTester />
        
        <Divider />
        
        {/* 异步错误测试 */}
        <AsyncErrorTester />
        
        <Divider />
        
        {/* 性能测试 */}
        <PerformanceTester />
      </Stack>
    </Paper>
  );
};

export default StabilityTester;