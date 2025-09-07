/**
 * 核心数据模型定义
 * 基于《高效能人士的七个习惯》和《番茄钟工作法》
 */

// 用户模型
export interface User {
  id: string;
  username: string;
  preferences: UserPreferences;
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark';
  pomodoroSettings: PomodoroSettings;
  notificationSettings: NotificationSettings;
}

// 番茄钟设置
export interface PomodoroSettings {
  workDuration: number; // 工作时长（分钟）
  shortBreakDuration: number; // 短休息时长（分钟）
  longBreakDuration: number; // 长休息时长（分钟）
  longBreakInterval: number; // 多少个番茄后长休息
  autoStartBreaks: boolean; // 自动开始休息
  autoStartPomodoros: boolean; // 休息后自动开始下一个番茄
}

// 通知设置
export interface NotificationSettings {
  taskReminders: boolean;
  pomodoroAlerts: boolean;
  goalReviewReminders: boolean;
  playSound: boolean;
  sound: string;
  pomodoroEnd: boolean;
  breakEnd: boolean;
}

// 目标状态类型
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';

// 目标模型（以终为始）
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string; // 生活角色类别，如职业发展、家庭、健康等
  type: 'long-term' | 'mid-term' | 'short-term'; // 目标类型
  status: GoalStatus; // 目标状态
  progress: number; // 进度百分比 0-100
  createdAt: Date;
  targetDate?: Date; // 目标完成日期
  completedAt?: Date; // 实际完成日期
  parentGoalId?: string; // 父目标ID，用于目标分解
  tasks: string[]; // 关联的任务ID列表
  pomodorosEstimated?: number; // 预估所需番茄数
  pomodorosSpent: number; // 已花费番茄数
}

// 任务状态类型
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';

// 任务优先级类型
export type TaskPriority = 'high' | 'medium' | 'low';

// 任务象限类型
export type TaskQuadrant = 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent';

// 任务模型（要事第一）
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  quadrant: TaskQuadrant; // 四象限法则：1-重要且紧急，2-重要不紧急，3-紧急不重要，4-不紧急不重要
  goalId?: string; // 关联的目标ID
  dueDate?: Date; // 截止日期
  createdAt: Date;
  completedAt?: Date;
  pomodorosEstimated?: number; // 预估所需番茄数
  pomodorosSpent: number; // 已花费番茄数
  recurrence?: TaskRecurrence; // 重复设置
  tags: string[]; // 标签
}

// 任务重复设置
export interface TaskRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // 间隔，如每2天、每3周等
  endDate?: Date; // 重复结束日期
  daysOfWeek?: number[]; // 每周几重复（0-6，0代表周日）
  dayOfMonth?: number; // 每月几号重复
}

// 番茄钟记录
export interface PomodoroRecord {
  id: string;
  taskId?: string; // 关联的任务ID
  startTime: Date;
  endTime: Date;
  completed: boolean; // 是否完成（未中断）
  notes: string; // 番茄期间的笔记
  interruptions: Interruption[]; // 中断记录
}

// 中断记录
export interface Interruption {
  id: string;
  time: Date;
  reason: string;
  type: 'internal' | 'external'; // 内部中断（自己分心）或外部中断（他人打扰）
}

// 统计数据
export interface Statistics {
  dailyPomodoros: DailyPomodoroStats[];
  taskCompletion: TaskCompletionStats;
  goalProgress: GoalProgressStats;
  focusMetrics: FocusMetrics;
}

// 每日番茄统计
export interface DailyPomodoroStats {
  date: Date;
  totalPomodoros: number;
  completedPomodoros: number;
  interruptedPomodoros: number;
  totalFocusTime: number; // 总专注时间（分钟）
  byQuadrant: Record<string, number>; // 按四象限统计的番茄数
  byGoalCategory: Record<string, number>; // 按目标类别统计的番茄数
}

// 任务完成统计
export interface TaskCompletionStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 完成率
  averagePomodorosPerTask: number; // 每任务平均番茄数
  byQuadrant: Record<string, TaskQuadrantStats>; // 按四象限统计
}

// 四象限任务统计
export interface TaskQuadrantStats {
  total: number;
  completed: number;
  completionRate: number;
}

// 目标进度统计
export interface GoalProgressStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  byCategory: Record<string, GoalCategoryStats>; // 按目标类别统计
}

// 目标类别统计
export interface GoalCategoryStats {
  total: number;
  completed: number;
  averageProgress: number; // 平均进度
}

// 专注度指标
export interface FocusMetrics {
  averageFocusTime: number; // 平均专注时间（分钟）
  longestFocusStreak: number; // 最长连续专注时间（分钟）
  interruptionRate: number; // 中断率
  mostProductiveTimeOfDay: string; // 最高效时段
  mostProductiveDayOfWeek: number; // 最高效工作日（0-6）
}