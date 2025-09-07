import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isEqual } from 'date-fns';

// 内联定义统计相关接口
interface DailyPomodoroStats {
  date: Date;
  totalPomodoros: number;
  completedPomodoros: number;
  interruptedPomodoros: number;
  totalFocusTime: number; // 分钟
  byQuadrant: Record<string, number>;
  byCategory: Record<string, number>;
}

interface TaskCompletionStats {
  totalTasks: number;
  completedTasks: number;
  byQuadrant: Record<string, number>;
  byPriority: Record<string, number>;
}

interface GoalProgressStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  byCategory: Record<string, number>;
}

interface FocusMetrics {
  averageFocusTime: number; // 每日平均专注时间（分钟）
  totalFocusTime: number; // 总专注时间（分钟）
  focusTrend: number[]; // 每日专注时间趋势
  dates: string[]; // 对应的日期
}

interface Statistics {
  daily: DailyPomodoroStats;
  weekly: DailyPomodoroStats[];
  taskCompletion: TaskCompletionStats;
  goalProgress: GoalProgressStats;
  focusMetrics: FocusMetrics;
}
import { usePomodoroStore } from './pomodoroStore';
import { useTaskStore } from './taskStore';
import { useGoalStore } from './goalStore';

// 统计数据状态接口
interface StatisticsState {
  // 生成统计数据
  generateDailyStats: (date: Date) => DailyPomodoroStats;
  generateWeeklyStats: (startDate: Date) => DailyPomodoroStats[];
  generateTaskCompletionStats: () => TaskCompletionStats;
  generateGoalProgressStats: () => GoalProgressStats;
  generateFocusMetrics: (days: number) => FocusMetrics;
  
  // 获取完整统计数据
  getStatistics: () => Statistics;
}

// 创建统计数据状态存储
export const useStatisticsStore = create<StatisticsState>(
  persist(
    (set, get) => ({
      // 生成每日番茄钟统计
      generateDailyStats: (date: Date) => {
        const pomodoroStore = usePomodoroStore.getState();
        const taskStore = useTaskStore.getState();
        
        // 获取指定日期的番茄钟记录
        const records = pomodoroStore.getRecordsByDate(date);
        
        // 计算总番茄数、完成番茄数、中断番茄数
        const totalPomodoros = records.length;
        const completedPomodoros = records.filter(record => record.completed).length;
        const interruptedPomodoros = totalPomodoros - completedPomodoros;
        
        // 计算总专注时间（分钟）
        const totalFocusTime = records.reduce((total, record) => {
          const duration = (record.endTime.getTime() - record.startTime.getTime()) / (1000 * 60);
          return total + duration;
        }, 0);
        
        // 按四象限统计番茄数
        const byQuadrant: Record<string, number> = { 
          'important_urgent': 0, 
          'important_not_urgent': 0, 
          'not_important_urgent': 0, 
          'not_important_not_urgent': 0 
        };
        
        // 按目标类别统计番茄数
        const byGoalCategory: Record<string, number> = {};
        
        // 遍历记录，统计四象限和目标类别
        records.forEach(record => {
          if (record.taskId) {
            const task = taskStore.getTaskById(record.taskId);
            if (task) {
              // 统计四象限
              byQuadrant[task.quadrant] = (byQuadrant[task.quadrant] || 0) + 1;
              
              // 统计目标类别
              if (task.goalId) {
                const goal = useGoalStore.getState().getGoalById(task.goalId);
                if (goal) {
                  byGoalCategory[goal.category] = (byGoalCategory[goal.category] || 0) + 1;
                }
              }
            }
          }
        });
        
        return {
          date,
          totalPomodoros,
          completedPomodoros,
          interruptedPomodoros,
          totalFocusTime,
          byQuadrant,
          byGoalCategory,
        };
      },
      
      // 生成每周番茄钟统计
      generateWeeklyStats: (startDate: Date) => {
        const start = startOfWeek(startDate, { weekStartsOn: 1 }); // 从周一开始
        const end = endOfWeek(startDate, { weekStartsOn: 1 }); // 到周日结束
        
        // 获取一周中的每一天
        const days = eachDayOfInterval({ start, end });
        
        // 为每天生成统计数据
        return days.map(day => get().generateDailyStats(day));
      },
      
      // 生成任务完成统计
      generateTaskCompletionStats: (startDate?: Date, endDate?: Date) => {
        try {
          const tasks = useTaskStore.getState().tasks;
          
          // 如果提供了日期范围，过滤在该范围内创建或完成的任务
          const filteredTasks = startDate && endDate
            ? tasks.filter(task => {
                const createdInRange = task.createdAt >= startDate && task.createdAt <= endDate;
                const completedInRange = task.completedAt && task.completedAt >= startDate && task.completedAt <= endDate;
                return createdInRange || completedInRange;
              })
            : tasks;
          
          // 计算总任务数和已完成任务数
          const totalTasks = filteredTasks.length;
          const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
          
          // 计算完成率
          const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
          
          // 计算每任务平均番茄数
          const totalPomodoros = filteredTasks.reduce((sum, task) => sum + task.pomodorosSpent, 0);
          const averagePomodorosPerTask = totalTasks > 0 ? totalPomodoros / totalTasks : 0;
          
          // 按四象限统计
          const byQuadrant: Record<string, TaskQuadrantStats> = {};
          
          // 初始化四个象限的统计数据
          const quadrants = ['important_urgent', 'important_not_urgent', 'not_important_urgent', 'not_important_not_urgent'];
          quadrants.forEach(quadrant => {
            const quadrantTasks = filteredTasks.filter(task => task.quadrant === quadrant);
            const total = quadrantTasks.length;
            const completed = quadrantTasks.filter(task => task.status === 'completed').length;
            
            byQuadrant[quadrant] = {
              total,
              completed,
              completionRate: total > 0 ? completed / total : 0,
            };
          })
          
          return {
            totalTasks,
            completedTasks,
            completionRate,
            averagePomodorosPerTask,
            byQuadrant,
          };
        } catch (error) {
          console.error('Error in generateTaskCompletionStats:', error);
          return {
            totalTasks: 0,
            completedTasks: 0,
            completionRate: 0,
            averagePomodorosPerTask: 0,
            byQuadrant: {},
          };
        }
      },
      
      // 生成目标进度统计
      generateGoalProgressStats: (startDate?: Date, endDate?: Date) => {
        try {
          const goals = useGoalStore.getState().goals;
          
          // 如果提供了日期范围，过滤在该范围内创建或完成的目标
          const filteredGoals = startDate && endDate
            ? goals.filter(goal => {
                const createdInRange = goal.createdAt >= startDate && goal.createdAt <= endDate;
                const completedInRange = goal.completedAt && goal.completedAt >= startDate && goal.completedAt <= endDate;
                return createdInRange || completedInRange;
              })
            : goals;
          
          // 计算总目标数、已完成目标数和进行中目标数
          const totalGoals = filteredGoals.length;
          const completedGoals = filteredGoals.filter(goal => goal.status === 'completed').length;
          const inProgressGoals = filteredGoals.filter(goal => goal.status === 'in_progress' || goal.status === 'not_started').length;
          
          // 按类别统计
          const byCategory: Record<string, GoalCategoryStats> = {};
          
          // 获取所有目标类别
          const categories = [...new Set(filteredGoals.map(goal => goal.category))];
          
          // 为每个类别生成统计数据
          categories.forEach(category => {
            const categoryGoals = filteredGoals.filter(goal => goal.category === category);
            const total = categoryGoals.length;
            const completed = categoryGoals.filter(goal => goal.status === 'completed').length;
            const totalProgress = categoryGoals.reduce((sum, goal) => sum + goal.progress, 0);
            
            byCategory[category] = {
              total,
              completed,
              averageProgress: total > 0 ? totalProgress / total : 0,
            };
          });
          
          return {
            totalGoals,
            completedGoals,
            inProgressGoals,
            byCategory,
          };
        } catch (error) {
          console.error('Error in generateGoalProgressStats:', error);
          return {
            totalGoals: 0,
            completedGoals: 0,
            inProgressGoals: 0,
            byCategory: {},
          };
        }
      },
      
      // 生成专注度指标
      generateFocusMetrics: (days = 30) => {
        try {
          const pomodoroStore = usePomodoroStore.getState();
          
          // 计算日期范围
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
          
          // 获取日期范围内的番茄钟记录
          const records = pomodoroStore.getRecordsByDateRange(startDate, endDate);
          
          // 计算平均专注时间（分钟）
          const totalFocusTime = records.reduce((total, record) => {
            const duration = (record.endTime.getTime() - record.startTime.getTime()) / (1000 * 60);
            return total + duration;
          }, 0);
          const averageFocusTime = records.length > 0 ? totalFocusTime / records.length : 0;
          
          // 计算最长连续专注时间（分钟）
          let longestFocusStreak = 0;
          records.forEach(record => {
            const duration = (record.endTime.getTime() - record.startTime.getTime()) / (1000 * 60);
            if (duration > longestFocusStreak) {
              longestFocusStreak = duration;
            }
          });
          
          // 计算中断率
          const totalInterruptions = records.reduce((total, record) => total + record.interruptions.length, 0);
          const interruptionRate = records.length > 0 ? totalInterruptions / records.length : 0;
          
          // 分析最高效时段
          const hourlyProductivity: Record<number, number> = {};
          records.forEach(record => {
            const hour = record.startTime.getHours();
            hourlyProductivity[hour] = (hourlyProductivity[hour] || 0) + 1;
          });
          
          // 找出番茄钟数量最多的小时
          let mostProductiveHour = 0;
          let maxPomodoros = 0;
          
          Object.entries(hourlyProductivity).forEach(([hour, count]) => {
            if (count > maxPomodoros) {
              mostProductiveHour = parseInt(hour);
              maxPomodoros = count;
            }
          });
          
          // 格式化最高效时段
          const mostProductiveTimeOfDay = `${mostProductiveHour}:00-${mostProductiveHour + 1}:00`;
          
          // 分析最高效工作日
          const dailyProductivity: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
          records.forEach(record => {
            const day = record.startTime.getDay();
            dailyProductivity[day] = (dailyProductivity[day] || 0) + 1;
          });
          
          // 找出番茄钟数量最多的工作日
          let mostProductiveDayOfWeek = 0;
          maxPomodoros = 0;
          
          Object.entries(dailyProductivity).forEach(([day, count]) => {
            if (count > maxPomodoros) {
              mostProductiveDayOfWeek = parseInt(day);
              maxPomodoros = count;
            }
          });
          
          return {
            averageFocusTime,
            longestFocusStreak,
            interruptionRate,
            mostProductiveTimeOfDay,
            mostProductiveDayOfWeek,
          };
        } catch (error) {
          console.log('%c生成专注指标遇到问题，使用默认值', 'color: orange');
          return {
            averageFocusTime: 0,
            longestFocusStreak: 0,
            interruptionRate: 0,
            mostProductiveTimeOfDay: '9:00-10:00', // 默认值
            mostProductiveDayOfWeek: 1, // 默认值为周一
          };
        }
      },
      
      // 获取完整统计数据
      getStatistics: () => {
        try {
          const today = new Date();
          
          return {
            dailyPomodoros: get().generateWeeklyStats(today),
            taskCompletion: get().generateTaskCompletionStats(),
            goalProgress: get().generateGoalProgressStats(),
            focusMetrics: get().generateFocusMetrics(),
          };
        } catch (error) {
          console.log('%c获取统计数据遇到问题，使用默认值', 'color: orange');
          return {
            dailyPomodoros: [],
            taskCompletion: get().generateTaskCompletionStats(),
            goalProgress: get().generateGoalProgressStats(),
            focusMetrics: get().generateFocusMetrics(),
          };
        }
      },
    }),
    {
      name: 'statistics-storage', // 存储的唯一名称
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
            localStorage.removeItem('statistics-storage');
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
          localStorage.removeItem('statistics-storage');
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
          
          const mergedState = {
            ...currentState,
            ...persistedState
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