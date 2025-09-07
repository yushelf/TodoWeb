# TODO应用技术指南

## 1. 技术架构概述

### 1.1 架构设计

TODO应用采用现代前端单页应用(SPA)架构，基于React和TypeScript构建。应用架构遵循以下原则：

- **组件化设计**：将UI拆分为可复用的组件
- **状态管理分离**：使用Zustand管理全局状态
- **类型安全**：使用TypeScript确保代码类型安全
- **响应式设计**：适配不同屏幕尺寸的设备
- **性能优化**：采用代码分割、懒加载等技术提升性能

### 1.2 技术栈详解

#### 1.2.1 核心框架

- **React 18.2.0**
  - 采用函数式组件和Hooks API
  - 使用Context API进行主题管理
  - 利用React.lazy和Suspense实现代码分割和懒加载

- **TypeScript 5.8.3**
  - 为JavaScript添加静态类型
  - 提高代码可维护性和开发效率
  - 减少运行时错误

#### 1.2.2 UI框架

- **Material-UI (MUI) 7.3.1**
  - 提供符合Material Design的React组件
  - 支持主题定制和响应式设计
  - 包含丰富的UI组件和图标

#### 1.2.3 状态管理

- **Zustand 5.0.8**
  - 轻量级状态管理库
  - 使用hooks API简化状态访问
  - 支持中间件扩展（如persist用于状态持久化）

#### 1.2.4 路由管理

- **React Router DOM 7.8.1**
  - 声明式路由管理
  - 支持嵌套路由和路由参数
  - 提供导航控制和历史管理

#### 1.2.5 数据可视化

- **Chart.js 4.5.0 & React-Chartjs-2 5.3.0**
  - 创建交互式图表
  - 支持多种图表类型（折线图、柱状图、饼图等）
  - 结合date-fns处理时间序列数据

#### 1.2.6 构建工具

- **Vite 7.1.2**
  - 现代前端构建工具
  - 提供快速的开发服务器和热模块替换
  - 优化的生产构建

## 2. 代码结构与模块说明

### 2.1 目录结构详解

```
/todo_web
├── public/                  # 静态资源
│   ├── manifest.json        # PWA配置
│   ├── service-worker.js    # 服务工作线程
│   └── offline.html         # 离线页面
├── src/
│   ├── assets/              # 项目资源文件
│   ├── components/          # 组件目录
│   │   ├── error/           # 错误处理组件
│   │   ├── goals/           # 目标相关组件
│   │   ├── layout/          # 布局组件
│   │   ├── performance/     # 性能监控组件
│   │   ├── pomodoro/        # 番茄钟组件
│   │   ├── settings/        # 设置组件
│   │   ├── statistics/      # 统计分析组件
│   │   ├── tasks/           # 任务相关组件
│   │   ├── test/            # 测试组件
│   │   └── ui/              # 通用UI组件
│   ├── contexts/            # React上下文
│   │   └── ThemeContext.tsx # 主题上下文
│   ├── hooks/               # 自定义钩子
│   │   └── useOptimizedState.ts # 优化的状态钩子
│   ├── models/              # 数据模型定义
│   │   └── types.ts         # 类型定义
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx     # 主页
│   │   ├── TasksPage.tsx    # 任务页面
│   │   ├── GoalsPage.tsx    # 目标页面
│   │   ├── PomodoroPage.tsx # 番茄钟页面
│   │   ├── StatisticsPage.tsx # 统计页面
│   │   └── SettingsPage.tsx # 设置页面
│   ├── services/            # 服务层
│   │   ├── audioService.ts  # 音频服务
│   │   ├── dataService.ts   # 数据服务
│   │   └── notificationService.ts # 通知服务
│   ├── store/               # 状态管理
│   │   ├── taskStore.ts     # 任务状态
│   │   ├── goalStore.ts     # 目标状态
│   │   ├── pomodoroStore.ts # 番茄钟状态
│   │   ├── userStore.ts     # 用户状态
│   │   └── statisticsStore.ts # 统计状态
│   ├── theme/               # 主题配置
│   │   └── theme.ts         # 主题定义
│   └── utils/               # 工具函数
│       ├── timeUtils.ts     # 时间处理工具
│       └── optimizeComponent.tsx # 组件优化工具
├── index.html               # HTML入口文件
├── package.json             # 项目依赖配置
├── tsconfig.json            # TypeScript配置
└── vite.config.ts           # Vite配置
```

### 2.2 核心模块说明

#### 2.2.1 数据模型 (models/types.ts)

定义了应用的核心数据结构，包括：

- **User**: 用户信息和偏好设置
- **Task**: 任务数据结构，包含标题、描述、优先级、象限等属性
- **Goal**: 目标数据结构，支持长期、中期和短期目标
- **PomodoroRecord**: 番茄钟记录，包含开始时间、结束时间、中断等信息

#### 2.2.2 状态管理 (store/)

使用Zustand管理全局状态，主要包括：

- **taskStore.ts**: 管理任务的创建、更新、删除和查询
- **goalStore.ts**: 管理目标的创建、更新、删除和查询
- **pomodoroStore.ts**: 管理番茄钟的状态、计时和记录
- **userStore.ts**: 管理用户偏好设置和主题
- **statisticsStore.ts**: 管理统计数据的计算和缓存

#### 2.2.3 服务层 (services/)

提供特定功能的服务：

- **dataService.ts**: 处理数据的导入导出和备份恢复
- **audioService.ts**: 管理音频播放，如番茄钟提示音
- **notificationService.ts**: 处理浏览器通知

#### 2.2.4 组件层 (components/)

按功能模块组织的React组件：

- **tasks/**: 任务相关组件，如TaskList、TaskForm、TaskQuadrants
- **goals/**: 目标相关组件，如GoalList、GoalForm
- **pomodoro/**: 番茄钟相关组件，如PomodoroTimer、PomodoroHistory
- **statistics/**: 统计分析组件，如TaskStats、PomodoroStats
- **ui/**: 通用UI组件，如CollapsibleDiv、OptimizedImage

#### 2.2.5 页面层 (pages/)

应用的主要页面：

- **HomePage.tsx**: 应用主页，显示概览信息
- **TasksPage.tsx**: 任务管理页面
- **GoalsPage.tsx**: 目标管理页面
- **PomodoroPage.tsx**: 番茄钟页面
- **StatisticsPage.tsx**: 统计分析页面
- **SettingsPage.tsx**: 设置页面

## 3. 状态管理详解

### 3.1 Zustand状态管理

应用使用Zustand进行状态管理，每个主要功能模块有独立的状态存储：

```typescript
// 示例：taskStore.ts的简化版本
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  // 其他方法...
}

export const useTaskStore = create<TaskState>(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => {
        const id = uuidv4();
        const newTask = {
          ...taskData,
          id,
          createdAt: new Date(),
          // 其他默认值...
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        return id;
      },
      
      // 其他方法实现...
    }),
    {
      name: 'task-storage', // localStorage的键名
    }
  )
);
```

### 3.2 状态持久化

使用Zustand的persist中间件将状态持久化到localStorage：

```typescript
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // 状态和方法...
    }),
    {
      name: 'store-name', // localStorage的键名
      getStorage: () => localStorage, // 使用localStorage作为存储
    }
  )
);
```

### 3.3 状态间的交互

不同状态存储之间的交互通过导入和调用其他存储的方法实现：

```typescript
import { useGoalStore } from './goalStore';

export const useTaskStore = create<TaskState>(
  persist(
    (set, get) => ({
      // ...
      
      completeTask: (id: string) => {
        // 更新任务状态
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? { ...task, status: 'completed', completedAt: new Date() }
              : task
          ),
        }));
        
        // 更新关联目标的进度
        const task = get().getTaskById(id);
        if (task?.goalId) {
          useGoalStore.getState().updateGoalProgress(task.goalId);
        }
      },
      
      // ...
    }),
    { name: 'task-storage' }
  )
);
```

## 4. 组件设计模式

### 4.1 函数式组件与Hooks

应用使用React函数式组件和Hooks API：

```typescript
import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

interface TaskListProps {
  showCompleted?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ showCompleted = false }) => {
  const { tasks, getTasksByStatus } = useTaskStore();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    const tasksToShow = showCompleted
      ? tasks
      : getTasksByStatus('not_started').concat(getTasksByStatus('in_progress'));
    setFilteredTasks(tasksToShow);
  }, [tasks, showCompleted, getTasksByStatus]);
  
  return (
    <div>
      {filteredTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
```

### 4.2 组件优化

使用React.memo、useCallback和useMemo优化组件性能：

```typescript
import React, { useCallback, useMemo } from 'react';

const TaskItem: React.FC<{ task: Task }> = React.memo(({ task }) => {
  const { updateTask } = useTaskStore();
  
  const handleStatusChange = useCallback((status: TaskStatus) => {
    updateTask(task.id, { status });
  }, [task.id, updateTask]);
  
  const formattedDate = useMemo(() => {
    return task.dueDate ? formatDate(task.dueDate) : 'No due date';
  }, [task.dueDate]);
  
  return (
    <div>
      <h3>{task.title}</h3>
      <p>{formattedDate}</p>
      {/* 其他内容... */}
    </div>
  );
});
```

### 4.3 组件懒加载

使用React.lazy和Suspense实现组件懒加载：

```typescript
import React, { lazy, Suspense } from 'react';
import { CircularProgress } from '@mui/material';

const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));

function App() {
  return (
    <Routes>
      <Route
        path="/statistics"
        element={
          <Suspense fallback={<CircularProgress />}>
            <StatisticsPage />
          </Suspense>
        }
      />
      {/* 其他路由... */}
    </Routes>
  );
}
```

## 5. 性能优化策略

### 5.1 代码分割与懒加载

- 使用React.lazy和Suspense按需加载组件
- 将路由组件拆分为独立的代码块
- 使用动态import()导入大型库或不常用功能

### 5.2 渲染优化

- 使用React.memo避免不必要的重渲染
- 使用useCallback缓存事件处理函数
- 使用useMemo缓存计算结果
- 实现虚拟滚动处理大列表

### 5.3 资源优化

- 优化图片大小和格式
- 使用预加载关键资源
- 实现资源的懒加载

### 5.4 构建优化

- 使用Vite的生产构建优化
- 启用代码压缩和tree-shaking
- 实现缓存策略

## 6. 测试策略

### 6.1 单元测试

使用Jest和React Testing Library进行单元测试：

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from './TaskItem';

test('renders task item with correct title', () => {
  const task = {
    id: '1',
    title: 'Test Task',
    // 其他必要属性...
  };
  
  render(<TaskItem task={task} />);
  expect(screen.getByText('Test Task')).toBeInTheDocument();
});

test('calls updateTask when complete button is clicked', () => {
  const mockUpdateTask = jest.fn();
  jest.mock('../store/taskStore', () => ({
    useTaskStore: () => ({
      updateTask: mockUpdateTask,
    }),
  }));
  
  const task = {
    id: '1',
    title: 'Test Task',
    status: 'not_started',
    // 其他必要属性...
  };
  
  render(<TaskItem task={task} />);
  fireEvent.click(screen.getByText('Complete'));
  
  expect(mockUpdateTask).toHaveBeenCalledWith('1', { status: 'completed' });
});
```

### 6.2 集成测试

测试组件间的交互和数据流：

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from './TaskList';
import { useTaskStore } from '../store/taskStore';

// 模拟Zustand存储
jest.mock('../store/taskStore');

test('filters tasks based on showCompleted prop', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', status: 'not_started' },
    { id: '2', title: 'Task 2', status: 'completed' },
  ];
  
  (useTaskStore as jest.Mock).mockImplementation(() => ({
    tasks: mockTasks,
    getTasksByStatus: (status) => mockTasks.filter(t => t.status === status),
  }));
  
  // 不显示已完成任务
  render(<TaskList showCompleted={false} />);
  expect(screen.getByText('Task 1')).toBeInTheDocument();
  expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
  
  // 显示已完成任务
  render(<TaskList showCompleted={true} />);
  expect(screen.getByText('Task 1')).toBeInTheDocument();
  expect(screen.getByText('Task 2')).toBeInTheDocument();
});
```

### 6.3 性能测试

使用React Profiler和性能监控工具：

```typescript
import { Profiler } from 'react';

const onRenderCallback = (
  id, // 发生提交的Profiler树的"id"
  phase, // "mount"（首次挂载）或"update"（重新渲染）
  actualDuration, // 本次更新committed花费的渲染时间
  baseDuration, // 估计不使用memoization的情况下渲染整颗子树需要的时间
  startTime, // 本次更新开始渲染的时间
  commitTime // 本次更新committed的时间
) => {
  console.log(`Component ${id} rendered in ${actualDuration}ms`);
};

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <TaskList />
    </Profiler>
  );
}
```

## 7. 部署与发布

### 7.1 构建生产版本

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 7.2 部署策略

- 静态网站托管（如Netlify、Vercel、GitHub Pages）
- 使用CDN加速资源加载
- 实现缓存策略

### 7.3 持续集成/持续部署

使用GitHub Actions或其他CI/CD工具自动化构建和部署流程：

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 8. 扩展与维护

### 8.1 添加新功能

添加新功能的步骤：

1. 更新数据模型（如需要）
2. 创建或更新状态存储
3. 实现UI组件
4. 添加路由（如需要）
5. 更新测试

示例：添加标签筛选功能

```typescript
// 1. 更新taskStore.ts
export const useTaskStore = create<TaskState>(
  persist(
    (set, get) => ({
      // 现有代码...
      
      // 添加新方法
      getTasksByTag: (tag: string) => {
        return get().tasks.filter(task => task.tags.includes(tag));
      },
      
      // 现有代码...
    }),
    { name: 'task-storage' }
  )
);

// 2. 创建新组件
const TagFilter: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const { tasks, getTasksByTag } = useTaskStore();
  
  // 获取所有唯一标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(task => {
      task.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [tasks]);
  
  // 根据选中标签筛选任务
  const filteredTasks = useMemo(() => {
    return selectedTag ? getTasksByTag(selectedTag) : tasks;
  }, [selectedTag, tasks, getTasksByTag]);
  
  return (
    <div>
      <div>
        {allTags.map(tag => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => setSelectedTag(tag)}
            color={selectedTag === tag ? 'primary' : 'default'}
          />
        ))}
      </div>
      <TaskList tasks={filteredTasks} />
    </div>
  );
};
```

### 8.2 代码重构

重构建议：

- 提取重复逻辑为自定义钩子
- 将大组件拆分为小组件
- 优化状态管理结构

### 8.3 性能监控

实现性能监控：

```typescript
// components/performance/PerformanceMonitor.tsx
import { useEffect } from 'react';

const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // 监听页面加载性能
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      console.log(`页面加载时间: ${loadTime}ms`);
      
      // 可以将性能数据发送到分析服务
    });
    
    // 监听长任务
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`检测到长任务: ${entry.duration}ms`);
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return null; // 这是一个纯逻辑组件，不渲染任何UI
};

export default PerformanceMonitor;
```

## 9. 常见问题与解决方案

### 9.1 状态管理问题

**问题**: 状态更新后组件不重新渲染

**解决方案**: 
- 确保正确使用Zustand的选择器
- 检查组件是否正确订阅状态变化

```typescript
// 错误用法
const tasks = useTaskStore().tasks;

// 正确用法
const tasks = useTaskStore(state => state.tasks);
```

### 9.2 性能问题

**问题**: 大列表渲染性能差

**解决方案**: 
- 实现虚拟滚动
- 使用分页加载
- 优化渲染逻辑

```typescript
import { FixedSizeList } from 'react-window';

const VirtualizedTaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TaskItem task={tasks[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={tasks.length}
      itemSize={80}
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 9.3 本地存储问题

**问题**: localStorage存储非字符串值导致错误

**解决方案**: 
- 确保存储前将值转换为字符串
- 使用自定义存储适配器

```typescript
// 自定义存储适配器
const customStorage = {
  getItem: (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
};

// 在Zustand中使用
export const useStore = create(
  persist(
    (set, get) => ({
      // 状态和方法...
    }),
    {
      name: 'store-name',
      getStorage: () => customStorage,
    }
  )
);
```

## 10. 贡献指南

### 10.1 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/username/todo_web.git
cd todo_web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 10.2 代码提交规范

- 使用语义化的提交信息
- 提交前运行测试和代码检查
- 遵循项目的代码风格

### 10.3 分支管理

- `main`: 主分支，保持稳定可发布状态
- `develop`: 开发分支，集成新功能
- `feature/*`: 功能分支，用于开发新功能
- `bugfix/*`: 修复分支，用于修复bug

### 10.4 代码审查

- 提交前自我审查代码
- 使用Pull Request进行团队审查
- 确保代码符合项目标准

## 11. API文档

### 11.1 状态存储API

#### 11.1.1 taskStore

```typescript
interface TaskState {
  tasks: Task[];
  
  // 任务管理方法
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'pomodorosSpent' | 'tags'> & { tags?: string[] }) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  startTask: (id: string) => void;
  completeTask: (id: string) => void;
  cancelTask: (id: string) => void;
  incrementPomodorosSpent: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  
  // 任务查询方法
  getTaskById: (id: string) => Task | undefined;
  getTasksByQuadrant: (quadrant: Task['quadrant']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTasksByGoal: (goalId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByTag: (tag: string) => Task[];
  getTasksDueToday: () => Task[];
  getTasksDueThisWeek: () => Task[];
  getOverdueTasks: () => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
}
```

#### 11.1.2 goalStore

```typescript
interface GoalState {
  goals: Goal[];
  
  // 目标管理方法
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status' | 'progress' | 'pomodorosSpent' | 'tasks'>) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  startGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  cancelGoal: (id: string) => void;
  updateGoalProgress: (id: string) => void;
  addTaskToGoal: (goalId: string, taskId: string) => void;
  removeTaskFromGoal: (goalId: string, taskId: string) => void;
  incrementPomodorosSpent: (id: string) => void;
  
  // 目标查询方法
  getGoalById: (id: string) => Goal | undefined;
  getGoalsByCategory: (category: string) => Goal[];
  getGoalsByType: (type: Goal['type']) => Goal[];
  getGoalsByStatus: (status: Goal['status']) => Goal[];
  getSubGoals: (parentId: string) => Goal[];
  getTopLevelGoals: () => Goal[];
}
```

#### 11.1.3 pomodoroStore

```typescript
interface PomodoroState {
  // 番茄钟状态
  status: PomodoroStatus;
  currentTaskId: string | null;
  timeLeft: number; // 剩余时间（秒）
  totalTime: number; // 总时间（秒）
  isLongBreak: boolean;
  pomodorosUntilLongBreak: number;
  currentPomodoroId: string | null;
  currentInterruptions: Interruption[];
  notes: string;
  
  // 番茄钟记录
  records: PomodoroRecord[];
  
  // 番茄钟控制方法
  startPomodoro: (taskId?: string) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  stopPomodoro: (completed: boolean) => void;
  startBreak: (isLong?: boolean) => void;
  stopBreak: () => void;
  tick: () => void;
  addInterruption: (reason: string, type: 'internal' | 'external') => void;
  updateNotes: (notes: string) => void;
  
  // 番茄钟记录查询方法
  getRecordsByTask: (taskId: string) => PomodoroRecord[];
  getRecordsByDate: (date: Date) => PomodoroRecord[];
  getRecordsByDateRange: (startDate: Date, endDate: Date) => PomodoroRecord[];
  getTotalPomodorosToday: () => number;
  getCompletedPomodorosToday: () => number;
  getTotalFocusTimeToday: () => number; // 分钟
}
```

### 11.2 服务API

#### 11.2.1 dataService

```typescript
interface DataService {
  exportData: () => Promise<string>; // 返回JSON字符串
  importData: (jsonData: string) => Promise<boolean>; // 导入成功返回true
  backupData: () => Promise<void>; // 创建备份
  restoreData: (backupId: string) => Promise<boolean>; // 从备份恢复
  resetData: () => Promise<void>; // 重置所有数据
}
```

#### 11.2.2 notificationService

```typescript
interface NotificationService {
  requestPermission: () => Promise<boolean>; // 请求通知权限
  showNotification: (title: string, options?: NotificationOptions) => void; // 显示通知
  scheduleNotification: (title: string, options: NotificationOptions, delay: number) => number; // 延时通知，返回定时器ID
  cancelNotification: (id: number) => void; // 取消通知
}
```

#### 11.2.3 audioService

```typescript
interface AudioService {
  playSound: (sound: string) => Promise<void>; // 播放指定音效
  stopSound: () => void; // 停止当前音效
  setVolume: (volume: number) => void; // 设置音量 (0-1)
}
```

## 12. 版本历史

### v0.1.0 (初始版本)
- 基本任务管理功能
- 四象限任务视图
- 简单番茄钟功能

### v0.2.0
- 添加目标管理功能
- 改进番茄钟记录
- 添加基本统计功能

### v0.3.0
- 添加高级统计分析
- 实现数据导入导出
- 优化性能

### v0.4.0 (当前版本)
- 添加主题切换功能
- 实现响应式设计
- 优化加载性能
- 添加可折叠组件