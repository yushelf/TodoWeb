import { usePomodoroStore } from '../store/pomodoroStore';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useUserStore } from '../store/userStore';
import { useStatisticsStore } from '../store/statisticsStore';

// 应用数据接口
interface AppData {
  version: string;
  timestamp: number;
  pomodoro: any;
  tasks: any;
  goals: any;
  user: any;
  statistics: any;
}

/**
 * 数据服务 - 处理应用数据的导入导出
 */
const dataService = {
  /**
   * 导出所有应用数据
   * @returns 包含所有应用数据的对象
   */
  exportAllData: (): AppData => {
    // 获取各个store的状态
    const pomodoroState = usePomodoroStore.getState();
    const taskState = useTaskStore.getState();
    const goalState = useGoalStore.getState();
    const userState = useUserStore.getState();
    const statisticsState = useStatisticsStore.getState();

    // 创建导出数据对象
    const exportData: AppData = {
      version: '1.0.0', // 数据版本号
      timestamp: Date.now(),
      pomodoro: {
        records: pomodoroState.records,
        pomodorosUntilLongBreak: pomodoroState.pomodorosUntilLongBreak
      },
      tasks: {
        tasks: taskState.tasks
      },
      goals: {
        goals: goalState.goals
      },
      user: {
        currentUser: userState.currentUser,
        isAuthenticated: userState.isAuthenticated
      },
      statistics: {} // 统计数据是计算得出的，不需要导出
    };

    return exportData;
  },

  /**
   * 将应用数据导出为JSON文件
   */
  exportDataToFile: () => {
    const data = dataService.exportAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    // 创建下载链接
    const exportFileDefaultName = `pomodoro-app-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  /**
   * 从JSON文件导入数据
   * @param jsonData 导入的JSON数据
   * @returns 是否导入成功
   */
  importDataFromJson: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData) as AppData;
      
      // 验证数据格式
      if (!data.version || !data.timestamp) {
        console.error('导入数据格式无效');
        return false;
      }
      
      // 导入番茄钟数据
      if (data.pomodoro) {
        const pomodoroStore = usePomodoroStore.getState();
        // 使用setState方法设置状态
        usePomodoroStore.setState({
          ...pomodoroStore,
          records: data.pomodoro.records || [],
          pomodorosUntilLongBreak: data.pomodoro.pomodorosUntilLongBreak || 0
        });
      }
      
      // 导入任务数据
      if (data.tasks) {
        const taskStore = useTaskStore.getState();
        useTaskStore.setState({
          ...taskStore,
          tasks: data.tasks.tasks || []
        });
      }
      
      // 导入目标数据
      if (data.goals) {
        const goalStore = useGoalStore.getState();
        useGoalStore.setState({
          ...goalStore,
          goals: data.goals.goals || []
        });
      }
      
      // 导入用户数据
      if (data.user) {
        const userStore = useUserStore.getState();
        useUserStore.setState({
          ...userStore,
          currentUser: data.user.currentUser,
          isAuthenticated: data.user.isAuthenticated
        });
      }
      
      console.log('数据导入成功');
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  },

  /**
   * 从文件导入数据
   * @param file 导入的文件
   * @returns Promise，解析为是否导入成功
   */
  importDataFromFile: (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const jsonData = event.target.result as string;
          const success = dataService.importDataFromJson(jsonData);
          resolve(success);
        } else {
          reject(new Error('读取文件失败'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件时发生错误'));
      };
      
      reader.readAsText(file);
    });
  },

  /**
   * 重置所有数据
   */
  resetAllData: () => {
    // 重置番茄钟数据
    usePomodoroStore.setState({
      ...usePomodoroStore.getState(),
      status: 'idle',
      currentTaskId: null,
      timeLeft: 0,
      totalTime: 0,
      isLongBreak: false,
      pomodorosUntilLongBreak: 0,
      currentPomodoroId: null,
      currentInterruptions: [],
      notes: '',
      records: []
    });
    
    // 重置任务数据
    useTaskStore.setState({
      ...useTaskStore.getState(),
      tasks: []
    });
    
    // 重置目标数据
    useGoalStore.setState({
      ...useGoalStore.getState(),
      goals: []
    });
    
    // 重置用户数据（保留偏好设置）
    const userStore = useUserStore.getState();
    const preferences = userStore.currentUser?.preferences;
    
    useUserStore.setState({
      ...userStore,
      currentUser: preferences ? {
        id: 'default',
        username: 'User',
        preferences
      } : null,
      isAuthenticated: false
    });
    
    console.log('所有数据已重置');
  }
};

export default dataService;