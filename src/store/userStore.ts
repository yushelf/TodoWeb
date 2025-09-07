import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserPreferences } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// 默认用户偏好设置
export const defaultPreferences: UserPreferences = {
  theme: 'light',
  pomodoroSettings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
  },
  notificationSettings: {
    taskReminders: true,
    pomodoroAlerts: true,
    goalReviewReminders: true,
    playSound: true,
    sound: 'bell',
    pomodoroEnd: true,
    breakEnd: true,
  },
};

// 用户状态接口
interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  initUser: () => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updatePomodoroSettings: (settings: Partial<UserPreferences['pomodoroSettings']>) => void;
  updateNotificationSettings: (settings: Partial<UserPreferences['notificationSettings']>) => void;
  toggleTheme: () => void;
}

// 创建用户状态存储
// 创建用户状态存储

export const useUserStore = create<UserState>(
  persist(
    (set) => ({
      // 初始状态
      currentUser: null,
      isAuthenticated: false,
      
      // 初始化用户（本地应用中创建默认用户）
      initUser: () => {
        console.log('%c初始化用户', 'color: blue');
        const newUser: User = {
          id: uuidv4(),
          username: 'User',
          preferences: defaultPreferences,
        };
        
        set({
          currentUser: newUser,
          isAuthenticated: true,
        });
        
        // 确保localStorage中的数据是正确的
        setTimeout(() => {
          const storageKey = 'user-storage';
          const storedData = localStorage.getItem(storageKey);
          console.log('%c初始化后检查localStorage:', 'color: blue', storedData);
          
          if (storedData === '[object Object]' || storedData === null) {
            console.error('%c发现[object Object]错误或数据为空，清除并重新保存', 'color: red');
            localStorage.removeItem(storageKey);
            
            // 重新保存正确的数据
            const state = useUserStore.getState();
            try {
              const serialized = JSON.stringify({
                state: state,
                version: 0
              });
              localStorage.setItem(storageKey, serialized);
              console.log('%c成功重新保存用户数据', 'color: green');
            } catch (error) {
              console.error('%c序列化用户数据失败:', 'color: red', error);
            }
          }
        }, 100);
      },
      
      // 更新用户偏好设置
      updateUserPreferences: (preferences) => set((state) => ({
        currentUser: state.currentUser ? {
          ...state.currentUser,
          preferences: {
            ...state.currentUser.preferences,
            ...preferences,
          },
        } : null,
      })),
      
      // 更新番茄钟设置
      updatePomodoroSettings: (settings) => set((state) => {
        console.log('更新番茄钟设置:', settings);
        console.log('当前用户状态:', state.currentUser);
        
        return {
          currentUser: state.currentUser ? {
            ...state.currentUser,
            preferences: {
              ...state.currentUser.preferences,
              pomodoroSettings: {
                ...state.currentUser.preferences.pomodoroSettings,
                ...settings,
              },
            },
          } : null,
        };
      }),
      
      // 更新通知设置
      updateNotificationSettings: (settings) => set((state) => {
        console.log('更新通知设置:', settings);
        console.log('当前用户状态:', state.currentUser);
        
        return {
          currentUser: state.currentUser ? {
            ...state.currentUser,
            preferences: {
              ...state.currentUser.preferences,
              notificationSettings: {
                ...state.currentUser.preferences.notificationSettings,
                ...settings,
              },
            },
          } : null,
        };
      }),
      
      // 切换主题
      toggleTheme: () => set((state) => ({
        currentUser: state.currentUser ? {
          ...state.currentUser,
          preferences: {
            ...state.currentUser.preferences,
            theme: state.currentUser.preferences.theme === 'light' ? 'dark' : 'light',
          },
        } : null,
      })),
    }),
    // 使用自定义的storage实现，确保正确处理localStorage
    {
      name: 'user-storage', // localStorage 的键名
      storage: {
        getItem: (name) => {
          try {
            console.log(`%c尝试从localStorage获取${name}`, 'color: blue');
            const value = localStorage.getItem(name);
            console.log(`%c获取到的${name}原始值:`, 'color: blue', value);
            
            // 检查是否为[object Object]字符串
            if (value === '[object Object]') {
              console.error(`%c错误: localStorage中的${name}是[object Object]字符串`, 'color: red');
              localStorage.removeItem(name); // 删除无效数据
              return null;
            }
            
            return value;
          } catch (error) {
            console.error(`%c从localStorage获取${name}遇到问题:`, 'color: red', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            console.log(`%c尝试设置localStorage ${name}:`, 'color: green', value);
            // 确保value是字符串
            let stringValue;
            if (typeof value !== 'string') {
              // 如果是对象，尝试序列化
              if (typeof value === 'object' && value !== null) {
                try {
                  stringValue = JSON.stringify(value);
                  console.log(`%c已将对象转换为JSON字符串:`, 'color: green', stringValue);
                } catch (serializeError) {
                  console.error(`%c序列化对象失败:`, 'color: red', serializeError);
                  stringValue = '{}';
                }
              } else {
                // 如果不是对象，转换为字符串
                stringValue = String(value);
                console.log(`%c已将非对象值转换为字符串:`, 'color: green', stringValue);
              }
            } else {
              stringValue = value;
            }
            
            // 最后检查确保不是[object Object]字符串
            if (stringValue === '[object Object]') {
              console.error(`%c错误: 尝试存储[object Object]字符串到localStorage ${name}`, 'color: red');
              stringValue = '{}';
            }
            
            localStorage.setItem(name, stringValue);
            console.log(`%c成功设置localStorage ${name}:`, 'color: green', stringValue);
          } catch (error) {
            console.error(`%c设置localStorage ${name}遇到问题:`, 'color: red', error);
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
          // 检查state是否为有效对象
          if (!state || typeof state !== 'object') {
            console.error('%c序列化错误: 状态不是有效对象', 'color: red', state);
            return '{}';
          }

          // 直接序列化，处理特殊情况
          const serialized = JSON.stringify(state, (key, value) => {
            // 处理Date对象
            if (value instanceof Date) {
              return { __isDate: true, iso: value.toISOString() };
            }
            // 处理可能导致循环引用的对象
            if (typeof value === 'object' && value !== null) {
              // 检查是否有toJSON方法，如果有则使用它
              if (typeof value.toJSON === 'function') {
                return value.toJSON();
              }
            }
            return value;
          });
          
          // 检查序列化结果
          if (serialized === undefined || serialized === 'undefined' || serialized === '[object Object]') {
            console.error('%c序列化错误: 结果无效', 'color: red', serialized);
            return '{}';
          }
          
          console.log('%c序列化成功:', 'color: purple', serialized);
          return serialized;
        } catch (error) {
          console.error('%c序列化状态遇到问题:', 'color: red', error);
          return '{}';
        }
      },
      deserialize: (str) => {
        try {
          console.log('%c尝试反序列化', 'color: blue');
          
          // 检查输入是否为字符串
          if (typeof str !== 'string') {
            console.error('%c反序列化错误: 输入不是字符串', 'color: red', str);
            localStorage.removeItem('user-storage');
            return {};
          }
          
          // 检查是否为空字符串
          if (str.trim() === '') {
            console.error('%c反序列化错误: 输入是空字符串', 'color: red');
            localStorage.removeItem('user-storage');
            return {};
          }
          
          // 检查是否为[object Object]这种错误字符串
          if (str === '[object Object]') {
            console.error('%c反序列化错误: 输入是[object Object]字符串', 'color: red');
            localStorage.removeItem('user-storage');
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
          
          // 验证解析结果是否为对象
          if (!parsed || typeof parsed !== 'object') {
            console.error('%c反序列化错误: 解析结果不是有效对象', 'color: red', parsed);
            localStorage.removeItem('user-storage');
            return {};
          }
          
          console.log('%c反序列化完成', 'color: blue', parsed);
          return parsed;
        } catch (error) {
          console.error('%c反序列化遇到问题:', 'color: red', error);
          localStorage.removeItem('user-storage');
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
            console.log('%c恢复的用户数据:', 'color: green', newState?.currentUser);
          }
        };
      }
    }
  )
);