# TODO应用代码示例集

本文档提供了一系列实用的代码示例，帮助初学者理解如何修改和扩展TODO应用。每个示例都包含详细的解释和完整的代码片段。

## 目录

1. [组件创建与使用](#1-组件创建与使用)
2. [状态管理](#2-状态管理)
3. [路由配置](#3-路由配置)
4. [表单处理](#4-表单处理)
5. [数据可视化](#5-数据可视化)
6. [主题定制](#6-主题定制)
7. [性能优化](#7-性能优化)
8. [常见功能实现](#8-常见功能实现)

## 1. 组件创建与使用

### 1.1 创建基础UI组件

以下是创建一个简单卡片组件的示例：

```tsx
// src/components/ui/SimpleCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, Typography, CardActions, Button } from '@mui/material';

interface SimpleCardProps {
  title: string;
  content: string;
  onAction?: () => void;
  actionText?: string;
  elevation?: number;
}

const SimpleCard: React.FC<SimpleCardProps> = ({
  title,
  content,
  onAction,
  actionText = '查看',
  elevation = 1
}) => {
  return (
    <Card elevation={elevation} sx={{ maxWidth: 345, margin: '16px 0' }}>
      <CardHeader title={title} />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </CardContent>
      {onAction && (
        <CardActions>
          <Button size="small" onClick={onAction}>
            {actionText}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default SimpleCard;
```

### 1.2 使用组件

```tsx
// 在其他组件中使用SimpleCard
import SimpleCard from '../components/ui/SimpleCard';

const MyPage: React.FC = () => {
  const handleCardAction = () => {
    console.log('Card action clicked');
    // 执行其他操作
  };

  return (
    <div>
      <SimpleCard
        title="我的任务"
        content="这是一个重要的任务描述"
        onAction={handleCardAction}
        actionText="完成"
        elevation={3}
      />
    </div>
  );
};
```

### 1.3 创建可复用列表组件

```tsx
// src/components/ui/GenericList.tsx
import React from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ListItemData {
  id: string;
  primary: string;
  secondary?: string;
}

interface GenericListProps {
  items: ListItemData[];
  onItemClick?: (id: string) => void;
  onItemDelete?: (id: string) => void;
}

const GenericList: React.FC<GenericListProps> = ({ 
  items, 
  onItemClick, 
  onItemDelete 
}) => {
  return (
    <List>
      {items.map((item) => (
        <ListItem 
          key={item.id} 
          button={!!onItemClick}
          onClick={() => onItemClick && onItemClick(item.id)}
        >
          <ListItemText 
            primary={item.primary} 
            secondary={item.secondary} 
          />
          {onItemDelete && (
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                aria-label="delete"
                onClick={() => onItemDelete(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default GenericList;
```

## 2. 状态管理

### 2.1 创建简单的Zustand Store

```tsx
// src/store/counterStore.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setValue: (value: number) => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setValue: (value) => set({ count: value }),
}));
```

### 2.2 在组件中使用Store

```tsx
// src/components/Counter.tsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useCounterStore } from '../store/counterStore';

const Counter: React.FC = () => {
  // 从store中获取状态和操作
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h4">计数器: {count}</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={increment}>增加</Button>
        <Button variant="contained" onClick={decrement}>减少</Button>
        <Button variant="outlined" onClick={reset}>重置</Button>
      </Box>
    </Box>
  );
};

export default Counter;
```

### 2.3 带持久化的Store

```tsx
// src/store/persistedStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  toggleDarkMode: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

export const useSettingsStore = create<SettingsState>(
  persist(
    (set) => ({
      darkMode: false,
      fontSize: 'medium',
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'settings-storage', // localStorage的键名
    }
  )
);
```

## 3. 路由配置

### 3.1 基本路由设置

```tsx
// src/App.tsx (部分代码)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 3.2 带布局的路由

```tsx
// src/App.tsx (部分代码)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 带布局的路由 */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 3.3 路由导航

```tsx
// 使用导航链接
import { Link } from 'react-router-dom';

<Link to="/tasks">任务列表</Link>

// 编程式导航
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// 导航到指定路径
navigate('/settings');

// 返回上一页
navigate(-1);
```

## 4. 表单处理

### 4.1 基本表单

```tsx
// src/components/forms/SimpleForm.tsx
import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

interface FormData {
  name: string;
  email: string;
}

interface SimpleFormProps {
  onSubmit: (data: FormData) => void;
}

const SimpleForm: React.FC<SimpleFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="姓名"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <TextField
        label="邮箱"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Button type="submit" variant="contained">
        提交
      </Button>
    </Box>
  );
};

export default SimpleForm;
```

### 4.2 表单验证

```tsx
// src/components/forms/ValidatedForm.tsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

interface ValidatedFormProps {
  onSubmit: (data: FormData) => void;
}

const ValidatedForm: React.FC<ValidatedFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    // 用户名验证
    if (formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }
    
    // 密码验证
    if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }
    
    // 确认密码验证
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="用户名"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={!!errors.username}
        helperText={errors.username}
        required
      />
      <TextField
        label="密码"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        required
      />
      <TextField
        label="确认密码"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        required
      />
      <Button type="submit" variant="contained">
        注册
      </Button>
    </Box>
  );
};

export default ValidatedForm;
```

## 5. 数据可视化

### 5.1 简单柱状图

```tsx
// src/components/charts/SimpleBarChart.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataItem {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  title: string;
  data: DataItem[];
  color?: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  title, 
  data, 
  color = 'rgba(54, 162, 235, 0.8)' 
}) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        backgroundColor: color,
        borderColor: color.replace('0.8', '1'),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default SimpleBarChart;
```

### 5.2 使用图表组件

```tsx
// 在页面中使用图表
import SimpleBarChart from '../components/charts/SimpleBarChart';

const StatisticsPage: React.FC = () => {
  const taskCompletionData = [
    { label: '周一', value: 5 },
    { label: '周二', value: 8 },
    { label: '周三', value: 3 },
    { label: '周四', value: 7 },
    { label: '周五', value: 10 },
    { label: '周六', value: 4 },
    { label: '周日', value: 2 },
  ];

  return (
    <div>
      <SimpleBarChart 
        title="每日完成任务数" 
        data={taskCompletionData} 
        color="rgba(75, 192, 192, 0.8)" 
      />
    </div>
  );
};
```

## 6. 主题定制

### 6.1 创建自定义主题

```tsx
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

// 亮色主题
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// 暗色主题
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        },
      },
    },
  },
});
```

### 6.2 使用主题提供者

```tsx
// src/App.tsx (部分代码)
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme/theme';
import { useSettingsStore } from './store/settingsStore';

function App() {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* 重置CSS */}
      {/* 应用其余部分 */}
    </ThemeProvider>
  );
}
```

## 7. 性能优化

### 7.1 使用React.memo

```tsx
// src/components/ui/MemoizedComponent.tsx
import React from 'react';

interface MemoizedComponentProps {
  value: string;
  onClick: () => void;
}

// 使用React.memo包装组件，只有当props变化时才会重新渲染
const MemoizedComponent: React.FC<MemoizedComponentProps> = React.memo(({ value, onClick }) => {
  console.log('MemoizedComponent rendered');
  
  return (
    <div onClick={onClick}>
      {value}
    </div>
  );
});

export default MemoizedComponent;
```

### 7.2 使用useCallback和useMemo

```tsx
// src/components/OptimizedParent.tsx
import React, { useState, useCallback, useMemo } from 'react';
import MemoizedComponent from './ui/MemoizedComponent';

const OptimizedParent: React.FC = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('Hello');

  // 使用useCallback缓存函数引用
  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // 空依赖数组，函数引用永远不变

  // 使用useMemo缓存计算结果
  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value');
    return text.split('').reverse().join('');
  }, [text]); // 只有当text变化时才重新计算

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Enter text" 
      />
      <p>Reversed: {expensiveValue}</p>
      
      {/* 即使父组件重新渲染，MemoizedComponent也不会重新渲染 */}
      <MemoizedComponent value={text} onClick={handleClick} />
    </div>
  );
};

export default OptimizedParent;
```

### 7.3 使用React.lazy进行代码分割

```tsx
// src/App.tsx (部分代码)
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';

// 使用React.lazy懒加载组件
const HomePage = lazy(() => import('./pages/HomePage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

## 8. 常见功能实现

### 8.1 拖拽排序

```tsx
// src/components/DraggableList.tsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { List, ListItem, ListItemText, Paper } from '@mui/material';

interface Item {
  id: string;
  content: string;
}

interface DraggableListProps {
  items: Item[];
  onReorder: (items: Item[]) => void;
}

const DraggableList: React.FC<DraggableListProps> = ({ items, onReorder }) => {
  const handleDragEnd = (result: DropResult) => {
    // 如果没有目标或者拖拽到列表外，则不做任何操作
    if (!result.destination) return;

    // 创建新的排序后的数组
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    // 更新状态
    onReorder(reorderedItems);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided) => (
          <Paper
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ maxWidth: 400, margin: '0 auto' }}
          >
            <List>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        userSelect: 'none',
                        padding: 2,
                        margin: '0 0 8px 0',
                        backgroundColor: 'background.paper',
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                    >
                      <ListItemText primary={item.content} />
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          </Paper>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;
```

### 8.2 无限滚动

```tsx
// src/components/InfiniteScroll.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface InfiniteScrollProps<T> {
  loadItems: (page: number) => Promise<T[]>;
  renderItem: (item: T, index: number) => React.ReactNode;
  hasMore: boolean;
  loadingText?: string;
  endText?: string;
}

function InfiniteScroll<T>({ 
  loadItems, 
  renderItem, 
  hasMore, 
  loadingText = '加载中...', 
  endText = '没有更多数据了' 
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 加载数据
  const loadMoreItems = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newItems = await loadItems(page);
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  // 设置交叉观察器
  useEffect(() => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreItems();
      }
    });

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  return (
    <Box sx={{ width: '100%' }}>
      {items.map((item, index) => renderItem(item, index))}
      
      <Box 
        ref={loadingRef} 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: 2 
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>{loadingText}</Typography>
          </Box>
        ) : hasMore ? null : (
          <Typography color="text.secondary">{endText}</Typography>
        )}
      </Box>
    </Box>
  );
}

export default InfiniteScroll;
```

### 8.3 本地存储工具

```tsx
// src/utils/storage.ts

// 存储数据到localStorage
export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

// 从localStorage获取数据
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) return defaultValue;
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return defaultValue;
  }
};

// 从localStorage删除数据
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
};

// 清空localStorage
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
};
```

### 8.4 日期时间工具

```tsx
// src/utils/dateUtils.ts

// 格式化日期为YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化时间为HH:MM:SS
export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// 格式化日期时间为YYYY-MM-DD HH:MM:SS
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// 获取相对时间描述（如：3分钟前，2小时前）
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}秒前`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}小时前`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}天前`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}个月前`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前`;
};
```

---

这些代码示例涵盖了TODO应用开发中常见的场景和功能，可以作为初学者学习和修改项目的参考。你可以根据自己的需求，复制、修改和扩展这些示例，以实现自己想要的功能。

记住，最好的学习方式是通过实践，尝试将这些示例集成到项目中，并根据实际需求进行调整。