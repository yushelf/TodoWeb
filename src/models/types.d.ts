// 临时类型定义文件，用于解决导出问题

// 从types.ts重新导出所有类型
export * from './types';

// 明确导出Goal接口
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'long-term' | 'mid-term' | 'short-term';
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdAt: Date;
  targetDate?: Date;
}

// 明确导出Task接口
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  quadrant: 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  goalId?: string;
  pomodorosEstimated?: number;
  pomodorosSpent: number;
  createdAt: Date;
  tags: string[];
}