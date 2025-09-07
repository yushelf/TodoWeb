import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// 内联定义番茄钟相关接口
interface Interruption {
  id: string;
  time: Date;
  reason: string;
  type: 'internal' | 'external';
}

interface PomodoroRecord {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // 分钟
  completed: boolean;
  interruptions: Interruption[];
  notes: string;
}
import { useTaskStore } from './taskStore';
import { useUserStore } from './userStore';

// 番茄钟状态
type PomodoroStatus = 'idle' | 'working' | 'break' | 'paused';

// 番茄钟状态接口
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

// 创建番茄钟状态存储
export const usePomodoroStore = create<PomodoroState>(
  persist(
    (set, get) => ({
      // 初始状态
      status: 'idle',
      currentTaskId: null,
      timeLeft: 0,
      totalTime: 0,
      isLongBreak: false,
      pomodorosUntilLongBreak: 0,
      currentPomodoroId: null,
      currentInterruptions: [],
      notes: '',
      records: [],
      
      // 开始番茄钟
      startPomodoro: (taskId) => {
        const userSettings = useUserStore.getState().currentUser?.preferences.pomodoroSettings;
        console.log('开始番茄钟 - 用户设置:', userSettings);
        
        if (!userSettings) {
          console.error('无法开始番茄钟：用户设置不存在');
          return;
        }
        
        const workDuration = userSettings.workDuration * 60; // 转换为秒
        const pomodoroId = uuidv4();
        
        console.log('开始番茄钟:', {
          taskId,
          workDuration: workDuration / 60, // 转换回分钟显示
          pomodoroId
        });
        
        set({
          status: 'working',
          currentTaskId: taskId || null,
          timeLeft: workDuration,
          totalTime: workDuration,
          currentPomodoroId: pomodoroId,
          currentInterruptions: [],
          notes: '',
        });
      },
      
      // 暂停番茄钟
      pausePomodoro: () => set({ status: 'paused' }),
      
      // 恢复番茄钟
      resumePomodoro: () => set({ status: 'working' }),
      
      // 停止番茄钟
      stopPomodoro: (completed) => {
        const { currentTaskId, currentPomodoroId, currentInterruptions, notes, totalTime, timeLeft } = get();
        
        if (currentPomodoroId) {
          // 计算开始时间和持续时间
          const startTime = new Date(Date.now() - (totalTime - timeLeft) * 1000);
          const endTime = new Date();
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // 转换为分钟
          
          // 创建番茄钟记录
          const record: PomodoroRecord = {
            id: currentPomodoroId,
            taskId: currentTaskId || undefined,
            startTime,
            endTime,
            duration,
            completed,
            notes,
            interruptions: [...currentInterruptions],
          };
          
          set((state) => ({
            records: [...state.records, record],
            status: 'idle',
            currentPomodoroId: null,
            currentInterruptions: [],
            notes: '',
          }));
          
          // 如果完成了番茄钟并且有关联任务，增加任务的番茄数
          if (completed && currentTaskId) {
            useTaskStore.getState().incrementPomodorosSpent(currentTaskId);
          }
          
          // 更新长休息计数
          if (completed) {
            const userSettings = useUserStore.getState().currentUser?.preferences.pomodoroSettings;
            if (userSettings) {
              const pomodorosUntilLongBreak = (get().pomodorosUntilLongBreak + 1) % userSettings.longBreakInterval;
              const isLongBreak = pomodorosUntilLongBreak === 0;
              
              set({
                pomodorosUntilLongBreak,
                isLongBreak,
              });
              
              // 如果设置了自动开始休息，则开始休息
              if (userSettings.autoStartBreaks) {
                get().startBreak(isLongBreak);
              }
            }
          }
        }
      },
      
      // 开始休息
      startBreak: (isLong) => {
        const userSettings = useUserStore.getState().currentUser?.preferences.pomodoroSettings;
        if (!userSettings) return;
        
        const isLongBreak = isLong !== undefined ? isLong : get().isLongBreak;
        const breakDuration = isLongBreak
          ? userSettings.longBreakDuration * 60
          : userSettings.shortBreakDuration * 60;
        
        set({
          status: 'break',
          timeLeft: breakDuration,
          totalTime: breakDuration,
          isLongBreak,
        });
      },
      
      // 停止休息
      stopBreak: () => {
        set({ status: 'idle' });
        
        // 如果设置了自动开始番茄钟，则开始新的番茄钟
        const userSettings = useUserStore.getState().currentUser?.preferences.pomodoroSettings;
        if (userSettings?.autoStartPomodoros) {
          get().startPomodoro(get().currentTaskId || undefined);
        }
      },
      
      // 时间递减
      tick: () => set((state) => {
        if (state.status !== 'working' && state.status !== 'break') return {};
        
        const timeLeft = state.timeLeft - 1;
        
        // 如果时间到了
        if (timeLeft <= 0) {
          if (state.status === 'working') {
            get().stopPomodoro(true);
          } else if (state.status === 'break') {
            get().stopBreak();
          }
          return { timeLeft: 0 };
        }
        
        return { timeLeft };
      }),
      
      // 添加中断
      addInterruption: (reason, type) => set((state) => ({
        currentInterruptions: [
          ...state.currentInterruptions,
          {
            id: uuidv4(),
            time: new Date(),
            reason,
            type,
          },
        ],
      })),
      
      // 更新笔记
      updateNotes: (notes) => set({ notes }),
      
      // 通过任务ID获取番茄钟记录
      getRecordsByTask: (taskId) =>
        get().records.filter((record) => record.taskId === taskId),
      
      // 通过日期获取番茄钟记录
      getRecordsByDate: (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return get().records.filter(
          (record) => record.startTime >= startOfDay && record.startTime <= endOfDay
        );
      },
      
      // 通过日期范围获取番茄钟记录
      getRecordsByDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return get().records.filter(
          (record) => record.startTime >= start && record.startTime <= end
        );
      },
      
      // 获取今天的总番茄数
      getTotalPomodorosToday: () => {
        try {
          return get().getRecordsByDate(new Date()).length;
        } catch (error) {
          console.log('获取今日番茄钟总数遇到问题，进行静默处理');
          return 0;
        }
      },
      
      // 获取今天完成的番茄数
      getCompletedPomodorosToday: () => {
        try {
          return get()
            .getRecordsByDate(new Date())
            .filter((record) => record.completed).length;
        } catch (error) {
          console.log('获取今日完成番茄钟数遇到问题，进行静默处理');
          return 0;
        }
      },
      
      // 获取今天的总专注时间（分钟）
      getTotalFocusTimeToday: () => {
        try {
          const records = get().getRecordsByDate(new Date());
          return records.reduce((total, record) => {
            const duration =
              (record.endTime.getTime() - record.startTime.getTime()) / (1000 * 60);
            return total + duration;
          }, 0);
        } catch (error) {
          console.log('获取今日专注时间遇到问题，进行静默处理');
          return 0;
        }
      },
    }),
    {
      name: 'pomodoro-storage', // localStorage 的键名
      partialize: (state) => ({
        // 持久化记录和当前番茄钟的关键状态
        records: state.records,
        pomodorosUntilLongBreak: state.pomodorosUntilLongBreak,
        currentInterruptions: state.currentInterruptions,
        notes: state.notes,
        currentTaskId: state.currentTaskId,
        currentPomodoroId: state.currentPomodoroId
      }),
    }
  )
);