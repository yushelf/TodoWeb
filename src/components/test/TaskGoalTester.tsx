import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  ListItemSecondaryAction
} from '@mui/material';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { v4 as uuidv4 } from 'uuid';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface TestResult {
  success: boolean;
  message: string;
}

interface TestResults {
  taskCreation?: TestResult;
  taskUpdate?: TestResult;
  taskDelete?: TestResult;
  taskStatusChange?: TestResult;
  goalCreation?: TestResult;
  goalUpdate?: TestResult;
  goalDelete?: TestResult;
  goalTaskAssociation?: TestResult;
  goalProgress?: TestResult;
}

const TaskGoalTester: React.FC = () => {
  // 状态管理
  const [testResults, setTestResults] = useState<TestResults>({});
  const [testLog, setTestLog] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // 测试任务表单状态
  const [taskTitle, setTaskTitle] = useState('测试任务');
  const [taskDescription, setTaskDescription] = useState('这是一个测试任务的描述');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskQuadrant, setTaskQuadrant] = useState<'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent'>('important_urgent');
  
  // 测试目标表单状态
  const [goalTitle, setGoalTitle] = useState('测试目标');
  const [goalDescription, setGoalDescription] = useState('这是一个测试目标的描述');
  const [goalCategory, setGoalCategory] = useState('工作');
  const [goalType, setGoalType] = useState<'long-term' | 'mid-term' | 'short-term'>('short-term');
  
  // 测试ID状态
  const [testTaskId, setTestTaskId] = useState<string | null>(null);
  const [testGoalId, setTestGoalId] = useState<string | null>(null);
  
  // 从Store获取方法
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    startTask,
    completeTask,
    cancelTask,
    getTaskById
  } = useTaskStore();
  
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    abandonGoal,
    updateGoalProgress,
    addTaskToGoal,
    removeTaskFromGoal,
    getGoalById
  } = useGoalStore();
  
  // 添加测试日志
  const addTestLog = (message: string) => {
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // 测试任务创建
  const testTaskCreation = async () => {
    try {
      addTestLog('开始测试任务创建功能');
      setIsRunningTest(true);
      
      // 创建任务
      const taskId = addTask({
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        quadrant: taskQuadrant,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      
      setTestTaskId(taskId);
      addTestLog(`创建了测试任务，ID: ${taskId}`);
      
      // 验证任务是否创建成功
      const createdTask = getTaskById(taskId);
      const success = !!createdTask;
      
      addTestLog(`任务创建${success ? '成功' : '失败'}`);
      
      setTestResults(prev => ({
        ...prev,
        taskCreation: {
          success,
          message: success 
            ? `任务创建成功: ID=${taskId}, 标题=${createdTask?.title}` 
            : '任务创建失败: 无法找到新创建的任务'
        }
      }));
      
      setSnackbarMessage(success ? '任务创建测试通过' : '任务创建测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试任务创建时出错:', error);
      setTestResults(prev => ({
        ...prev,
        taskCreation: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('任务创建测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 测试任务更新
  const testTaskUpdate = async () => {
    try {
      addTestLog('开始测试任务更新功能');
      setIsRunningTest(true);
      
      // 确保有测试任务
      const taskId = testTaskId || await createTestTask();
      
      // 记录初始状态
      const initialTask = getTaskById(taskId);
      addTestLog(`初始任务: ${initialTask?.title}, ${initialTask?.description}`);
      
      // 更新任务
      const newTitle = `更新的任务 ${new Date().toLocaleTimeString()}`;
      updateTask(taskId, { title: newTitle });
      addTestLog(`更新了任务标题: ${newTitle}`);
      
      // 验证更新是否成功
      const updatedTask = getTaskById(taskId);
      const success = updatedTask?.title === newTitle;
      
      addTestLog(`任务更新${success ? '成功' : '失败'}`);
      
      setTestResults(prev => ({
        ...prev,
        taskUpdate: {
          success,
          message: success 
            ? `任务更新成功: 新标题=${updatedTask?.title}` 
            : `任务更新失败: 期望标题=${newTitle}, 实际标题=${updatedTask?.title}`
        }
      }));
      
      setSnackbarMessage(success ? '任务更新测试通过' : '任务更新测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试任务更新时出错:', error);
      setTestResults(prev => ({
        ...prev,
        taskUpdate: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('任务更新测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 测试任务状态变更
  const testTaskStatusChange = async () => {
    try {
      addTestLog('开始测试任务状态变更功能');
      setIsRunningTest(true);
      
      // 确保有测试任务
      const taskId = testTaskId || await createTestTask();
      
      // 记录初始状态
      const initialTask = getTaskById(taskId);
      addTestLog(`初始任务状态: ${initialTask?.status}`);
      
      // 开始任务
      startTask(taskId);
      await new Promise(resolve => setTimeout(resolve, 300));
      const startedTask = getTaskById(taskId);
      addTestLog(`开始任务后状态: ${startedTask?.status}`);
      
      // 完成任务
      completeTask(taskId);
      await new Promise(resolve => setTimeout(resolve, 300));
      const completedTask = getTaskById(taskId);
      addTestLog(`完成任务后状态: ${completedTask?.status}`);
      
      // 创建新任务并取消
      const cancelTaskId = await createTestTask('测试取消任务');
      cancelTask(cancelTaskId);
      await new Promise(resolve => setTimeout(resolve, 300));
      const cancelledTask = getTaskById(cancelTaskId);
      addTestLog(`取消任务后状态: ${cancelledTask?.status}`);
      
      // 验证状态变更是否成功
      const startSuccess = startedTask?.status === 'in_progress';
      const completeSuccess = completedTask?.status === 'completed';
      const cancelSuccess = cancelledTask?.status === 'cancelled';
      
      const success = startSuccess && completeSuccess && cancelSuccess;
      
      addTestLog(`任务状态变更测试${success ? '通过' : '失败'}`);
      
      setTestResults(prev => ({
        ...prev,
        taskStatusChange: {
          success,
          message: success 
            ? '任务状态变更成功: 开始->进行中->完成，取消操作正常' 
            : `任务状态变更失败: 开始=${startSuccess}, 完成=${completeSuccess}, 取消=${cancelSuccess}`
        }
      }));
      
      setSnackbarMessage(success ? '任务状态变更测试通过' : '任务状态变更测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试任务状态变更时出错:', error);
      setTestResults(prev => ({
        ...prev,
        taskStatusChange: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('任务状态变更测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 测试任务删除
  const testTaskDelete = async () => {
    try {
      addTestLog('开始测试任务删除功能');
      setIsRunningTest(true);
      
      // 清空所有现有任务，确保测试环境干净
      const initialTasks = useTaskStore.getState().tasks;
      initialTasks.forEach(task => deleteTask(task.id));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 创建一个新任务用于删除测试
      const taskId = await createTestTask('待删除任务');
      addTestLog(`创建了待删除任务，ID: ${taskId}`);
      
      // 等待任务创建完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 获取当前任务列表并记录初始任务数量
      const tasksBeforeDelete = useTaskStore.getState().tasks;
      const initialTaskCount = tasksBeforeDelete.length;
      addTestLog(`初始任务数量: ${initialTaskCount}`);
      
      // 删除任务
      deleteTask(taskId);
      addTestLog(`删除了任务，ID: ${taskId}`);
      
      // 等待删除操作完成（增加等待时间，确保异步操作完成）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取最新的任务列表
      const currentTasks = useTaskStore.getState().tasks;
      const taskExists = currentTasks.some(task => task.id === taskId);
      const newTaskCount = currentTasks.length;
      
      const success = !taskExists && newTaskCount === initialTaskCount - 1;
      
      addTestLog(`任务删除${success ? '成功' : '失败'}`);
      addTestLog(`当前任务数量: ${newTaskCount}`);
      
      setTestResults(prev => ({
        ...prev,
        taskDelete: {
          success,
          message: success 
            ? `任务删除成功: 任务数量从${initialTaskCount}减少到${newTaskCount}` 
            : `任务删除失败: 任务${taskExists ? '仍然存在' : '已删除'}, 任务数量从${initialTaskCount}变为${newTaskCount}`
        }
      }));
      
      setSnackbarMessage(success ? '任务删除测试通过' : '任务删除测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试任务删除时出错:', error);
      setTestResults(prev => ({
        ...prev,
        taskDelete: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('任务删除测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 测试目标创建
  const testGoalCreation = async () => {
    try {
      addTestLog('开始测试目标创建功能');
      setIsRunningTest(true);
      
      // 创建目标
      const goalId = addGoal({
        title: goalTitle,
        description: goalDescription,
        category: goalCategory,
        type: goalType,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      setTestGoalId(goalId);
      addTestLog(`创建了测试目标，ID: ${goalId}`);
      
      // 验证目标是否创建成功
      const createdGoal = getGoalById(goalId);
      const success = !!createdGoal;
      
      addTestLog(`目标创建${success ? '成功' : '失败'}`);
      
      setTestResults(prev => ({
        ...prev,
        goalCreation: {
          success,
          message: success 
            ? `目标创建成功: ID=${goalId}, 标题=${createdGoal?.title}` 
            : '目标创建失败: 无法找到新创建的目标'
        }
      }));
      
      setSnackbarMessage(success ? '目标创建测试通过' : '目标创建测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试目标创建时出错:', error);
      setTestResults(prev => ({
        ...prev,
        goalCreation: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('目标创建测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 测试目标更新
  const testGoalUpdate = async () => {
    try {
      addTestLog('开始测试目标更新功能');
      setIsRunningTest(true);
      
      // 确保有测试目标
      const goalId = testGoalId || await createTestGoal();
      
      // 记录初始状态
      const initialGoal = getGoalById(goalId);
      addTestLog(`初始目标: ${initialGoal?.title}, ${initialGoal?.description}`);
      
      // 更新目标
      const newTitle = `更新的目标 ${new Date().toLocaleTimeString()}`;
      updateGoal(goalId, { title: newTitle });
      addTestLog(`更新了目标标题: ${newTitle}`);
      
      // 验证更新是否成功
      const updatedGoal = getGoalById(goalId);
      const success = updatedGoal?.title === newTitle;
      
      addTestLog(`目标更新${success ? '成功' : '失败'}`);
      
      setTestResults(prev => ({
        ...prev,
        goalUpdate: {
          success,
          message: success 
            ? `目标更新成功: 新标题=${updatedGoal?.title}` 
            : `目标更新失败: 期望标题=${newTitle}, 实际标题=${updatedGoal?.title}`
        }
      }));
      
      setSnackbarMessage(success ? '目标更新测试通过' : '目标更新测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试目标更新时出错:', error);
      setTestResults(prev => ({
        ...prev,
        goalUpdate: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('目标更新测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 测试目标删除
  const testGoalDelete = async () => {
    try {
      addTestLog('开始测试目标删除功能');
      setIsRunningTest(true);
      
      // 清空所有现有目标，确保测试环境干净
      const initialGoals = useGoalStore.getState().goals;
      initialGoals.forEach(goal => deleteGoal(goal.id));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 创建一个新目标用于删除测试
      const goalId = await createTestGoal('待删除目标');
      addTestLog(`创建了待删除目标，ID: ${goalId}`);
      
      // 等待目标创建完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 获取当前目标列表并记录初始目标数量
      const goalsBeforeDelete = useGoalStore.getState().goals;
      const initialGoalCount = goalsBeforeDelete.length;
      addTestLog(`初始目标数量: ${initialGoalCount}`);
      
      // 删除目标
      deleteGoal(goalId);
      addTestLog(`删除了目标，ID: ${goalId}`);
      
      // 等待删除操作完成（增加等待时间，确保异步操作完成）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取最新的目标列表
      const currentGoals = useGoalStore.getState().goals;
      const goalExists = currentGoals.some(goal => goal.id === goalId);
      const newGoalCount = currentGoals.length;
      
      const success = !goalExists && newGoalCount === initialGoalCount - 1;
      
      addTestLog(`目标删除${success ? '成功' : '失败'}`);
      addTestLog(`当前目标数量: ${newGoalCount}`);
      
      setTestResults(prev => ({
        ...prev,
        goalDelete: {
          success,
          message: success 
            ? `目标删除成功: 目标数量从${initialGoalCount}减少到${newGoalCount}` 
            : `目标删除失败: 目标${goalExists ? '仍然存在' : '已删除'}, 目标数量从${initialGoalCount}变为${newGoalCount}`
        }
      }));
      
      setSnackbarMessage(success ? '目标删除测试通过' : '目标删除测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试目标删除时出错:', error);
      setTestResults(prev => ({
        ...prev,
        goalDelete: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('目标删除测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 测试目标与任务关联
  const testGoalTaskAssociation = async () => {
    try {
      addTestLog('开始测试目标与任务关联功能');
      setIsRunningTest(true);
      
      // 创建测试目标和任务
      const goalId = testGoalId || await createTestGoal();
      const taskId = testTaskId || await createTestTask();
      
      addTestLog(`测试目标ID: ${goalId}, 测试任务ID: ${taskId}`);
      
      // 关联任务到目标
      addTaskToGoal(goalId, taskId);
      addTestLog(`关联任务到目标`);
      
      // 更新任务的goalId
      updateTask(taskId, { goalId });
      addTestLog(`更新任务的goalId`);
      
      // 验证关联是否成功
      const goal = getGoalById(goalId);
      const task = getTaskById(taskId);
      
      const goalHasTask = goal?.tasks.includes(taskId);
      const taskHasGoal = task?.goalId === goalId;
      
      const success = goalHasTask && taskHasGoal;
      
      addTestLog(`目标包含任务: ${goalHasTask ? '是' : '否'}`);
      addTestLog(`任务关联目标: ${taskHasGoal ? '是' : '否'}`);
      
      // 测试移除关联
      removeTaskFromGoal(goalId, taskId);
      updateTask(taskId, { goalId: undefined });
      addTestLog(`移除任务与目标的关联`);
      
      // 验证移除是否成功
      const updatedGoal = getGoalById(goalId);
      const updatedTask = getTaskById(taskId);
      
      const goalNoTask = !updatedGoal?.tasks.includes(taskId);
      const taskNoGoal = !updatedTask?.goalId;
      
      const removeSuccess = goalNoTask && taskNoGoal;
      
      addTestLog(`目标不包含任务: ${goalNoTask ? '是' : '否'}`);
      addTestLog(`任务不关联目标: ${taskNoGoal ? '是' : '否'}`);
      
      const overallSuccess = success && removeSuccess;
      
      setTestResults(prev => ({
        ...prev,
        goalTaskAssociation: {
          success: overallSuccess,
          message: overallSuccess 
            ? '目标与任务关联和解除关联测试通过' 
            : `目标与任务关联测试失败: 关联=${success}, 解除关联=${removeSuccess}`
        }
      }));
      
      setSnackbarMessage(overallSuccess ? '目标与任务关联测试通过' : '目标与任务关联测试失败');
      setSnackbarSeverity(overallSuccess ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试目标与任务关联时出错:', error);
      setTestResults(prev => ({
        ...prev,
        goalTaskAssociation: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('目标与任务关联测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 测试目标进度更新
  const testGoalProgress = async () => {
    try {
      addTestLog('开始测试目标进度更新功能');
      setIsRunningTest(true);
      
      // 创建测试目标
      const goalId = testGoalId || await createTestGoal();
      
      // 记录初始进度
      const initialGoal = getGoalById(goalId);
      const initialProgress = initialGoal?.progress || 0;
      addTestLog(`初始目标进度: ${initialProgress}%`);
      
      // 更新进度
      const newProgress = 75;
      updateGoalProgress(goalId, newProgress);
      addTestLog(`更新目标进度为: ${newProgress}%`);
      
      // 验证进度更新是否成功
      const updatedGoal = getGoalById(goalId);
      const success = updatedGoal?.progress === newProgress;
      
      addTestLog(`目标进度更新${success ? '成功' : '失败'}`);
      addTestLog(`当前目标进度: ${updatedGoal?.progress}%`);
      
      setTestResults(prev => ({
        ...prev,
        goalProgress: {
          success,
          message: success 
            ? `目标进度更新成功: ${initialProgress}% -> ${newProgress}%` 
            : `目标进度更新失败: 期望=${newProgress}%, 实际=${updatedGoal?.progress}%`
        }
      }));
      
      setSnackbarMessage(success ? '目标进度更新测试通过' : '目标进度更新测试失败');
      setSnackbarSeverity(success ? 'success' : 'error');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('测试目标进度更新时出错:', error);
      setTestResults(prev => ({
        ...prev,
        goalProgress: {
          success: false,
          message: `测试出错: ${error instanceof Error ? error.message : String(error)}`
        }
      }));
      setSnackbarMessage('目标进度更新测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // 运行所有测试
  const runAllTests = async () => {
    addTestLog('开始运行所有测试');
    await testTaskCreation();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testTaskUpdate();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testTaskStatusChange();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGoalCreation();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGoalUpdate();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGoalTaskAssociation();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGoalProgress();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testTaskDelete();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGoalDelete();
    addTestLog('所有测试运行完成');
  };
  
  // 辅助函数：创建测试任务
  const createTestTask = async (title = '测试任务') => {
    const taskId = addTask({
      title: `${title} ${new Date().toLocaleTimeString()}`,
      description: '这是一个测试任务',
      priority: 'medium',
      quadrant: 'important_urgent',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    return taskId;
  };
  
  // 辅助函数：创建测试目标
  const createTestGoal = async (title = '测试目标') => {
    const goalId = addGoal({
      title: `${title} ${new Date().toLocaleTimeString()}`,
      description: '这是一个测试目标',
      category: '测试',
      type: 'short-term',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    return goalId;
  };
  
  // 关闭提示
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // 清除测试日志
  const clearTestLog = () => {
    setTestLog([]);
  };
  
  // 清除测试结果
  const clearTestResults = () => {
    setTestResults({});
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>任务与目标管理测试</Typography>
      
      <Grid container spacing={3}>
        {/* 测试控制卡片 */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader title="测试控制" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={runAllTests}
                    disabled={isRunningTest}
                  >
                    运行所有测试
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth
                    onClick={clearTestResults}
                    disabled={isRunningTest}
                  >
                    清除测试结果
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth
                    onClick={clearTestLog}
                    disabled={isRunningTest}
                  >
                    清除测试日志
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 任务测试卡片 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="任务管理测试" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="任务标题"
                    variant="outlined"
                    fullWidth
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    disabled={isRunningTest}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="任务描述"
                    variant="outlined"
                    fullWidth
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    disabled={isRunningTest}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>优先级</InputLabel>
                    <Select
                      value={taskPriority}
                      label="优先级"
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      disabled={isRunningTest}
                    >
                      <MenuItem value="high">高</MenuItem>
                      <MenuItem value="medium">中</MenuItem>
                      <MenuItem value="low">低</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>象限</InputLabel>
                    <Select
                      value={taskQuadrant}
                      label="象限"
                      onChange={(e) => setTaskQuadrant(e.target.value as any)}
                      disabled={isRunningTest}
                    >
                      <MenuItem value="important_urgent">重要且紧急</MenuItem>
                      <MenuItem value="important_not_urgent">重要不紧急</MenuItem>
                      <MenuItem value="not_important_urgent">不重要但紧急</MenuItem>
                      <MenuItem value="not_important_not_urgent">不重要不紧急</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testTaskCreation}
                    disabled={isRunningTest}
                  >
                    测试任务创建
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testTaskUpdate}
                    disabled={isRunningTest}
                  >
                    测试任务更新
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testTaskStatusChange}
                    disabled={isRunningTest}
                  >
                    测试任务状态变更
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testTaskDelete}
                    disabled={isRunningTest}
                  >
                    测试任务删除
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 目标测试卡片 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="目标管理测试" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="目标标题"
                    variant="outlined"
                    fullWidth
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    disabled={isRunningTest}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="目标描述"
                    variant="outlined"
                    fullWidth
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    disabled={isRunningTest}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="目标类别"
                    variant="outlined"
                    fullWidth
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    disabled={isRunningTest}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>目标类型</InputLabel>
                    <Select
                      value={goalType}
                      label="目标类型"
                      onChange={(e) => setGoalType(e.target.value as any)}
                      disabled={isRunningTest}
                    >
                      <MenuItem value="long-term">长期</MenuItem>
                      <MenuItem value="mid-term">中期</MenuItem>
                      <MenuItem value="short-term">短期</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testGoalCreation}
                    disabled={isRunningTest}
                  >
                    测试目标创建
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testGoalUpdate}
                    disabled={isRunningTest}
                  >
                    测试目标更新
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testGoalTaskAssociation}
                    disabled={isRunningTest}
                  >
                    测试目标任务关联
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testGoalProgress}
                    disabled={isRunningTest}
                  >
                    测试目标进度
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={testGoalDelete}
                    disabled={isRunningTest}
                  >
                    测试目标删除
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 测试结果卡片 */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader title="测试结果" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {Object.entries(testResults).map(([testName, result]) => (
                  <Grid item xs={12} key={testName}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                          {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                        <Chip 
                          label={result.success ? '通过' : '失败'} 
                          color={result.success ? 'success' : 'error'} 
                          size="small" 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {result.message}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
                
                {Object.keys(testResults).length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" align="center">
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
          <Card elevation={2}>
            <CardHeader 
              title="测试日志" 
              action={
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={clearTestLog}
                  disabled={isRunningTest}
                >
                  清除日志
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Paper 
                elevation={0} 
                sx={{ 
                  bgcolor: 'background.default', 
                  p: 2, 
                  maxHeight: 300, 
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <List dense>
                  {testLog.map((log, index) => (
                    <ListItem key={index} divider={index < testLog.length - 1}>
                      <ListItemText 
                        primary={log} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontFamily: 'monospace'
                        }} 
                      />
                    </ListItem>
                  ))}
                  
                  {testLog.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary="尚无测试日志" 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          color: 'text.secondary',
                          align: 'center'
                        }} 
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
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
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskGoalTester;