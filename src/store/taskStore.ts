import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// 内联定义Task接口
interface Task {
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
import { useGoalStore } from './goalStore';

// 任务状态接口
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

// 创建任务状态存储
export const useTaskStore = create<TaskState>(
  persist(
    (set, get) => ({
      tasks: [],
      
      // 添加新任务
      addTask: (taskData) => {
        const id = uuidv4();
        const newTask: Task = {
          ...taskData,
          id,
          createdAt: new Date(),
          status: 'not_started',
          pomodorosSpent: 0,
          tags: taskData.tags || [],
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        // 如果任务关联了目标，将任务ID添加到目标中
        if (taskData.goalId) {
          useGoalStore.getState().addTaskToGoal(taskData.goalId, id);
        }
        
        return id;
      },
      
      // 更新任务
      updateTask: (id, updates) => {
        const currentTask = get().getTaskById(id);
        
        // 如果目标ID发生变化，需要更新目标关联
        if (currentTask && updates.goalId !== undefined && updates.goalId !== currentTask.goalId) {
          // 从旧目标中移除任务
          if (currentTask.goalId) {
            useGoalStore.getState().removeTaskFromGoal(currentTask.goalId, id);
          }
          
          // 添加到新目标
          if (updates.goalId) {
            useGoalStore.getState().addTaskToGoal(updates.goalId, id);
          }
        }
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },
      
      // 删除任务
      deleteTask: (id) => {
        console.log('%c开始执行deleteTask函数', 'color: blue; font-weight: bold', { taskId: id });
        
        if (!id) {
          console.error('%cdeleteTask失败: 无效的任务ID', 'color: red; font-weight: bold');
          return;
        }
        
        const task = get().getTaskById(id);
        console.log('%c查找到的任务', 'color: blue', { task, exists: !!task });
        
        if (!task) {
          console.error('%cdeleteTask失败: 找不到指定ID的任务', 'color: red; font-weight: bold', { taskId: id });
          return;
        }
        
        try {
          // 如果任务关联了目标，从目标中移除任务ID
          if (task?.goalId) {
            console.log('%c从目标中移除任务', 'color: blue', { goalId: task.goalId, taskId: id });
            useGoalStore.getState().removeTaskFromGoal(task.goalId, id);
          }
          
          // 记录删除前的任务数量
          const beforeCount = get().tasks.length;
          
          // 执行删除操作
          set((state) => {
            const newTasks = state.tasks.filter((t) => t.id !== id);
            console.log('%c过滤后的任务列表', 'color: blue', { 
              beforeCount, 
              afterCount: newTasks.length,
              removed: beforeCount - newTasks.length === 1 ? '成功' : '失败'
            });
            return { tasks: newTasks };
          });
          
          // 检查删除后的状态
          setTimeout(() => {
            const afterDelete = get().getTaskById(id);
            console.log('%c删除后检查任务是否存在', 'color: blue', { 
              taskId: id, 
              stillExists: !!afterDelete,
              currentTasksCount: get().tasks.length
            });
          }, 500);
          
          console.log('%cdeleteTask函数执行完成', 'color: green; font-weight: bold');
        } catch (error) {
          console.error('%cdeleteTask执行出错:', 'color: red; background: yellow', error);
        }
      },
      
      // 开始任务
      startTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, status: 'in_progress' } : task
        ),
      })),
      
      // 完成任务
      completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, status: 'completed', completedAt: new Date() }
            : task
        ),
      })),
      
      // 取消任务
      cancelTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, status: 'cancelled' } : task
        ),
      })),
      
      // 增加任务已花费的番茄数
      incrementPomodorosSpent: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, pomodorosSpent: task.pomodorosSpent + 1 }
              : task
          ),
        }));
        
        // 同时更新关联目标的番茄数
        const task = get().getTaskById(id);
        if (task?.goalId) {
          useGoalStore.getState().incrementPomodorosSpent(task.goalId);
        }
      },
      
      // 添加标签
      addTag: (id, tag) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id && !task.tags.includes(tag)
            ? { ...task, tags: [...task.tags, tag] }
            : task
        ),
      })),
      
      // 移除标签
      removeTag: (id, tag) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, tags: task.tags.filter((t) => t !== tag) }
            : task
        ),
      })),
      
      // 通过ID获取任务
      getTaskById: (id) => get().tasks.find((task) => task.id === id),
      
      // 通过象限获取任务
      getTasksByQuadrant: (quadrant) =>
        get().tasks.filter((task) => task.quadrant === quadrant),
      
      // 通过优先级获取任务
      getTasksByPriority: (priority) =>
        get().tasks.filter((task) => task.priority === priority),
      
      // 通过目标获取任务
      getTasksByGoal: (goalId) =>
        get().tasks.filter((task) => task.goalId === goalId),
      
      // 通过状态获取任务
      getTasksByStatus: (status) =>
        get().tasks.filter((task) => task.status === status),
      
      // 通过标签获取任务
      getTasksByTag: (tag) =>
        get().tasks.filter((task) => task.tags.includes(tag)),
      
      // 获取今天到期的任务
      getTasksDueToday: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return get().tasks.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        });
      },
      
      // 获取本周到期的任务
      getTasksDueThisWeek: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        
        return get().tasks.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate < endOfWeek;
        });
      },
      
      // 获取已逾期的任务
      getOverdueTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return get().tasks.filter((task) => {
          if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < today;
        });
      },
      
      // 获取今日任务（包括今天到期和今天开始的任务）
      getTodayTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return get().tasks.filter((task) => {
          if (task.status === 'completed' || task.status === 'cancelled') return false;
          
          // 今天到期的任务
          if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            if (dueDate >= today && dueDate < tomorrow) return true;
          }
          
          return false;
        });
      },
      
      // 获取即将到期的任务（未来7天内到期，不包括今天）
      getUpcomingTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return get().tasks.filter((task) => {
          if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= tomorrow && dueDate <= nextWeek;
        });
      },
    }),
    {
      name: 'tasks-storage', // localStorage 的键名
      storage: {
        getItem: (name) => {
          try {
            console.log(`%c尝试从localStorage获取${name}`, 'color: blue');
            const value = localStorage.getItem(name);
            console.log(`%c获取到的${name}原始值:`, 'color: blue', value);
            return value;
          } catch (error) {
            console.log(`%c从localStorage获取${name}遇到问题，进行静默处理`, 'color: orange');
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            console.log(`%c尝试设置localStorage ${name}:`, 'color: green', value);
            localStorage.setItem(name, value);
            console.log(`%c成功设置localStorage ${name}`, 'color: green');
          } catch (error) {
            console.log(`%c设置localStorage ${name}遇到问题，进行静默处理`, 'color: orange');
          }
        },
        removeItem: (name) => {
          try {
            console.log(`%c尝试删除localStorage ${name}`, 'color: orange');
            localStorage.removeItem(name);
            console.log(`%c成功删除localStorage ${name}`, 'color: orange');
          } catch (error) {
            console.log(`%c删除localStorage ${name}遇到问题，进行静默处理`, 'color: orange');
          }
        }
      },
      serialize: (state) => {
        try {
          // 深拷贝状态，处理Date对象
          const processedState = JSON.parse(JSON.stringify(state, (key, value) => {
            // 处理Date对象
            if (value instanceof Date) {
              return { __isDate: true, iso: value.toISOString() };
            }
            return value;
          }));
          
          console.log('%c序列化前的状态:', 'color: purple', state);
          console.log('%c处理后的状态:', 'color: purple', processedState);
          
          const serialized = JSON.stringify(processedState);
          console.log('%c序列化后的字符串:', 'color: purple', serialized);
          return serialized;
        } catch (error) {
          console.log('%c序列化状态遇到问题，进行静默处理', 'color: orange');
          return '{}';
        }
      },
      deserialize: (str) => {
        try {
          console.log('%c尝试反序列化', 'color: blue');
          
          // 检查输入是否为字符串
          if (typeof str !== 'string') {
            console.log('%c输入不是字符串，使用默认状态', 'color: orange');
            localStorage.removeItem('tasks-storage');
            return {};
          }
          
          // 尝试解析JSON
          const parsed = JSON.parse(str, (key, value) => {
            // 恢复Date对象
            if (value && value.__isDate && value.iso) {
              return new Date(value.iso);
            }
            return value;
          });
          
          console.log('%c反序列化完成', 'color: blue');
          return parsed;
        } catch (error) {
          console.log('%c反序列化遇到问题，使用默认状态', 'color: orange');
          localStorage.removeItem('tasks-storage');
          return {};
        }
      },
      merge: (persistedState, currentState) => {
        try {
          console.log('%c合并状态', 'color: green');
          
          // 检查持久化状态是否有效
          if (!persistedState || typeof persistedState !== 'object') {
            console.log('%c使用默认状态', 'color: orange');
            return currentState;
          }
          
          // 检查tasks是否为数组
          if (!Array.isArray(persistedState.tasks)) {
            console.log('%c持久化状态中的tasks格式不正确，使用默认状态', 'color: orange');
            return currentState;
          }
          
          // 过滤无效的任务对象
          const validTasks = persistedState.tasks.filter(task => 
            task && typeof task === 'object' && task.id
          );
          
          const mergedState = {
            ...currentState,
            tasks: validTasks
          };
          
          console.log('%c合并完成', 'color: green');
          return mergedState;
        } catch (error) {
          console.log('%c合并状态遇到问题，使用默认状态', 'color: orange');
          return currentState;
        }
      },
      onRehydrateStorage: (state) => {
        return (err, newState) => {
          if (err) {
            // 静默处理错误，不显示错误提示
            console.log('%c状态恢复遇到问题，使用默认状态', 'color: orange');
          } else {
            console.log('%c状态已恢复', 'color: green');
          }
        };
      }
    }
  )
);