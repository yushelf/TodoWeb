# TODO应用项目架构文档

## 1. 项目概述

本文档详细介绍了TODO应用的整体架构设计，帮助初学者理解项目的各个组成部分及其相互关系。该应用是一个基于React的现代化前端项目，采用了组件化、状态管理分离的设计理念。

## 2. 技术栈

项目使用了以下核心技术：

- **React**: 用于构建用户界面的JavaScript库
- **TypeScript**: 为JavaScript添加静态类型定义
- **Material-UI**: React UI组件库，提供了符合Material Design规范的组件
- **Zustand**: 轻量级状态管理库
- **React Router**: 用于处理路由的库
- **Chart.js**: 用于数据可视化的库
- **Vite**: 现代化的前端构建工具

## 3. 项目结构

```
todo_web/
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── assets/             # 图片、图标等资源
│   ├── components/         # 组件
│   │   ├── layout/         # 布局组件
│   │   ├── tasks/          # 任务相关组件
│   │   ├── goals/          # 目标相关组件
│   │   ├── pomodoro/       # 番茄钟相关组件
│   │   ├── stats/          # 统计分析相关组件
│   │   └── ui/             # 通用UI组件
│   ├── docs/               # 项目文档
│   ├── hooks/              # 自定义React Hooks
│   ├── models/             # 类型定义
│   ├── pages/              # 页面组件
│   ├── store/              # 状态管理
│   ├── theme/              # 主题配置
│   ├── utils/              # 工具函数
│   ├── App.tsx             # 应用入口组件
│   ├── main.tsx            # 应用渲染入口
│   └── style.css           # 全局样式
├── .eslintrc.js            # ESLint配置
├── .gitignore              # Git忽略文件
├── index.html              # HTML模板
├── package.json            # 项目依赖和脚本
├── tsconfig.json           # TypeScript配置
└── vite.config.ts          # Vite配置
```

## 4. 架构设计

### 4.1 整体架构

项目采用了分层架构设计，主要分为以下几层：

1. **表现层（UI层）**：包含React组件，负责渲染用户界面
2. **状态管理层**：使用Zustand管理应用状态
3. **服务层**：处理业务逻辑和数据操作
4. **数据持久化层**：负责数据的本地存储和加载

### 4.2 组件架构

组件按照功能和职责进行划分，主要包括：

- **布局组件**：提供应用的整体布局结构
- **页面组件**：对应不同的路由页面
- **功能组件**：实现特定功能的组件，如任务列表、番茄钟等
- **UI组件**：可复用的通用UI组件

组件之间通过属性传递和状态管理进行通信。

### 4.3 状态管理架构

使用Zustand进行状态管理，按照功能模块划分为多个独立的store：

- **taskStore**: 管理任务相关状态
- **goalStore**: 管理目标相关状态
- **pomodoroStore**: 管理番茄钟相关状态
- **settingsStore**: 管理应用设置
- **statsStore**: 管理统计数据

每个store负责管理自己领域内的状态和操作，保持高内聚低耦合。

### 4.4 数据流架构

应用采用单向数据流设计：

1. 用户操作触发事件
2. 事件处理函数调用store中的方法
3. store更新状态
4. 组件订阅状态变化并重新渲染

这种设计使得数据流向清晰，便于调试和维护。

## 5. 核心模块详解

### 5.1 任务管理模块

**主要文件**：
- `src/store/taskStore.ts`: 任务状态管理
- `src/components/tasks/`: 任务相关组件
- `src/models/types.ts`: 任务类型定义

**功能**：
- 任务的创建、编辑、删除
- 任务状态管理（待办、进行中、已完成、已取消）
- 任务过滤和排序
- 任务优先级管理

**数据流**：
1. 用户通过TaskForm组件创建或编辑任务
2. 表单提交时调用taskStore中的addTask或updateTask方法
3. taskStore更新状态并将数据保存到本地存储
4. TaskList组件订阅taskStore中的任务列表并重新渲染

### 5.2 目标管理模块

**主要文件**：
- `src/store/goalStore.ts`: 目标状态管理
- `src/components/goals/`: 目标相关组件

**功能**：
- 长期目标的设置和跟踪
- 目标与任务的关联
- 目标完成度的计算和展示

### 5.3 番茄钟模块

**主要文件**：
- `src/store/pomodoroStore.ts`: 番茄钟状态管理
- `src/components/pomodoro/`: 番茄钟相关组件

**功能**：
- 工作和休息时间的计时
- 番茄钟设置的自定义
- 番茄钟记录的统计

**工作流程**：
1. 用户设置番茄钟参数（工作时长、休息时长等）
2. 用户启动番茄钟
3. 计时器开始倒计时，并在工作和休息时间之间切换
4. 每个完成的番茄钟周期被记录下来用于统计

### 5.4 统计分析模块

**主要文件**：
- `src/store/statsStore.ts`: 统计数据管理
- `src/components/stats/`: 统计相关组件

**功能**：
- 任务完成情况统计
- 番茄钟使用情况统计
- 数据可视化展示

### 5.5 设置模块

**主要文件**：
- `src/store/settingsStore.ts`: 设置状态管理
- `src/components/settings/`: 设置相关组件

**功能**：
- 应用主题设置
- 番茄钟参数设置
- 通知设置
- 数据导入/导出

## 6. 数据持久化

应用使用浏览器的localStorage进行数据持久化，主要通过以下方式实现：

1. 在store初始化时，从localStorage加载数据
2. 当store状态发生变化时，将数据保存到localStorage
3. 使用自定义hook封装localStorage操作，提供统一的接口

**示例代码**：

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 从localStorage获取初始值
  const readValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 更新localStorage和状态
  const setValue = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
```

## 7. 路由设计

应用使用React Router进行路由管理，主要路由包括：

- `/`: 首页/仪表盘
- `/tasks`: 任务管理页面
- `/goals`: 目标管理页面
- `/pomodoro`: 番茄钟页面
- `/stats`: 统计分析页面
- `/settings`: 设置页面

路由配置在`App.tsx`中定义：

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/tasks" element={<TasksPage />} />
    <Route path="/goals" element={<GoalsPage />} />
    <Route path="/pomodoro" element={<PomodoroPage />} />
    <Route path="/stats" element={<StatsPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes>
</BrowserRouter>
```

## 8. 主题设计

应用使用Material-UI的主题系统进行样式管理，支持亮色和暗色主题切换。

**主要文件**：
- `src/theme/theme.ts`: 主题配置

**示例代码**：

```typescript
// src/theme/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

// 亮色主题配置
const lightThemeOptions: ThemeOptions = {
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
};

// 暗色主题配置
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#7986cb',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
  },
};

// 创建主题
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
```

## 9. 性能优化

应用采用了多种性能优化策略：

1. **代码分割**：使用React.lazy和Suspense进行组件懒加载
2. **组件优化**：使用React.memo、useCallback和useMemo减少不必要的渲染
3. **虚拟化列表**：对长列表使用虚拟化技术减少DOM节点数量
4. **状态选择器**：在Zustand中使用选择器只订阅需要的状态部分

**示例代码**：

```typescript
// 组件懒加载
const StatsPage = React.lazy(() => import('./pages/StatsPage'));

// 组件优化
const TaskItem = React.memo(({ task, onUpdate }) => {
  const handleStatusChange = useCallback((status) => {
    onUpdate(task.id, { status });
  }, [task.id, onUpdate]);
  
  // 组件内容
});

// 状态选择器
const tasks = useTaskStore(state => state.tasks);
const completedTasks = useTaskStore(state => 
  state.tasks.filter(task => task.status === 'completed')
);
```

## 10. 扩展性设计

应用的架构设计考虑了未来的扩展性：

1. **模块化设计**：功能按模块划分，便于添加新功能
2. **插件化**：核心功能和扩展功能分离
3. **配置化**：通过配置文件控制功能的启用和禁用
4. **API抽象**：数据操作通过抽象接口进行，便于切换数据源

## 11. 开发指南

### 11.1 添加新功能

添加新功能的一般步骤：

1. 在`models/types.ts`中定义相关类型
2. 在`store`目录下创建新的状态管理文件
3. 在`components`目录下创建相关组件
4. 在`pages`目录下创建新的页面组件（如需要）
5. 在`App.tsx`中添加新的路由（如需要）

### 11.2 修改现有功能

修改现有功能时，需要注意：

1. 保持数据流的单向性
2. 避免组件之间的直接依赖
3. 使用状态管理进行组件通信
4. 保持组件的纯函数特性

### 11.3 调试技巧

1. 使用React DevTools查看组件结构和属性
2. 使用Redux DevTools查看状态变化（需要安装Zustand中间件）
3. 使用浏览器控制台查看日志和错误
4. 使用断点调试复杂逻辑

## 12. 总结

TODO应用采用了现代化的前端架构设计，通过组件化、状态管理分离、单向数据流等技术手段，实现了一个功能完善、易于维护和扩展的应用。该架构适合中小型前端项目，可以作为类似应用的参考模板。

通过理解本文档中描述的架构设计，初学者可以更好地理解项目的整体结构和各部分之间的关系，为后续的学习和修改打下基础。