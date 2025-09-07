# TODO应用快速修改指南

本指南提供了一系列常见修改场景的步骤说明，帮助初学者快速上手项目修改。每个场景都包含详细的操作步骤和相关文件位置。

## 目录

1. [修改界面样式](#1-修改界面样式)
2. [添加新组件](#2-添加新组件)
3. [修改现有功能](#3-修改现有功能)
4. [添加新页面](#4-添加新页面)
5. [调整应用配置](#5-调整应用配置)
6. [添加新的状态管理](#6-添加新的状态管理)
7. [修改数据模型](#7-修改数据模型)
8. [优化应用性能](#8-优化应用性能)

## 1. 修改界面样式

### 1.1 修改主题颜色

**文件位置**: `src/theme/theme.ts`

**修改步骤**:

1. 打开主题文件
2. 找到 `createTheme` 函数中的 `palette` 对象
3. 修改 `primary` 和 `secondary` 的颜色值

**示例修改**:

```typescript
// 修改前
primary: {
  main: '#3f51b5',
},
secondary: {
  main: '#f50057',
},

// 修改后
primary: {
  main: '#2196f3', // 新的主色调
},
secondary: {
  main: '#ff9800', // 新的次要色调
},
```

### 1.2 修改组件样式

**文件位置**: 各组件文件，如 `src/components/ui/CollapsibleDiv.tsx`

**修改步骤**:

1. 找到组件中的 `sx` 属性
2. 修改样式属性值

**示例修改**:

```typescript
// 修改前
<Box sx={{ 
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  marginBottom: '8px'
}}>

// 修改后
<Box sx={{ 
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  marginBottom: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
```

### 1.3 修改全局样式

**文件位置**: `src/style.css`

**修改步骤**:

1. 打开全局样式文件
2. 修改或添加CSS规则

**示例修改**:

```css
/* 修改前 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}

/* 修改后 */
body {
  margin: 0;
  font-family: 'Roboto', 'Helvetica Neue', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

/* 添加新样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #bbbbbb;
  border-radius: 4px;
}
```

## 2. 添加新组件

### 2.1 创建基础UI组件

**文件位置**: `src/components/ui/`

**修改步骤**:

1. 在 `ui` 目录下创建新文件，如 `CustomButton.tsx`
2. 编写组件代码
3. 导出组件

**示例代码**:

```typescript
// src/components/ui/CustomButton.tsx
import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  rounded?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  children, 
  rounded = false, 
  sx, 
  ...props 
}) => {
  return (
    <Button
      sx={{
        borderRadius: rounded ? '50px' : '4px',
        textTransform: 'none',
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
```

### 2.2 使用新组件

**文件位置**: 任何需要使用该组件的文件

**修改步骤**:

1. 导入新组件
2. 在JSX中使用组件

**示例代码**:

```typescript
// 在其他组件中使用
import CustomButton from '../components/ui/CustomButton';

const SomePage: React.FC = () => {
  return (
    <div>
      <CustomButton variant="contained" color="primary">
        普通按钮
      </CustomButton>
      
      <CustomButton variant="outlined" color="secondary" rounded>
        圆角按钮
      </CustomButton>
    </div>
  );
};
```

## 3. 修改现有功能

### 3.1 修改任务列表功能

**文件位置**: `src/components/tasks/TaskList.tsx` 和 `src/store/taskStore.ts`

**修改步骤**:

1. 在 `taskStore.ts` 中添加新的状态或操作函数
2. 在 `TaskList.tsx` 中使用新添加的状态或函数

**示例修改 (taskStore.ts)**:

```typescript
// 修改前
interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

// 修改后 - 添加任务过滤功能
interface TaskState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  filteredTasks: Task[]; // 计算属性
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filter: 'all',
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  removeTask: (id) => set((state) => ({ 
    tasks: state.tasks.filter(task => task.id !== id) 
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
  })),
  setFilter: (filter) => set({ filter }),
  get filteredTasks() {
    const { tasks, filter } = get();
    switch (filter) {
      case 'active':
        return tasks.filter(task => task.status !== 'completed');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  },
}));
```

**示例修改 (TaskList.tsx)**:

```typescript
// 修改前
const TaskList: React.FC = () => {
  const tasks = useTaskStore(state => state.tasks);
  // ...
}

// 修改后 - 使用过滤功能
const TaskList: React.FC = () => {
  const filteredTasks = useTaskStore(state => state.filteredTasks);
  const filter = useTaskStore(state => state.filter);
  const setFilter = useTaskStore(state => state.setFilter);
  
  return (
    <div>
      <div>
        <Button 
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button 
          variant={filter === 'active' ? 'contained' : 'outlined'}
          onClick={() => setFilter('active')}
        >
          进行中
        </Button>
        <Button 
          variant={filter === 'completed' ? 'contained' : 'outlined'}
          onClick={() => setFilter('completed')}
        >
          已完成
        </Button>
      </div>
      
      {/* 使用过滤后的任务列表 */}
      {filteredTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
```

### 3.2 修改番茄钟功能

**文件位置**: `src/components/pomodoro/PomodoroTimer.tsx` 和 `src/store/pomodoroStore.ts`

**修改步骤**:

1. 在 `pomodoroStore.ts` 中添加新的设置选项
2. 在 `PomodoroTimer.tsx` 中使用新设置

**示例修改 (pomodoroStore.ts)**:

```typescript
// 修改前
interface PomodoroSettings {
  workDuration: number; // 分钟
  breakDuration: number; // 分钟
}

// 修改后 - 添加长休息设置
interface PomodoroSettings {
  workDuration: number; // 分钟
  shortBreakDuration: number; // 分钟
  longBreakDuration: number; // 分钟
  sessionsBeforeLongBreak: number; // 完成几个工作周期后进行长休息
}

// 更新默认设置
const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4
};
```

## 4. 添加新页面

### 4.1 创建新页面组件

**文件位置**: `src/pages/`

**修改步骤**:

1. 在 `pages` 目录下创建新文件，如 `ReportsPage.tsx`
2. 编写页面组件代码
3. 导出组件

**示例代码**:

```typescript
// src/pages/ReportsPage.tsx
import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const ReportsPage: React.FC = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        报表与分析
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">任务完成情况</Typography>
            {/* 这里可以添加图表组件 */}
            <Box sx={{ height: 300, bgcolor: '#f5f5f5', p: 2 }}>
              任务完成率图表将显示在这里
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">番茄钟使用情况</Typography>
            {/* 这里可以添加图表组件 */}
            <Box sx={{ height: 300, bgcolor: '#f5f5f5', p: 2 }}>
              番茄钟使用统计图表将显示在这里
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
```

### 4.2 添加路由配置

**文件位置**: `src/App.tsx`

**修改步骤**:

1. 导入新页面组件
2. 在路由配置中添加新路由

**示例修改**:

```typescript
// 在懒加载部分添加
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

// 在路由配置部分添加
<Routes>
  {/* 现有路由 */}
  <Route path="/" element={<HomePage />} />
  <Route path="/tasks" element={<TasksPage />} />
  
  {/* 新增路由 */}
  <Route path="/reports" element={<ReportsPage />} />
</Routes>
```

### 4.3 添加导航菜单项

**文件位置**: `src/components/layout/AppLayout.tsx`

**修改步骤**:

1. 导入所需图标
2. 在菜单项数组中添加新项

**示例修改**:

```typescript
// 导入图标
import BarChartIcon from '@mui/icons-material/BarChart';

// 在menuItems数组中添加
const menuItems = [
  // 现有菜单项
  { text: '首页', icon: <HomeIcon />, path: '/' },
  { text: '任务', icon: <TaskIcon />, path: '/tasks' },
  
  // 新增菜单项
  { text: '报表', icon: <BarChartIcon />, path: '/reports' },
];
```

## 5. 调整应用配置

### 5.1 修改应用标题和描述

**文件位置**: `index.html` 和 `public/manifest.json`

**修改步骤**:

1. 打开 `index.html`，修改 `<title>` 标签内容
2. 打开 `public/manifest.json`，修改 `name` 和 `short_name` 字段

**示例修改 (index.html)**:

```html
<!-- 修改前 -->
<title>TODO应用</title>

<!-- 修改后 -->
<title>效率管理大师</title>
```

**示例修改 (manifest.json)**:

```json
// 修改前
{
  "name": "TODO应用",
  "short_name": "TODO",
  // ...
}

// 修改后
{
  "name": "效率管理大师",
  "short_name": "效率大师",
  // ...
}
```

### 5.2 修改构建配置

**文件位置**: `vite.config.ts`

**修改步骤**:

1. 打开配置文件
2. 根据需要修改配置选项

**示例修改**:

```typescript
// 修改前
export default defineConfig({
  plugins: [react()],
  // ...
});

// 修改后 - 添加基本路径和构建选项
export default defineConfig({
  plugins: [react()],
  base: '/todo-app/', // 如果部署到子目录
  build: {
    outDir: 'build', // 修改输出目录
    minify: 'terser', // 使用terser进行压缩
    sourcemap: false, // 不生成sourcemap
    chunkSizeWarningLimit: 1000, // 调整块大小警告限制
  },
  server: {
    port: 3000, // 修改开发服务器端口
    open: true, // 自动打开浏览器
  },
});
```

## 6. 添加新的状态管理

### 6.1 创建新的Store

**文件位置**: `src/store/`

**修改步骤**:

1. 在 `store` 目录下创建新文件，如 `notificationStore.ts`
2. 定义状态接口和创建store

**示例代码**:

```typescript
// src/store/notificationStore.ts
import { create } from 'zustand';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number; // 毫秒，默认为3000
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // 自动移除通知
    const duration = notification.duration || 3000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    }, duration);
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
  
  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));
```

### 6.2 创建通知组件

**文件位置**: `src/components/ui/NotificationSystem.tsx`

**修改步骤**:

1. 创建组件文件
2. 使用新创建的store

**示例代码**:

```typescript
// src/components/ui/NotificationSystem.tsx
import React from 'react';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useNotificationStore } from '../../store/notificationStore';

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <Stack spacing={2} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          onClose={() => removeNotification(notification.id)}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default NotificationSystem;
```

### 6.3 在应用中使用通知系统

**文件位置**: `src/App.tsx` 和其他需要显示通知的组件

**修改步骤**:

1. 在 `App.tsx` 中添加通知组件
2. 在其他组件中使用通知store

**示例修改 (App.tsx)**:

```typescript
// 导入通知组件
import NotificationSystem from './components/ui/NotificationSystem';

function App() {
  return (
    <>
      {/* 现有应用结构 */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* 路由配置 */}
          </Routes>
        </BrowserRouter>
        
        {/* 添加通知系统 */}
        <NotificationSystem />
      </ThemeProvider>
    </>
  );
}
```

**示例使用 (在其他组件中)**:

```typescript
// 在任务组件中使用通知
import { useNotificationStore } from '../store/notificationStore';

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const handleComplete = () => {
    // 完成任务的逻辑
    // ...
    
    // 显示通知
    addNotification({
      message: `任务 "${task.title}" 已完成！`,
      type: 'success',
      duration: 2000,
    });
  };
  
  // 组件其余部分
};
```

## 7. 修改数据模型

### 7.1 更新类型定义

**文件位置**: `src/models/types.ts`

**修改步骤**:

1. 打开类型定义文件
2. 修改或添加接口定义

**示例修改**:

```typescript
// 修改前
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt?: number;
}

// 修改后 - 添加新字段和类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high'; // 新增优先级字段
  tags: string[]; // 新增标签字段
  dueDate?: number; // 新增截止日期
  createdAt: number;
  updatedAt?: number;
  completedAt?: number; // 新增完成时间
}
```

### 7.2 更新相关组件

**文件位置**: 使用该数据模型的组件，如 `src/components/tasks/TaskForm.tsx`

**修改步骤**:

1. 更新表单字段以匹配新的数据模型
2. 添加新字段的输入控件

**示例修改**:

```typescript
// 修改前
const initialTask: Partial<Task> = {
  title: '',
  description: '',
  status: 'pending',
};

// 修改后 - 添加新字段
const initialTask: Partial<Task> = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium', // 默认优先级
  tags: [], // 空标签数组
  dueDate: undefined, // 无截止日期
};

// 在表单中添加新字段的输入控件
<FormControl fullWidth margin="normal">
  <InputLabel>优先级</InputLabel>
  <Select
    name="priority"
    value={formData.priority}
    onChange={handleChange}
  >
    <MenuItem value="low">低</MenuItem>
    <MenuItem value="medium">中</MenuItem>
    <MenuItem value="high">高</MenuItem>
  </Select>
</FormControl>

<FormControl fullWidth margin="normal">
  <InputLabel>截止日期</InputLabel>
  <TextField
    type="date"
    name="dueDate"
    value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
    onChange={(e) => {
      const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
      setFormData({ ...formData, dueDate: date });
    }}
  />
</FormControl>
```

## 8. 优化应用性能

### 8.1 组件优化

**文件位置**: 任何需要优化的组件

**修改步骤**:

1. 使用 `React.memo` 包装组件
2. 使用 `useCallback` 和 `useMemo` 优化函数和计算

**示例修改**:

```typescript
// 修改前
const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const handleStatusChange = (event) => {
    onUpdate(task.id, { status: event.target.value });
  };
  
  // 组件内容
};

// 修改后 - 使用React.memo和useCallback
import React, { useCallback } from 'react';

const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, onUpdate, onDelete }) => {
  // 使用useCallback缓存函数
  const handleStatusChange = useCallback((event) => {
    onUpdate(task.id, { status: event.target.value });
  }, [task.id, onUpdate]);
  
  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);
  
  // 组件内容
});
```

### 8.2 列表渲染优化

**文件位置**: 包含长列表的组件，如 `src/components/tasks/TaskList.tsx`

**修改步骤**:

1. 导入虚拟化列表组件
2. 替换普通列表渲染

**示例修改**:

```typescript
// 修改前
<List>
  {tasks.map(task => (
    <TaskItem key={task.id} task={task} />
  ))}
</List>

// 修改后 - 使用react-window进行虚拟化
import { FixedSizeList } from 'react-window';

// 列表项渲染器
const Row = ({ index, style }) => {
  const task = tasks[index];
  return (
    <div style={style}>
      <TaskItem task={task} />
    </div>
  );
};

// 虚拟化列表
<FixedSizeList
  height={400}
  width="100%"
  itemCount={tasks.length}
  itemSize={72} // 每项高度
>
  {Row}
</FixedSizeList>
```

### 8.3 代码分割

**文件位置**: `src/App.tsx`

**修改步骤**:

1. 使用 `React.lazy` 和 `Suspense` 进行代码分割

**示例修改**:

```typescript
// 修改前 - 直接导入
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';

// 修改后 - 使用懒加载
import React, { Suspense, lazy } from 'react';
import { CircularProgress } from '@mui/material';

const HomePage = lazy(() => import('./pages/HomePage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// 在路由中使用Suspense
<Suspense fallback={<CircularProgress />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/tasks" element={<TasksPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes>
</Suspense>
```

---

这个快速修改指南涵盖了TODO应用中最常见的修改场景，为初学者提供了清晰的步骤和示例。通过按照这些指南进行操作，你可以快速上手项目修改，并根据自己的需求定制应用功能和外观。

记住，修改代码是一个渐进的过程，建议先进行小的、可控的修改，确保每次修改后应用仍然能够正常运行。如果遇到问题，可以参考项目文档或向社区寻求帮助。