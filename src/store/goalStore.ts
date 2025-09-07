import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// 内联定义Goal接口
interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'long-term' | 'mid-term' | 'short-term';
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdAt: Date;
  targetDate?: Date;
  tasks?: string[];
  pomodorosSpent?: number;
}

// 目标状态接口
interface GoalState {
  goals: Goal[];
  
  // 目标管理方法
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'status' | 'tasks' | 'pomodorosSpent'>) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  abandonGoal: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  addTaskToGoal: (goalId: string, taskId: string) => void;
  removeTaskFromGoal: (goalId: string, taskId: string) => void;
  incrementPomodorosSpent: (goalId: string) => void;
  
  // 目标查询方法
  getGoalById: (id: string) => Goal | undefined;
  getGoalsByCategory: (category: string) => Goal[];
  getGoalsByType: (type: Goal['type']) => Goal[];
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  getChildGoals: (parentId: string) => Goal[];
}

// 创建目标状态存储
export const useGoalStore = create<GoalState>(
  persist(
    (set, get) => ({
      goals: [],
      
      // 添加新目标
      addGoal: (goalData) => {
        const id = uuidv4();
        set((state) => ({
          goals: [
            ...state.goals,
            {
              ...goalData,
              id,
              createdAt: new Date(),
              progress: 0,
              status: 'not_started' as const,
              tasks: [],
              pomodorosSpent: 0,
            },
          ],
        }));
        return id;
      },
      
      // 更新目标
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id ? { ...goal, ...updates } : goal
        ),
      })),
      
      // 删除目标
      deleteGoal: (id) => {
        console.log('%c开始删除目标，ID:', 'color: red; font-weight: bold', id);
        console.log('%c删除前的目标列表:', 'color: blue; font-weight: bold', JSON.stringify(useGoalStore.getState().goals, null, 2));
        
        try {
          // 检查目标是否存在
          const goalExists = useGoalStore.getState().goals.some(goal => goal.id === id);
          console.log('%c目标是否存在:', 'color: purple', goalExists);
          
          if (!goalExists) {
            console.log('%c尝试删除不存在的目标，进行静默处理:', 'color: orange', id);
            return;
          }
          
          // 更新状态
          set((state) => {
            // 先获取要删除的目标的索引
            const goalIndex = state.goals.findIndex((goal) => goal.id === id);
            console.log('%c要删除的目标索引:', 'color: green', goalIndex);
            
            if (goalIndex === -1) {
              console.log('%c在状态中找不到要删除的目标，进行静默处理:', 'color: orange', id);
              return state; // 不做任何更改
            }
          
            // 创建新的目标数组，排除要删除的目标
            const updatedGoals = [...state.goals.slice(0, goalIndex), ...state.goals.slice(goalIndex + 1)];
            console.log('%c过滤后的目标列表:', 'color: green; font-weight: bold', JSON.stringify(updatedGoals, null, 2));
            
            // 记录要删除的目标详情
            const goalToDelete = state.goals[goalIndex];
            console.log('%c要删除的目标详情:', 'color: orange', JSON.stringify(goalToDelete, null, 2));
            
            return { goals: updatedGoals };
          });
          
          // 确保状态已更新并持久化
          setTimeout(() => {
            const currentState = useGoalStore.getState();
            console.log('%c删除后的store状态:', 'color: blue; font-weight: bold', JSON.stringify(currentState.goals, null, 2));
            
            // 检查localStorage是否更新
            try {
              const storageKey = 'goals-storage';
              const storedData = localStorage.getItem(storageKey);
              console.log('%c最终localStorage数据:', 'color: purple; font-weight: bold', storedData);
              
              // 解析存储的数据进行检查
              if (storedData) {
                try {
                  const parsedData = JSON.parse(storedData);
                  console.log('%c解析后的localStorage数据:', 'color: purple', parsedData);
                  
                  // 检查目标是否真的被删除了
                  if (parsedData.state && Array.isArray(parsedData.state.goals)) {
                    const stillExists = parsedData.state.goals.some(goal => goal.id === id);
                    console.log('%c目标在localStorage中是否仍然存在:', 'color: red; font-weight: bold', stillExists);
                    
                    if (stillExists) {
                      console.log('%c目标在localStorage中仍然存在，尝试修复:', 'color: orange');
                      
                      // 尝试手动修复localStorage
                      parsedData.state.goals = parsedData.state.goals.filter(goal => goal.id !== id);
                      const updatedData = JSON.stringify(parsedData);
                      localStorage.setItem(storageKey, updatedData);
                      console.log('%c已手动修复localStorage数据', 'color: green');
                    }
                  }
                } catch (parseError) {
                  console.log('%c解析localStorage数据时遇到问题，进行静默处理', 'color: orange');
                  
                  // 尝试重置localStorage数据
                  localStorage.removeItem(storageKey);
                  console.log('%c已清除localStorage中的goals-storage数据', 'color: green');
                  
                  // 重新保存当前状态
                  const currentGoals = useGoalStore.getState().goals;
                  const newData = JSON.stringify({
                    state: { goals: currentGoals },
                    version: 0
                  });
                  localStorage.setItem(storageKey, newData);
                  console.log('%c已重新保存goals数据到localStorage', 'color: green');
                }
              }
            } catch (error) {
              console.log('%c读取localStorage遇到问题，进行静默处理', 'color: orange');
            }
          }, 500);
        } catch (error) {
          console.log('%c删除目标过程中遇到问题，进行静默处理:', 'color: orange', error);
        }
      },
      
      // 完成目标
      completeGoal: (id) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id
            ? { ...goal, status: 'completed', completedAt: new Date(), progress: 100 }
            : goal
        ),
      })),
      
      // 放弃目标
      abandonGoal: (id) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id ? { ...goal, status: 'cancelled' } : goal
        ),
      })),
      
      // 更新目标进度
      updateGoalProgress: (id, progress) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id ? { ...goal, progress: Math.max(0, Math.min(100, progress)) } : goal
        ),
      })),
      
      // 添加任务到目标
      addTaskToGoal: (goalId, taskId) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId && !goal.tasks.includes(taskId)
            ? { ...goal, tasks: [...goal.tasks, taskId] }
            : goal
        ),
      })),
      
      // 从目标中移除任务
      removeTaskFromGoal: (goalId, taskId) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, tasks: goal.tasks.filter((id) => id !== taskId) }
            : goal
        ),
      })),
      
      // 增加目标已花费的番茄数
      incrementPomodorosSpent: (goalId) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, pomodorosSpent: goal.pomodorosSpent + 1 }
            : goal
        ),
      })),
      
      // 通过ID获取目标
      getGoalById: (id) => get().goals.find((goal) => goal.id === id),
      
      // 通过类别获取目标
      getGoalsByCategory: (category) =>
        get().goals.filter((goal) => goal.category === category),
      
      // 通过类型获取目标
      getGoalsByType: (type) => get().goals.filter((goal) => goal.type === type),
      
      // 获取活跃目标
      getActiveGoals: () => get().goals.filter((goal) => goal.status === 'not_started' || goal.status === 'in_progress'),
      
      // 获取已完成目标
      getCompletedGoals: () =>
        get().goals.filter((goal) => goal.status === 'completed'),
      
      // 获取子目标
      getChildGoals: (parentId) =>
        get().goals.filter((goal) => goal.parentGoalId === parentId),
    }),
    {
      name: 'goals-storage', // localStorage 的键名
      storage: {
        getItem: (name) => {
          console.log('%c从localStorage获取数据:', 'color: blue; font-weight: bold', name);
          try {
            const value = localStorage.getItem(name);
            console.log('%c获取到的原始数据:', 'color: blue', typeof value === 'string' && value ? value.substring(0, 100) + '...' : value);
            return value;
          } catch (error) {
            console.log('%c从localStorage获取数据遇到问题，进行静默处理', 'color: orange');
            return null;
          }
        },
        setItem: (name, value) => {
          console.log('%c向localStorage写入数据:', 'color: green; font-weight: bold', name);
          console.log('%c写入的数据:', 'color: green', typeof value === 'string' && value ? value.substring(0, 100) + '...' : value);
          try {
            localStorage.setItem(name, value);
            console.log('%c数据写入localStorage成功', 'color: green');
          } catch (error) {
            console.log('%c向localStorage写入数据遇到问题，进行静默处理', 'color: orange');
          }
        },
        removeItem: (name) => {
          console.log('%c从localStorage删除数据:', 'color: red; font-weight: bold', name);
          try {
            localStorage.removeItem(name);
            console.log('%c数据从localStorage删除成功', 'color: green');
          } catch (error) {
            console.log('%c从localStorage删除数据遇到问题，进行静默处理', 'color: orange');
          }
        }
      },
      partialize: (state) => {
        console.log('%c partialize被调用，当前状态:', 'color: purple; font-weight: bold', JSON.stringify(state, null, 2));
        // 只持久化goals数组
        const result = { goals: state.goals };
        console.log('%c partialize结果:', 'color: purple', JSON.stringify(result, null, 2));
        return result;
      },
      serialize: (state) => {
        // 自定义序列化，处理Date对象
        console.log('%c serialize被调用，序列化前状态:', 'color: orange; font-weight: bold', JSON.stringify(state, (key, value) => {
          if (value instanceof Date) {
            return `[Date: ${value.toISOString()}]`;
          }
          return value;
        }, 2));
        
        try {
          // 创建一个深拷贝并预处理对象，确保所有内容都可以被序列化
          const processedState = JSON.parse(JSON.stringify(state, (key, value) => {
            // 处理Date对象
            if (value instanceof Date) {
              return { __isDate: true, value: value.toISOString() };
            }
            // 处理其他可能导致循环引用的对象
            if (typeof value === 'object' && value !== null) {
              // 如果是普通对象，直接返回
              return value;
            }
            return value;
          }));
          
          // 再次序列化处理后的状态
          const serialized = JSON.stringify(processedState);
          
          console.log('%c 序列化后数据:', 'color: orange', typeof serialized === 'string' && serialized ? serialized.substring(0, 100) + '...' : serialized);
          return serialized;
        } catch (error) {
          console.log('%c 序列化过程中遇到问题，进行静默处理', 'color: orange');
          // 返回一个空对象的序列化结果
          return JSON.stringify({});
        }
      },
      deserialize: (str) => {
        // 自定义反序列化，恢复Date对象
        console.log('%c deserialize被调用', 'color: blue; font-weight: bold');
        
        if (!str) {
          console.log('%c 输入字符串为空，使用默认状态', 'color: orange');
          return {};
        }
        
        // 检查输入是否为有效的JSON字符串
        if (typeof str !== 'string') {
          console.log('%c 输入不是字符串，使用默认状态', 'color: orange');
          return {};
        }
        
        try {
          // 尝试解析JSON字符串
          const parsed = JSON.parse(str, (key, value) => {
            // 恢复Date对象
            if (value && typeof value === 'object' && value.__isDate) {
              try {
                const dateObj = new Date(value.value);
                console.log(`%c 反序列化Date对象: ${key}:`, 'color: blue', value, '→', dateObj);
                return dateObj;
              } catch (dateError) {
                console.error(`%c 反序列化Date对象失败: ${key}:`, 'color: red', value, dateError);
                return null; // 如果Date解析失败，返回null
              }
            }
            return value;
          });
          
          console.log('%c 反序列化完成', 'color: blue');
          
          return parsed;
        } catch (error) {
          console.log('%c 反序列化遇到问题，使用默认状态', 'color: orange');
          // 静默清理localStorage中的数据
          try {
            localStorage.removeItem('goals-storage');
            console.log('%c 已清除localStorage中的goals-storage数据', 'color: green');
          } catch (storageError) {
            console.log('%c 清除localStorage遇到问题', 'color: orange');
          }
          return {};
        }
      },
      merge: (persistedState, currentState) => {
        console.log('%c merge被调用', 'color: purple');
        
        try {
          // 检查持久化状态的有效性
          if (!persistedState) {
            console.log('%c 使用默认状态', 'color: orange');
            return currentState;
          }
          
          // 安全地记录持久化状态
          try {
            console.log('%c 持久化的状态:', 'color: purple', JSON.stringify(persistedState, (key, value) => {
              if (value instanceof Date) {
                return `[Date: ${value.toISOString()}]`;
              }
              return value;
            }, 2));
          } catch (logError) {
            console.error('%c 无法记录持久化状态:', 'color: red', logError);
          }
          
          // 安全地记录当前状态
          try {
            console.log('%c 当前状态:', 'color: purple', JSON.stringify(currentState, (key, value) => {
              if (value instanceof Date) {
                return `[Date: ${value.toISOString()}]`;
              }
              return value;
            }, 2));
          } catch (logError) {
            console.error('%c 无法记录当前状态:', 'color: red', logError);
          }
          
          // 检查persistedState是否为有效对象
          if (typeof persistedState !== 'object' || persistedState === null) {
            console.log('%c 持久化状态格式不正确，使用默认状态', 'color: orange');
            return currentState;
          }
          
          // 检查goals是否为数组
          if (persistedState.goals && !Array.isArray(persistedState.goals)) {
            console.log('%c 持久化状态中的goals格式不正确，使用空数组', 'color: orange');
            persistedState.goals = [];
          }
          
          // 确保goals是数组并且每个元素都是有效的目标对象
          let validGoals = [];
          if (Array.isArray(persistedState?.goals)) {
            validGoals = persistedState.goals.filter(goal => {
              return goal && typeof goal === 'object' && typeof goal.id === 'string';
            });
            
            if (validGoals.length !== persistedState.goals.length) {
              console.log('%c 过滤了一些无效的目标对象', 'color: orange');
            }
          }
          
          // 创建合并后的状态
          const mergedState = {
            ...currentState,
            goals: validGoals,
          };
          
          // 安全地记录合并后的状态
          try {
            console.log('%c 合并后的状态:', 'color: purple; font-weight: bold', JSON.stringify(mergedState, (key, value) => {
              if (value instanceof Date) {
                return `[Date: ${value.toISOString()}]`;
              }
              return value;
            }, 2));
          } catch (logError) {
            console.error('%c 无法记录合并后的状态:', 'color: red', logError);
          }
          
          return mergedState;
        } catch (error) {
          console.log('%c 合并状态遇到问题，使用默认状态', 'color: orange');
          return currentState; // 出错时返回当前状态
        }
      },
      onRehydrateStorage: (state) => {
        // 静默记录状态恢复，不显示错误提示
        console.log('%c onRehydrateStorage被调用', 'color: green; font-weight: bold');
        
        return (rehydratedState, error) => {
          if (error) {
            // 静默处理错误，不显示错误提示
            console.log('%c 状态恢复遇到问题，使用默认状态', 'color: orange');
          } else {
            console.log('%c 状态已成功恢复', 'color: green; font-weight: bold');
          }
        };
      }
    }
  )
);