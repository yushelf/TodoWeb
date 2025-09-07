# 贡献指南

感谢您考虑为TODO应用做出贡献！以下是参与本项目开发的指南。

## 开发环境设置

1. Fork本仓库
2. 克隆您的Fork到本地机器：
   ```bash
   git clone https://github.com/您的用户名/todo_web.git
   cd todo_web
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 创建一个新分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 代码规范

### 通用规范

- 使用TypeScript编写所有代码
- 遵循ESLint和Prettier配置的代码风格
- 保持代码简洁、可读性高
- 为所有函数和复杂逻辑添加注释

### React组件规范

- 使用函数组件和React Hooks
- 组件文件名使用PascalCase命名法
- 组件应该是小型、专注于单一职责的
- 使用TypeScript接口定义组件props
- 避免过度使用内联样式，优先使用MUI的样式系统

### 状态管理规范

- 使用Zustand进行全局状态管理
- 将相关状态和操作组织在同一个store中
- 避免在组件中直接修改store状态，应通过store提供的操作函数

## 提交规范

### 提交消息格式

提交消息应遵循以下格式：

```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

### 类型

- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档更改
- **style**: 不影响代码含义的更改（空格、格式化、缺少分号等）
- **refactor**: 既不修复bug也不添加功能的代码更改
- **perf**: 提高性能的代码更改
- **test**: 添加缺失的测试或更正现有测试
- **chore**: 对构建过程或辅助工具和库的更改

### 范围

范围应该是受影响的模块名称：

- **task**: 任务管理相关
- **goal**: 目标管理相关
- **pomodoro**: 番茄钟相关
- **stats**: 统计分析相关
- **ui**: 用户界面相关
- **auth**: 认证相关
- **data**: 数据管理相关

### 示例

```
feat(task): 添加任务拖拽排序功能

实现了任务列表中的拖拽排序功能，使用react-beautiful-dnd库。
添加了任务位置持久化存储。

Resolves: #123
```

## 分支策略

- **main**: 稳定的生产分支
- **develop**: 开发分支，所有功能分支都从这里分出
- **feature/xxx**: 新功能分支
- **bugfix/xxx**: 修复bug的分支
- **hotfix/xxx**: 紧急修复生产环境问题的分支

## Pull Request流程

1. 确保您的分支与最新的develop分支同步
2. 运行测试确保所有测试通过：`npm test`
3. 运行代码检查：`npm run lint`
4. 提交Pull Request到develop分支
5. 在PR描述中详细说明您的更改
6. 等待代码审查
7. 根据反馈进行必要的修改
8. 一旦获得批准，您的PR将被合并

## 测试指南

- 为所有新功能和修复编写测试
- 单元测试使用Jest和React Testing Library
- 确保测试覆盖率不低于当前水平
- 运行测试：`npm test`

## 文档

- 更新相关文档以反映您的更改
- 为新功能添加使用示例
- 更新CHANGELOG.md（如果适用）

## 问题报告

如果您发现了bug或有功能请求，请创建一个issue，并使用提供的模板填写必要的信息。

## 行为准则

请参阅[行为准则](CODE_OF_CONDUCT.md)了解参与本项目的行为准则。

## 许可证

通过贡献您的代码，您同意您的贡献将根据项目的[MIT许可证](LICENSE)进行许可。