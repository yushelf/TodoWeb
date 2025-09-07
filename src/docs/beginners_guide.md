# TODO应用初学者指南

欢迎来到TODO应用开发学习！本指南专为初学者设计，帮助你快速了解项目并开始进行修改和开发。

## 1. 项目概述

TODO应用是一款基于现代Web技术开发的任务管理工具，结合了《高效能人士的七个习惯》和《番茄钟工作法》的核心理念，帮助用户高效管理日常任务和目标。

### 核心功能

- **任务管理**：创建、编辑和删除任务，四象限分类法
- **目标管理**：设定和跟踪长期、中期和短期目标
- **番茄钟**：科学的时间管理方法
- **数据统计**：任务完成情况和工作效率分析

## 2. 技术栈简介

本项目使用以下技术：

- **React**：用于构建用户界面的JavaScript库
- **TypeScript**：JavaScript的超集，添加了类型系统
- **Material-UI**：React UI组件库，实现了Material Design
- **Zustand**：轻量级状态管理库
- **React Router**：处理应用内导航
- **Chart.js**：数据可视化库
- **Vite**：现代前端构建工具

## 3. 开发环境设置

### 前提条件

- 安装 [Node.js](https://nodejs.org/) (推荐v16.0.0或更高版本)
- 安装 [Git](https://git-scm.com/)
- 推荐使用 [Visual Studio Code](https://code.visualstudio.com/) 作为代码编辑器

### 设置步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/todo_web.git
   cd todo_web
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   应用将在 http://localhost:5173 运行

4. **构建生产版本**
   ```bash
   npm run build
   ```

## 4. 项目结构一览

```
/todo_web
├── src/                    # 源代码目录
│   ├── assets/             # 静态资源
│   ├── components/         # 可复用组件
│   │   ├── ui/             # 通用UI组件
│   │   ├── tasks/          # 任务相关组件
│   │   ├── goals/          # 目标相关组件
│   │   └── pomodoro/       # 番茄钟相关组件
│   ├── contexts/           # React上下文
│   ├── docs/               # 项目文档
│   ├── hooks/              # 自定义钩子
│   ├── models/             # 数据模型定义
│   ├── pages/              # 页面组件
│   ├── services/           # 服务层
│   ├── store/              # 状态管理
│   ├── theme/              # 主题配置
│   └── utils/              # 工具函数
├── public/                 # 静态资源
└── ...                     # 配置文件等
```

## 5. 关键文件说明

- **`src/App.tsx`**：应用入口，包含路由配置
- **`src/main.tsx`**：React渲染入口
- **`src/models/types.ts`**：数据类型定义
- **`src/store/*.ts`**：状态管理文件
- **`src/pages/*.tsx`**：各功能页面
- **`src/components/ui/CollapsibleDiv.tsx`**：可折叠组件示例

## 6. 常见修改场景

### 场景一：修改现有组件样式

1. 找到对应组件文件（通常在`src/components`目录下）
2. 修改组件中的样式定义（使用Material-UI的`sx`属性或样式组件）

**示例**：修改`CollapsibleDiv`组件的样式

```tsx
// 找到 src/components/ui/CollapsibleDiv.tsx
// 修改样式部分
<Box sx={{ 
  border: '1px solid #e0e0e0',
  borderRadius: '8px',  // 修改为更圆润的边角
  marginBottom: '16px', // 增加底部间距
  backgroundColor: '#f9f9f9' // 修改背景色
}}>
```

### 场景二：添加新页面

1. 在`src/pages`目录下创建新页面组件
2. 在`src/App.tsx`中添加路由配置
3. 在`src/components/layout/AppLayout.tsx`中添加导航菜单项

**示例**：添加新页面

```tsx
// 1. 创建页面组件 src/pages/NewPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const NewPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4">新页面</Typography>
      <Typography>这是一个新页面的内容</Typography>
    </Box>
  );
};

export default NewPage;

// 2. 在App.tsx中添加路由
// 在懒加载部分添加
const NewPage = lazy(() => import('./pages/NewPage'));

// 在路由配置部分添加
<Route path="/new-page" element={<NewPage />} />

// 3. 在AppLayout.tsx中添加菜单项
// 在menuItems数组中添加
{
  text: '新页面',
  icon: <SomeIcon />,
  path: '/new-page'
}
```

### 场景三：添加新功能到现有组件

1. 确定要修改的组件
2. 添加新的状态和处理函数
3. 更新UI以反映新功能

**示例**：为任务添加优先级标记功能

```tsx
// 在 src/models/types.ts 中添加优先级类型
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  // 现有属性
  id: string;
  title: string;
  // 添加新属性
  priority: TaskPriority;
}

// 在 src/components/tasks/TaskItem.tsx 中显示优先级
const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'high': return 'error.main';
    case 'medium': return 'warning.main';
    case 'low': return 'success.main';
    default: return 'text.secondary';
  }
};

// 在任务项中添加优先级标记
<Box sx={{ display: 'flex', alignItems: 'center' }}>
  <CircleIcon 
    sx={{ 
      color: getPriorityColor(task.priority),
      fontSize: '12px',
      marginRight: '8px'
    }} 
  />
  <Typography>{task.title}</Typography>
</Box>
```

## 7. 状态管理入门

本项目使用Zustand进行状态管理，它比Redux更简单直观。

### 基本概念

- **Store**：存储应用状态的容器
- **Actions**：修改状态的函数

### 如何使用现有Store

```tsx
import { useTaskStore } from '../store/taskStore';

const MyComponent = () => {
  // 获取状态
  const tasks = useTaskStore(state => state.tasks);
  // 获取操作函数
  const addTask = useTaskStore(state => state.addTask);
  
  return (
    <div>
      <button onClick={() => addTask({ title: '新任务', status: 'pending' })}>添加任务</button>
      {tasks.map(task => <div key={task.id}>{task.title}</div>)}
    </div>
  );
};
```

### 如何创建新Store

```tsx
// src/store/newStore.ts
import { create } from 'zustand';

interface NewState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useNewStore = create<NewState>((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
}));
```

## 8. 组件开发指南

### 创建新组件的步骤

1. 在适当的目录下创建组件文件（如`src/components/ui/MyComponent.tsx`）
2. 定义组件props接口
3. 实现组件逻辑和UI
4. 导出组件

### 组件模板

```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

// 定义props接口
interface MyComponentProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

// 创建组件
const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  description = '默认描述', // 默认值
  onClick 
}) => {
  return (
    <Box 
      sx={{ padding: 2, border: '1px solid #ddd' }}
      onClick={onClick}
    >
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2">{description}</Typography>
    </Box>
  );
};

export default MyComponent;
```

## 9. 学习路径建议

### 初级阶段（1-2周）

1. **熟悉项目结构**：浏览代码，了解各文件的作用
2. **修改简单UI**：调整颜色、间距、文本等
3. **添加小功能**：如为组件添加新属性或事件处理

### 中级阶段（2-4周）

1. **创建新组件**：设计并实现自己的UI组件
2. **添加新页面**：创建新的功能页面并添加到路由
3. **使用状态管理**：学习使用Zustand管理应用状态

### 高级阶段（1个月以上）

1. **重构现有功能**：优化代码结构和性能
2. **添加复杂功能**：如数据可视化、拖拽排序等
3. **集成外部API**：与后端服务或第三方API交互

## 10. 常见问题解答

### Q: 如何调试React组件？

**A**: 使用React Developer Tools浏览器扩展，或在代码中使用`console.log`打印状态和props。

### Q: 如何添加新的依赖包？

**A**: 使用npm安装：`npm install package-name`，然后在代码中导入使用。

### Q: 如何处理TypeScript类型错误？

**A**: 确保正确定义接口和类型，使用类型断言（`as Type`）或可选链操作符（`?.`）处理可能的空值。

### Q: 如何测试我的修改？

**A**: 运行开发服务器（`npm run dev`），在浏览器中测试功能，确保没有控制台错误。

## 11. 实用资源

### 官方文档

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Material-UI 文档](https://mui.com/material-ui/)
- [Zustand 文档](https://github.com/pmndrs/zustand)

### 学习资源

- [React TypeScript 备忘单](https://github.com/typescript-cheatsheets/react)
- [React Hooks 完整指南](https://www.valentinog.com/blog/hooks/)
- [Material-UI 组件示例](https://mui.com/material-ui/getting-started/templates/)

## 12. 贡献指南

我们欢迎你的贡献！请参考项目根目录的`CONTRIBUTING.md`文件了解详细的贡献流程。

基本步骤：

1. Fork项目仓库
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 祝你学习愉快！

记住，学习编程最好的方式是动手实践。不要害怕犯错，每个错误都是学习的机会。如果遇到困难，可以查阅项目文档或向社区寻求帮助。

加油！🚀