import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  Snackbar,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { useUserStore } from '../../store/userStore';
import { useTaskStore } from '../../store/taskStore';
import { v4 as uuidv4 } from 'uuid';

interface TestResult {
  success: boolean;
  message: string;
}

interface TestResults {
  startPomodoro?: TestResult;
  pauseResumePomodoro?: TestResult;
  stopPomodoro?: TestResult;
  startBreak?: TestResult;
  stopBreak?: TestResult;
  addInterruption?: TestResult;
  autoStartBreak?: TestResult;
  autoStartPomodoro?: TestResult;
  stateTransitions?: TestResult;
  recordCreation?: TestResult;
}

const PomodoroTester: React.FC = () => {
  // 获取番茄钟状态和方法
  const {
    status,
    timeLeft,
    totalTime,
    currentTaskId,
    isLongBreak,
    pomodorosUntilLongBreak,
    currentPomodoroId,
    currentInterruptions,
    notes,
    records,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    startBreak,
    stopBreak,
    addInterruption,
    updateNotes
  } = usePomodoroStore();

  // 获取用户设置
  const { currentUser, updatePomodoroSettings } = useUserStore();
  const pomodoroSettings = currentUser?.preferences.pomodoroSettings;

  // 获取任务
  const { tasks, addTask } = useTaskStore();

  // 本地状态
  const [testResults, setTestResults] = useState<TestResults>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [interruptionReason, setInterruptionReason] = useState('');
  const [testTaskId, setTestTaskId] = useState<string | null>(null);
  const [testNote, setTestNote] = useState('');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  // 添加测试日志
  const addTestLog = (message: string) => {
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 创建测试任务
  const createTestTask = () => {
    const taskId = uuidv4();
    addTask({
      id: taskId,
      title: '测试番茄钟任务',
      description: '这是一个用于测试番茄钟功能的任务',
      status: 'not_started',
      priority: 'medium',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['测试'],
      pomodorosEstimated: 1,
      pomodorosSpent: 0,
      quadrant: 'important_urgent'
    });
    setTestTaskId(taskId);
    addTestLog(`创建了测试任务，ID: ${taskId}`);
    return taskId;
  };

  // 测试开始番茄钟
  const testStartPomodoro = async () => {
    try {
      addTestLog('开始测试番茄钟启动功能');
      setIsRunningTest(true);

      // 确保有测试任务
      const taskId = testTaskId || createTestTask();
      
      // 记录初始状态
      const initialStatus = status;
      addTestLog(`初始状态: ${initialStatus}`);
      
      // 启动番茄钟
      startPomodoro(taskId);
      addTestLog('调用了startPomodoro方法');
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证状态变化
      const newStatus = usePomodoroStore.getState().status;
      const newTimeLeft = usePomodoroStore.getState().timeLeft;
      const newCurrentTaskId = usePomodoroStore.getState().currentTaskId;
      
      addTestLog(`新状态: ${newStatus}, 剩余时间: ${newTimeLeft}, 任务ID: ${newCurrentTaskId}`);
      
      const success = 
        newStatus === 'working' && 
        newTimeLeft > 0 && 
        newCurrentTaskId === taskId;
      
      setTestResults(prev => ({
        ...prev,
        startPomodoro: {
          success,
          message: success 
            ? `番茄钟成功启动: 状态=${newStatus}, 剩余时间=${newTimeLeft}秒, 任务ID=${newCurrentTaskId}` 
            : `番茄钟启动失败: 状态=${newStatus}, 剩余时间=${newTimeLeft}秒, 任务ID=${newCurrentTaskId}`
        }
      }));
      
      setSnackbarMessage(success ? '番茄钟启动测试通过' : '番茄钟启动测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试番茄钟启动时出错:', error);
      setTestResults(prev => ({
        ...prev,
        startPomodoro: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('番茄钟启动测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试暂停和恢复番茄钟
  const testPauseResumePomodoro = async () => {
    try {
      addTestLog('开始测试番茄钟暂停和恢复功能');
      setIsRunningTest(true);

      // 确保番茄钟正在运行
      if (status !== 'working') {
        const taskId = testTaskId || createTestTask();
        startPomodoro(taskId);
        addTestLog('番茄钟未运行，已启动新的番茄钟');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 记录初始状态
      const initialStatus = usePomodoroStore.getState().status;
      addTestLog(`初始状态: ${initialStatus}`);
      
      // 暂停番茄钟
      pausePomodoro();
      addTestLog('调用了pausePomodoro方法');
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证暂停状态
      const pausedStatus = usePomodoroStore.getState().status;
      addTestLog(`暂停后状态: ${pausedStatus}`);
      
      const pauseSuccess = pausedStatus === 'paused';
      
      // 恢复番茄钟
      resumePomodoro();
      addTestLog('调用了resumePomodoro方法');
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证恢复状态
      const resumedStatus = usePomodoroStore.getState().status;
      addTestLog(`恢复后状态: ${resumedStatus}`);
      
      const resumeSuccess = resumedStatus === 'working';
      
      const success = pauseSuccess && resumeSuccess;
      
      setTestResults(prev => ({
        ...prev,
        pauseResumePomodoro: {
          success,
          message: success 
            ? `番茄钟暂停和恢复成功: 暂停状态=${pausedStatus}, 恢复状态=${resumedStatus}` 
            : `番茄钟暂停和恢复失败: 暂停状态=${pausedStatus}, 恢复状态=${resumedStatus}`
        }
      }));
      
      setSnackbarMessage(success ? '番茄钟暂停和恢复测试通过' : '番茄钟暂停和恢复测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试番茄钟暂停和恢复时出错:', error);
      setTestResults(prev => ({
        ...prev,
        pauseResumePomodoro: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('番茄钟暂停和恢复测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试停止番茄钟
  const testStopPomodoro = async () => {
    try {
      addTestLog('开始测试番茄钟停止功能');
      setIsRunningTest(true);

      // 保存原始设置
      const originalSettings = { ...pomodoroSettings };
      addTestLog('保存了原始番茄钟设置');
      
      // 临时禁用自动开始休息，确保停止后状态为idle
      updatePomodoroSettings({ ...pomodoroSettings, autoStartBreaks: false });
      addTestLog('临时禁用了自动开始休息设置');

      // 确保番茄钟正在运行
      if (status !== 'working' && status !== 'paused') {
        const taskId = testTaskId || createTestTask();
        startPomodoro(taskId);
        addTestLog('番茄钟未运行，已启动新的番茄钟');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 记录初始状态和记录数量
      const initialStatus = usePomodoroStore.getState().status;
      const initialRecordsCount = usePomodoroStore.getState().records.length;
      addTestLog(`初始状态: ${initialStatus}, 初始记录数: ${initialRecordsCount}`);
      
      // 停止番茄钟（标记为已完成）
      stopPomodoro(true);
      addTestLog('调用了stopPomodoro(true)方法');
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证状态变化和记录创建
      const newStatus = usePomodoroStore.getState().status;
      const newRecordsCount = usePomodoroStore.getState().records.length;
      
      addTestLog(`新状态: ${newStatus}, 新记录数: ${newRecordsCount}`);
      
      const statusSuccess = newStatus === 'idle';
      const recordSuccess = newRecordsCount > initialRecordsCount;
      
      const success = statusSuccess && recordSuccess;
      
      // 恢复原始设置
      updatePomodoroSettings(originalSettings);
      addTestLog('已恢复原始番茄钟设置');
      
      setTestResults(prev => ({
        ...prev,
        stopPomodoro: {
          success,
          message: success 
            ? `番茄钟停止成功: 状态=${newStatus}, 记录已创建` 
            : `番茄钟停止失败: 状态=${newStatus}, 记录创建=${recordSuccess ? '成功' : '失败'}`
        }
      }));
      
      setSnackbarMessage(success ? '番茄钟停止测试通过' : '番茄钟停止测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试番茄钟停止时出错:', error);
      setTestResults(prev => ({
        ...prev,
        stopPomodoro: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('番茄钟停止测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试开始休息
  const testStartBreak = async () => {
    try {
      addTestLog('开始测试休息启动功能');
      setIsRunningTest(true);

      // 记录初始状态
      const initialStatus = status;
      addTestLog(`初始状态: ${initialStatus}`);
      
      // 如果番茄钟正在运行，先停止它
      if (initialStatus === 'working' || initialStatus === 'paused') {
        stopPomodoro(true);
        addTestLog('番茄钟正在运行，已停止');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 启动休息（短休息）
      startBreak(false);
      addTestLog('调用了startBreak(false)方法');
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证状态变化
      const newStatus = usePomodoroStore.getState().status;
      const newTimeLeft = usePomodoroStore.getState().timeLeft;
      const newIsLongBreak = usePomodoroStore.getState().isLongBreak;
      
      addTestLog(`新状态: ${newStatus}, 剩余时间: ${newTimeLeft}, 是否长休息: ${newIsLongBreak}`);
      
      const success = 
        newStatus === 'break' && 
        newTimeLeft > 0 && 
        !newIsLongBreak;
      
      setTestResults(prev => ({
        ...prev,
        startBreak: {
          success,
          message: success 
            ? `休息成功启动: 状态=${newStatus}, 剩余时间=${newTimeLeft}秒, 是否长休息=${newIsLongBreak}` 
            : `休息启动失败: 状态=${newStatus}, 剩余时间=${newTimeLeft}秒, 是否长休息=${newIsLongBreak}`
        }
      }));
      
      setSnackbarMessage(success ? '休息启动测试通过' : '休息启动测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试休息启动时出错:', error);
      setTestResults(prev => ({
        ...prev,
        startBreak: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('休息启动测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试停止休息
  const testStopBreak = async () => {
    try {
      addTestLog('开始测试休息停止功能');
      setIsRunningTest(true);

      // 确保休息正在进行
      if (status !== 'break') {
        startBreak(false);
        addTestLog('休息未进行，已启动新的休息');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 记录初始状态
      const initialStatus = usePomodoroStore.getState().status;
      addTestLog(`初始状态: ${initialStatus}`);
      
      // 停止休息
      stopBreak();
      addTestLog('调用了stopBreak方法');
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证状态变化
      const newStatus = usePomodoroStore.getState().status;
      addTestLog(`新状态: ${newStatus}`);
      
      const success = newStatus === 'idle';
      
      setTestResults(prev => ({
        ...prev,
        stopBreak: {
          success,
          message: success 
            ? `休息停止成功: 状态=${newStatus}` 
            : `休息停止失败: 状态=${newStatus}`
        }
      }));
      
      setSnackbarMessage(success ? '休息停止测试通过' : '休息停止测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试休息停止时出错:', error);
      setTestResults(prev => ({
        ...prev,
        stopBreak: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('休息停止测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试添加中断
  const testAddInterruption = async () => {
    try {
      addTestLog('开始测试添加中断功能');
      setIsRunningTest(true);

      // 确保番茄钟正在运行
      if (status !== 'working' && status !== 'paused') {
        const taskId = testTaskId || createTestTask();
        startPomodoro(taskId);
        addTestLog('番茄钟未运行，已启动新的番茄钟');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 记录初始中断数量
      const initialInterruptionsCount = usePomodoroStore.getState().currentInterruptions.length;
      addTestLog(`初始中断数量: ${initialInterruptionsCount}`);
      
      // 添加中断
      const testReason = interruptionReason || '测试中断';
      addInterruption(testReason, 'internal');
      addTestLog(`调用了addInterruption方法，原因: ${testReason}`);
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证中断是否添加
      const newInterruptionsCount = usePomodoroStore.getState().currentInterruptions.length;
      const latestInterruption = usePomodoroStore.getState().currentInterruptions[newInterruptionsCount - 1];
      
      addTestLog(`新中断数量: ${newInterruptionsCount}, 最新中断原因: ${latestInterruption?.reason}`);
      
      const success = 
        newInterruptionsCount > initialInterruptionsCount && 
        latestInterruption?.reason === testReason;
      
      setTestResults(prev => ({
        ...prev,
        addInterruption: {
          success,
          message: success 
            ? `中断添加成功: 新中断数量=${newInterruptionsCount}, 中断原因=${latestInterruption?.reason}` 
            : `中断添加失败: 新中断数量=${newInterruptionsCount}, 期望原因=${testReason}`
        }
      }));
      
      setSnackbarMessage(success ? '添加中断测试通过' : '添加中断测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试添加中断时出错:', error);
      setTestResults(prev => ({
        ...prev,
        addInterruption: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('添加中断测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试自动开始休息
  const testAutoStartBreak = async () => {
    try {
      addTestLog('开始测试自动开始休息功能');
      setIsRunningTest(true);

      // 保存原始设置
      const originalSettings = { ...pomodoroSettings };
      addTestLog('保存了原始番茄钟设置');
      
      // 修改设置以启用自动开始休息
      updatePomodoroSettings({ ...pomodoroSettings, autoStartBreaks: true });
      addTestLog('已启用自动开始休息设置');
      
      // 确保番茄钟正在运行
      if (status !== 'working' && status !== 'paused') {
        const taskId = testTaskId || createTestTask();
        startPomodoro(taskId);
        addTestLog('番茄钟未运行，已启动新的番茄钟');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 记录初始状态
      const initialStatus = usePomodoroStore.getState().status;
      addTestLog(`初始状态: ${initialStatus}`);
      
      // 停止番茄钟（标记为已完成）
      stopPomodoro(true);
      addTestLog('调用了stopPomodoro(true)方法');
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证是否自动开始休息
      const newStatus = usePomodoroStore.getState().status;
      addTestLog(`新状态: ${newStatus}`);
      
      const success = newStatus === 'break';
      
      setTestResults(prev => ({
        ...prev,
        autoStartBreak: {
          success,
          message: success 
            ? `自动开始休息成功: 状态=${newStatus}` 
            : `自动开始休息失败: 状态=${newStatus}`
        }
      }));
      
      setSnackbarMessage(success ? '自动开始休息测试通过' : '自动开始休息测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
      
      // 恢复原始设置
      updatePomodoroSettings(originalSettings);
      addTestLog('已恢复原始番茄钟设置');
    } catch (error) {
      console.error('测试自动开始休息时出错:', error);
      setTestResults(prev => ({
        ...prev,
        autoStartBreak: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('自动开始休息测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试自动开始番茄钟
  const testAutoStartPomodoro = async () => {
    try {
      addTestLog('开始测试自动开始番茄钟功能');
      setIsRunningTest(true);

      // 保存原始设置
      const originalSettings = { ...pomodoroSettings };
      addTestLog('保存了原始番茄钟设置');
      
      // 修改设置以启用自动开始番茄钟
      updatePomodoroSettings({ ...pomodoroSettings, autoStartPomodoros: true });
      addTestLog('已启用自动开始番茄钟设置');
      
      // 确保有测试任务
      const taskId = testTaskId || createTestTask();
      usePomodoroStore.setState({ currentTaskId: taskId });
      addTestLog(`设置当前任务ID: ${taskId}`);
      
      // 确保休息正在进行
      if (status !== 'break') {
        startBreak(false);
        addTestLog('休息未进行，已启动新的休息');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 记录初始状态
      const initialStatus = usePomodoroStore.getState().status;
      addTestLog(`初始状态: ${initialStatus}`);
      
      // 停止休息
      stopBreak();
      addTestLog('调用了stopBreak方法');
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证是否自动开始番茄钟
      const newStatus = usePomodoroStore.getState().status;
      const newCurrentTaskId = usePomodoroStore.getState().currentTaskId;
      
      addTestLog(`新状态: ${newStatus}, 任务ID: ${newCurrentTaskId}`);
      
      const success = newStatus === 'working' && newCurrentTaskId === taskId;
      
      setTestResults(prev => ({
        ...prev,
        autoStartPomodoro: {
          success,
          message: success 
            ? `自动开始番茄钟成功: 状态=${newStatus}, 任务ID=${newCurrentTaskId}` 
            : `自动开始番茄钟失败: 状态=${newStatus}, 任务ID=${newCurrentTaskId}`
        }
      }));
      
      setSnackbarMessage(success ? '自动开始番茄钟测试通过' : '自动开始番茄钟测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
      
      // 恢复原始设置
      updatePomodoroSettings(originalSettings);
      addTestLog('已恢复原始番茄钟设置');
    } catch (error) {
      console.error('测试自动开始番茄钟时出错:', error);
      setTestResults(prev => ({
        ...prev,
        autoStartPomodoro: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('自动开始番茄钟测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试状态转换
  const testStateTransitions = async () => {
    try {
      addTestLog('开始测试番茄钟状态转换');
      setIsRunningTest(true);

      // 保存原始设置
      const originalSettings = { ...pomodoroSettings };
      addTestLog('保存了原始番茄钟设置');
      
      // 临时禁用自动开始休息和自动开始番茄钟，确保状态转换按预期进行
      updatePomodoroSettings({ 
        ...pomodoroSettings, 
        autoStartBreaks: false,
        autoStartPomodoros: false 
      });
      addTestLog('临时禁用了自动开始休息和自动开始番茄钟设置');

      // 定义期望的状态转换序列
      const expectedTransitions = [
        'idle',
        'working',
        'paused',
        'working',
        'idle',
        'break',
        'idle'
      ];
      
      addTestLog(`期望的状态转换序列: ${expectedTransitions.join(' -> ')}`);
      
      // 执行状态转换
      const actualTransitions = ['idle'];
      
      // idle -> working
      const taskId = testTaskId || createTestTask();
      startPomodoro(taskId);
      await new Promise(resolve => setTimeout(resolve, 500));
      actualTransitions.push(usePomodoroStore.getState().status);
      addTestLog(`转换到 working 状态`);
      
      // working -> paused
      pausePomodoro();
      await new Promise(resolve => setTimeout(resolve, 500));
      actualTransitions.push(usePomodoroStore.getState().status);
      addTestLog(`转换到 paused 状态`);
      
      // paused -> working
      resumePomodoro();
      await new Promise(resolve => setTimeout(resolve, 500));
      actualTransitions.push(usePomodoroStore.getState().status);
      addTestLog(`转换到 working 状态`);
      
      // working -> idle
      stopPomodoro(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      actualTransitions.push(usePomodoroStore.getState().status);
      addTestLog(`转换到 idle 状态`);
      
      // idle -> break
      startBreak(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      actualTransitions.push(usePomodoroStore.getState().status);
      addTestLog(`转换到 break 状态`);
      
      // break -> idle
      stopBreak();
      await new Promise(resolve => setTimeout(resolve, 500));
      actualTransitions.push(usePomodoroStore.getState().status);
      addTestLog(`转换到 idle 状态`);
      
      // 验证状态转换序列
      const transitionsMatch = JSON.stringify(expectedTransitions) === JSON.stringify(actualTransitions);
      
      addTestLog(`实际状态转换序列: ${actualTransitions.join(' -> ')}`);
      addTestLog(`状态转换序列${transitionsMatch ? '匹配' : '不匹配'}`);
      
      // 恢复原始设置
      updatePomodoroSettings(originalSettings);
      addTestLog('已恢复原始番茄钟设置');
      
      setTestResults(prev => ({
        ...prev,
        stateTransitions: {
          success: transitionsMatch,
          message: transitionsMatch 
            ? `状态转换序列正确: ${actualTransitions.join(' -> ')}` 
            : `状态转换序列错误: 期望 ${expectedTransitions.join(' -> ')}, 实际 ${actualTransitions.join(' -> ')}`
        }
      }));
      
      setSnackbarMessage(transitionsMatch ? '状态转换测试通过' : '状态转换测试失败');
      setSnackbarSeverity(transitionsMatch ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试状态转换时出错:', error);
      setTestResults(prev => ({
        ...prev,
        stateTransitions: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('状态转换测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 测试记录创建
  const testRecordCreation = async () => {
    try {
      addTestLog('开始测试番茄钟记录创建');
      setIsRunningTest(true);

      // 确保有测试任务
      const taskId = testTaskId || createTestTask();
      
      // 记录初始记录数量
      const initialRecordsCount = usePomodoroStore.getState().records.length;
      addTestLog(`初始记录数量: ${initialRecordsCount}`);
      
      // 添加测试笔记
      const testNoteText = testNote || '测试笔记';
      
      // 启动番茄钟
      startPomodoro(taskId);
      addTestLog(`启动番茄钟，任务ID: ${taskId}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新笔记
      updateNotes(testNoteText);
      addTestLog(`更新笔记: ${testNoteText}`);
      
      // 添加中断
      addInterruption('测试中断', 'external');
      addTestLog('添加中断: 测试中断');
      
      // 停止番茄钟（标记为已完成）
      stopPomodoro(true);
      addTestLog('停止番茄钟，标记为已完成');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证记录是否创建
      const newRecordsCount = usePomodoroStore.getState().records.length;
      const latestRecord = usePomodoroStore.getState().records[newRecordsCount - 1];
      
      addTestLog(`新记录数量: ${newRecordsCount}`);
      
      const recordCreated = newRecordsCount > initialRecordsCount;
      const recordHasCorrectTaskId = latestRecord?.taskId === taskId;
      const recordHasCorrectNotes = latestRecord?.notes === testNoteText;
      const recordHasInterruption = latestRecord?.interruptions?.length > 0;
      const recordIsCompleted = latestRecord?.completed === true;
      
      const success = 
        recordCreated && 
        recordHasCorrectTaskId && 
        recordHasCorrectNotes && 
        recordHasInterruption && 
        recordIsCompleted;
      
      addTestLog(`记录创建: ${recordCreated ? '成功' : '失败'}`);
      addTestLog(`记录任务ID正确: ${recordHasCorrectTaskId ? '是' : '否'}`);
      addTestLog(`记录笔记正确: ${recordHasCorrectNotes ? '是' : '否'}`);
      addTestLog(`记录包含中断: ${recordHasInterruption ? '是' : '否'}`);
      addTestLog(`记录标记为已完成: ${recordIsCompleted ? '是' : '否'}`);
      
      setTestResults(prev => ({
        ...prev,
        recordCreation: {
          success,
          message: success 
            ? `记录创建成功: 任务ID=${latestRecord?.taskId}, 笔记=${latestRecord?.notes}, 中断数=${latestRecord?.interruptions?.length}, 已完成=${latestRecord?.completed}` 
            : `记录创建失败: 记录创建=${recordCreated}, 任务ID正确=${recordHasCorrectTaskId}, 笔记正确=${recordHasCorrectNotes}, 包含中断=${recordHasInterruption}, 已完成=${recordIsCompleted}`
        }
      }));
      
      setSnackbarMessage(success ? '记录创建测试通过' : '记录创建测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试记录创建时出错:', error);
      setTestResults(prev => ({
        ...prev,
        recordCreation: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('记录创建测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    addTestLog('开始运行所有测试');
    setTestLog([]);
    
    await testStartPomodoro();
    await testPauseResumePomodoro();
    await testStopPomodoro();
    await testStartBreak();
    await testStopBreak();
    await testAddInterruption();
    await testAutoStartBreak();
    await testAutoStartPomodoro();
    await testStateTransitions();
    await testRecordCreation();
    
    addTestLog('所有测试完成');
    
    // 计算测试结果
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(result => result?.success).length;
    
    setSnackbarMessage(`测试完成: ${passedTests}/${totalTests} 通过`);
    setSnackbarSeverity(passedTests === totalTests ? 'success' : 'warning');
    setSnackbarOpen(true);
  };

  // 处理Snackbar关闭
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // 清理函数
  useEffect(() => {
    return () => {
      // 确保在组件卸载时停止任何正在运行的番茄钟或休息
      if (status !== 'idle') {
        if (status === 'working' || status === 'paused') {
          stopPomodoro(false);
        } else if (status === 'break') {
          stopBreak();
        }
      }
    };
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>番茄钟功能测试</Typography>
      <Typography variant="body1" paragraph>
        此测试模块用于验证番茄钟功能在不同状态下的表现，包括启动、暂停、恢复、停止、休息、中断等功能。
      </Typography>
      
      <Grid container spacing={3}>
        {/* 当前状态卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>当前番茄钟状态</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">状态:</Typography>
                  <Typography variant="body1">
                    {status === 'idle' && '空闲'}
                    {status === 'working' && '工作中'}
                    {status === 'paused' && '已暂停'}
                    {status === 'break' && '休息中'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">剩余时间:</Typography>
                  <Typography variant="body1">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">当前任务:</Typography>
                  <Typography variant="body1">
                    {currentTaskId ? tasks.find(t => t.id === currentTaskId)?.title || '未知任务' : '无'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">中断次数:</Typography>
                  <Typography variant="body1">{currentInterruptions.length}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 测试控制卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>测试控制</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={runAllTests}
                    disabled={isRunningTest}
                    startIcon={isRunningTest ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    运行所有测试
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testStartPomodoro}
                    disabled={isRunningTest}
                  >
                    测试启动番茄钟
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testPauseResumePomodoro}
                    disabled={isRunningTest}
                  >
                    测试暂停/恢复
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testStopPomodoro}
                    disabled={isRunningTest}
                  >
                    测试停止番茄钟
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testStartBreak}
                    disabled={isRunningTest}
                  >
                    测试开始休息
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testStopBreak}
                    disabled={isRunningTest}
                  >
                    测试停止休息
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testStateTransitions}
                    disabled={isRunningTest}
                  >
                    测试状态转换
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 中断测试卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>中断测试</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="中断原因"
                    variant="outlined"
                    fullWidth
                    value={interruptionReason}
                    onChange={(e) => setInterruptionReason(e.target.value)}
                    placeholder="输入中断原因"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testAddInterruption}
                    disabled={isRunningTest}
                  >
                    测试添加中断
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 记录测试卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>记录测试</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="测试笔记"
                    variant="outlined"
                    fullWidth
                    value={testNote}
                    onChange={(e) => setTestNote(e.target.value)}
                    placeholder="输入测试笔记"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testRecordCreation}
                    disabled={isRunningTest}
                  >
                    测试记录创建
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 自动化测试卡片 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>自动化测试</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testAutoStartBreak}
                    disabled={isRunningTest}
                  >
                    测试自动开始休息
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={testAutoStartPomodoro}
                    disabled={isRunningTest}
                  >
                    测试自动开始番茄钟
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 测试结果卡片 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>测试结果</Typography>
              <Grid container spacing={2}>
                {Object.entries(testResults).map(([testName, result]) => (
                  <Grid item xs={12} key={testName}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={testName} 
                        color="primary" 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={result?.success ? '通过' : '失败'} 
                        color={result?.success ? 'success' : 'error'} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {result?.message}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                ))}
                
                {Object.keys(testResults).length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      尚未运行任何测试
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 测试日志卡片 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>测试日志</Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                <List dense>
                  {testLog.map((log, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={log} />
                    </ListItem>
                  ))}
                  
                  {testLog.length === 0 && (
                    <ListItem>
                      <ListItemText primary="尚无测试日志" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 提示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PomodoroTester;