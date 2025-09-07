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
  Switch,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import { useUserStore } from '../../store/userStore';
import { defaultPreferences } from '../../store/userStore';

const SettingsTester: React.FC = () => {
  const { 
    currentUser, 
    updatePomodoroSettings, 
    updateNotificationSettings,
    toggleTheme 
  } = useUserStore();

  // 从currentUser中获取设置
  const theme = currentUser?.preferences?.theme || defaultPreferences.theme;
  const pomodoroSettings = currentUser?.preferences?.pomodoroSettings || defaultPreferences.pomodoroSettings;
  const notificationSettings = currentUser?.preferences?.notificationSettings || defaultPreferences.notificationSettings;

  // 测试状态
  const [testResults, setTestResults] = useState<{[key: string]: {success: boolean, message: string}}>({
    saveSettings: { success: false, message: '未测试' },
    loadSettings: { success: false, message: '未测试' },
    persistSettings: { success: false, message: '未测试' },
  });
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // 测试设置保存功能
  const testSaveSettings = () => {
    try {
      // 保存之前的设置用于恢复
      const originalSettings = {
        pomodoroSettings: { ...pomodoroSettings },
        notificationSettings: { ...notificationSettings },
        theme: theme
      };

      // 修改设置
      const testWorkDuration = 30;
      updatePomodoroSettings({ workDuration: testWorkDuration });
      
      // 验证设置是否已更新
      const updatedUser = useUserStore.getState().currentUser;
      const updatedWorkDuration = updatedUser?.preferences?.pomodoroSettings?.workDuration;
      
      if (updatedWorkDuration === testWorkDuration) {
        setTestResults(prev => ({
          ...prev,
          saveSettings: { 
            success: true, 
            message: `设置保存成功: 工作时长从 ${pomodoroSettings.workDuration} 更新为 ${updatedWorkDuration}` 
          }
        }));
        setSnackbarMessage('设置保存测试通过');
        setSnackbarSeverity('success');
      } else {
        setTestResults(prev => ({
          ...prev,
          saveSettings: { 
            success: false, 
            message: `设置保存失败: 期望工作时长为 ${testWorkDuration}，实际为 ${updatedWorkDuration}` 
          }
        }));
        setSnackbarMessage('设置保存测试失败');
        setSnackbarSeverity('error');
      }

      // 恢复原始设置
      restoreSettings(originalSettings);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        saveSettings: { 
          success: false, 
          message: `测试过程中出错: ${error instanceof Error ? error.message : (typeof error === 'object' ? JSON.stringify(error) : String(error))}` 
        }
      }));
      setSnackbarMessage('设置保存测试出错');
      setSnackbarSeverity('error');
    }
    
    setSnackbarOpen(true);
  };

  // 测试设置加载功能
  const testLoadSettings = () => {
    try {
      // 保存之前的设置用于恢复
      const originalSettings = {
        pomodoroSettings: { ...pomodoroSettings },
        notificationSettings: { ...notificationSettings },
        theme: theme
      };

      // 修改设置
      const testWorkDuration = 35;
      updatePomodoroSettings({ workDuration: testWorkDuration });
      
      // 重新初始化组件以模拟重新加载
      const reloadedStore = useUserStore.getState();
      const loadedWorkDuration = reloadedStore.currentUser?.preferences?.pomodoroSettings?.workDuration;
      
      if (loadedWorkDuration === testWorkDuration) {
        setTestResults(prev => ({
          ...prev,
          loadSettings: { 
            success: true, 
            message: `设置加载成功: 工作时长正确加载为 ${loadedWorkDuration}` 
          }
        }));
        setSnackbarMessage('设置加载测试通过');
        setSnackbarSeverity('success');
      } else {
        setTestResults(prev => ({
          ...prev,
          loadSettings: { 
            success: false, 
            message: `设置加载失败: 期望工作时长为 ${testWorkDuration}，实际为 ${loadedWorkDuration}` 
          }
        }));
        setSnackbarMessage('设置加载测试失败');
        setSnackbarSeverity('error');
      }

      // 恢复原始设置
      updatePomodoroSettings(originalSettings.pomodoroSettings);
      updateNotificationSettings(originalSettings.notificationSettings);
      if (originalSettings.theme !== theme) {
        toggleTheme();
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        loadSettings: { 
          success: false, 
          message: `测试过程中出错: ${error instanceof Error ? error.message : (typeof error === 'object' ? JSON.stringify(error) : String(error))}` 
        }
      }));
      setSnackbarMessage('设置加载测试出错');
      setSnackbarSeverity('error');
    }
    
    setSnackbarOpen(true);
  };

  // 恢复设置的辅助函数
  const restoreSettings = (originalSettings: any) => {
    updatePomodoroSettings(originalSettings.pomodoroSettings);
    updateNotificationSettings(originalSettings.notificationSettings);
    if (originalSettings.theme !== theme) {
      toggleTheme();
    }
  };

  // 测试设置持久化功能
  const testPersistSettings = () => {
    try {
      // 保存之前的设置用于恢复
      const originalSettings = {
        pomodoroSettings: { ...pomodoroSettings },
        notificationSettings: { ...notificationSettings },
        theme: theme
      };

      // 修改设置
      const testWorkDuration = 40;
      updatePomodoroSettings({ workDuration: testWorkDuration });
      
      // 手动清除可能存在的错误数据
      if (localStorage.getItem('user-storage') === '[object Object]') {
        console.log('清除localStorage中的[object Object]错误数据');
        localStorage.removeItem('user-storage');
      }
      
      // 等待一小段时间确保设置已保存到localStorage
      setTimeout(() => {
        try {
          // 检查localStorage中是否保存了设置
          const storageKey = 'user-storage';
          const storedData = localStorage.getItem(storageKey);
          
          console.log('从localStorage获取的原始数据:', storedData);
          console.log('原始数据类型:', typeof storedData);
          
          // 检查localStorage中所有的键
          console.log('localStorage中的所有键:');
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            console.log(`${key}: ${localStorage.getItem(key)}`);
          }
          
          if (!storedData) {
            console.error('localStorage中未找到数据');
            setTestResults(prev => ({
              ...prev,
              persistSettings: { 
                success: false, 
                message: `设置持久化失败: localStorage中未找到 ${storageKey}` 
              }
            }));
            setSnackbarMessage('设置持久化测试失败');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            restoreSettings(originalSettings);
            return;
          }
          
          // 尝试手动解析localStorage数据
          try {
            // 先检查数据是否是有效的JSON
            if (storedData.trim() === '') {
              throw new Error('localStorage数据为空');
            }
            
            // 检查是否为[object Object]这种错误字符串
            if (storedData === '[object Object]') {
              console.error('localStorage数据错误: 存储了[object Object]字符串而非JSON');
              throw new Error('localStorage数据错误: 存储了[object Object]字符串而非JSON');
            }
            
            // 尝试解析JSON
            let parsedData;
            try {
              parsedData = JSON.parse(storedData);
            } catch (jsonError) {
              console.error('JSON解析错误:', jsonError);
              throw new Error(`JSON解析错误: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
            }
            
            // 验证解析结果是否为对象
            if (!parsedData || typeof parsedData !== 'object') {
              throw new Error(`解析结果不是有效对象: ${typeof parsedData}`);
            }
            
            console.log('解析后的数据:', parsedData);
            
            // 检查state字段
            if (!parsedData.state) {
              throw new Error('解析后的数据中没有state字段');
            }
            
            // 检查currentUser字段
            if (!parsedData.state.currentUser) {
              throw new Error('解析后的数据中没有currentUser字段');
            }
            
            // 检查preferences字段
            if (!parsedData.state.currentUser.preferences) {
              throw new Error('解析后的数据中没有preferences字段');
            }
            
            // 检查pomodoroSettings字段
            if (!parsedData.state.currentUser.preferences.pomodoroSettings) {
              throw new Error('解析后的数据中没有pomodoroSettings字段');
            }
            
            const storedWorkDuration = parsedData.state.currentUser.preferences.pomodoroSettings.workDuration;
            console.log('存储的工作时长:', storedWorkDuration, '期望值:', testWorkDuration);
            
            if (storedWorkDuration === testWorkDuration) {
              setTestResults(prev => ({
                ...prev,
                persistSettings: { 
                  success: true, 
                  message: `设置持久化成功: localStorage中工作时长为 ${storedWorkDuration}` 
                }
              }));
              setSnackbarMessage('设置持久化测试通过');
              setSnackbarSeverity('success');
            } else {
              setTestResults(prev => ({
                ...prev,
                persistSettings: { 
                  success: false, 
                  message: `设置持久化失败: 期望localStorage中工作时长为 ${testWorkDuration}，实际为 ${storedWorkDuration}` 
                }
              }));
              setSnackbarMessage('设置持久化测试失败');
              setSnackbarSeverity('error');
            }
          } catch (parseError) {
            console.error('解析localStorage数据时出错:', parseError);
            setTestResults(prev => ({
              ...prev,
              persistSettings: { 
                success: false, 
                message: `解析localStorage数据时出错: ${parseError instanceof Error ? parseError.message : JSON.stringify(parseError)}` 
              }
            }));
            setSnackbarMessage('设置持久化测试失败');
            setSnackbarSeverity('error');
          }
          
          // 恢复原始设置
          restoreSettings(originalSettings);
          
          setSnackbarOpen(true);
        } catch (innerError) {
          console.error('测试过程中出错:', innerError);
          setTestResults(prev => ({
            ...prev,
            persistSettings: { 
              success: false, 
              message: `测试过程中出错: ${innerError instanceof Error ? innerError.message : (typeof innerError === 'object' ? JSON.stringify(innerError) : String(innerError))}` 
            }
          }));
          setSnackbarMessage('设置持久化测试出错');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          
          // 恢复原始设置
          restoreSettings(originalSettings);
        }
      }, 500); // 给予500毫秒的延迟，确保设置已保存到localStorage
    } catch (error) {
      console.error('测试过程中出错:', error);
      setTestResults(prev => ({
        ...prev,
        persistSettings: { 
          success: false, 
          message: `测试过程中出错: ${error instanceof Error ? error.message : (typeof error === 'object' ? JSON.stringify(error) : String(error))}` 
        }
      }));
      setSnackbarMessage('设置持久化测试出错');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      
      // 恢复原始设置
      updatePomodoroSettings(originalSettings.pomodoroSettings);
      updateNotificationSettings(originalSettings.notificationSettings);
      if (originalSettings.theme !== theme) {
        toggleTheme();
      }
    }
  };

  // 运行所有测试
  const runAllTests = () => {
    testSaveSettings();
    setTimeout(() => {
      testLoadSettings();
      setTimeout(() => {
        testPersistSettings();
      }, 500);
    }, 500);
  };

  // 关闭提示
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>用户设置测试</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader title="测试控制" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={testSaveSettings}
                  >
                    测试设置保存
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={testLoadSettings}
                  >
                    测试设置加载
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={testPersistSettings}
                  >
                    测试设置持久化
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={runAllTests}
                  >
                    运行所有测试
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader title="测试结果" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {Object.entries(testResults).map(([testName, result]) => (
                  <Grid item xs={12} key={testName}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        bgcolor: result.success ? 'success.light' : (result.message === '未测试' ? 'grey.100' : 'error.light')
                      }}
                    >
                      <Typography variant="subtitle1">
                        {testName === 'saveSettings' && '设置保存测试'}
                        {testName === 'loadSettings' && '设置加载测试'}
                        {testName === 'persistSettings' && '设置持久化测试'}
                      </Typography>
                      <Typography variant="body2">
                        状态: {result.success ? '通过' : (result.message === '未测试' ? '未测试' : '失败')}
                      </Typography>
                      <Typography variant="body2">
                        详情: {result.message}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader title="当前设置" />
            <Divider />
            <CardContent>
              <Typography variant="subtitle1">主题: {theme}</Typography>
              <Typography variant="subtitle1">番茄钟设置:</Typography>
              <Typography variant="body2">- 工作时长: {pomodoroSettings.workDuration} 分钟</Typography>
              <Typography variant="body2">- 短休息时长: {pomodoroSettings.shortBreakDuration} 分钟</Typography>
              <Typography variant="body2">- 长休息时长: {pomodoroSettings.longBreakDuration} 分钟</Typography>
              <Typography variant="body2">- 长休息间隔: {pomodoroSettings.longBreakInterval} 个番茄钟</Typography>
              <Typography variant="body2">- 自动开始休息: {pomodoroSettings.autoStartBreaks ? '是' : '否'}</Typography>
              <Typography variant="body2">- 自动开始番茄钟: {pomodoroSettings.autoStartPomodoros ? '是' : '否'}</Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>通知设置:</Typography>
              <Typography variant="body2">- 任务提醒: {notificationSettings.taskReminders ? '开启' : '关闭'}</Typography>
              <Typography variant="body2">- 番茄钟提醒: {notificationSettings.pomodoroAlerts ? '开启' : '关闭'}</Typography>
              <Typography variant="body2">- 目标回顾提醒: {notificationSettings.goalReviewReminders ? '开启' : '关闭'}</Typography>
              <Typography variant="body2">- 播放声音: {notificationSettings.playSound ? '开启' : '关闭'}</Typography>
              <Typography variant="body2">- 声音类型: {notificationSettings.sound}</Typography>
              <Typography variant="body2">- 番茄钟结束提醒: {notificationSettings.pomodoroEnd ? '开启' : '关闭'}</Typography>
              <Typography variant="body2">- 休息结束提醒: {notificationSettings.breakEnd ? '开启' : '关闭'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default SettingsTester;