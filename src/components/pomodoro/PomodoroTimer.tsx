import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, LinearProgress, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import { PlayArrow, Pause, Stop, SkipNext, Notifications } from '@mui/icons-material';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { useTaskStore } from '../../store/taskStore';
import { formatTime } from '../../utils/timeUtils';
import { AudioType, playAudio, preloadAudios } from '../../services/audioService';
import { requestNotificationPermission, showPomodoroCompleteNotification, showBreakCompleteNotification } from '../../services/notificationService';

const PomodoroTimer: React.FC = () => {
  // 预加载音频并请求通知权限
  useEffect(() => {
    preloadAudios();
    requestNotificationPermission();
  }, []);
  
  // 通知权限状态
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  
  // 请求通知权限
  const handleRequestNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };
  
  // 初始化通知权限状态
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  // 从番茄钟存储中获取状态
  const { 
    status, 
    timeLeft, 
    totalTime, 
    currentTaskId,
    notes,
    startPomodoro, 
    pausePomodoro, 
    resumePomodoro, 
    stopPomodoro, 
    startBreak, 
    stopBreak,
    updateNotes,
    addInterruption
  } = usePomodoroStore();
  
  // 从任务存储中获取当前任务
  const getTaskById = useTaskStore(state => state.getTaskById);
  const currentTask = currentTaskId ? getTaskById(currentTaskId) : null;
  
  // 本地状态
  const [interruptionReason, setInterruptionReason] = useState('');
  const [showInterruptionInput, setShowInterruptionInput] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // 计时器效果
  useEffect(() => {
    let timer: number | null = null;
    
    if (status === 'working' || status === 'break') {
      timer = window.setInterval(() => {
        usePomodoroStore.getState().tick();
      }, 1000);
    }
    
    return () => {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, [status]);
  
  // 监听状态变化，播放相应的音效和显示通知
  useEffect(() => {
    const prevStatus = usePomodoroStore.getState().status;
    
    console.log('番茄钟状态变化:', { prevStatus, currentStatus: status, timeLeft, totalTime });
    
    // 当番茄钟完成时播放音效和显示通知
    if (prevStatus === 'working' && status === 'idle') {
      console.log('番茄钟完成，播放音效和显示通知');
      playAudio(AudioType.POMODORO_COMPLETE);
      showPomodoroCompleteNotification();
    }
    
    // 当休息完成时播放音效和显示通知
    if (prevStatus === 'break' && status === 'idle') {
      console.log('休息完成，播放音效和显示通知');
      playAudio(AudioType.BREAK_COMPLETE);
      showBreakCompleteNotification();
    }
  }, [status, timeLeft, totalTime]);
  
  // 处理开始番茄钟
  const handleStart = () => {
    startPomodoro(currentTaskId || undefined);
    playAudio(AudioType.BUTTON_CLICK, 0.5);
  };
  
  // 处理暂停/恢复番茄钟
  const handlePauseResume = () => {
    if (status === 'working') {
      pausePomodoro();
    } else if (status === 'paused') {
      resumePomodoro();
    }
    playAudio(AudioType.BUTTON_CLICK, 0.5);
  };
  
  // 处理停止番茄钟
  const handleStop = () => {
    if (status === 'working' || status === 'paused') {
      stopPomodoro(false);
    } else if (status === 'break') {
      stopBreak();
    }
    playAudio(AudioType.BUTTON_CLICK, 0.5);
  };
  
  // 处理跳过休息
  const handleSkipBreak = () => {
    if (status === 'break') {
      stopBreak();
    }
    playAudio(AudioType.BUTTON_CLICK, 0.5);
  };
  
  // 处理中断
  const handleInterruption = () => {
    // 暂停番茄钟
    if (status === 'working') {
      pausePomodoro();
    }
    setShowInterruptionInput(true);
  };
  
  // 提交中断
  const submitInterruption = () => {
    if (interruptionReason.trim()) {
      addInterruption(interruptionReason, 'internal');
      setInterruptionReason('');
      setShowInterruptionInput(false);
      // 显示提交成功的反馈
      setSnackbarMessage('中断原因已记录！');
      setSnackbarOpen(true);
      
      // 恢复番茄钟
      if (status === 'paused') {
        resumePomodoro();
      }
    }
  };
  
  // 计算进度
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  // 获取状态文本
  const getStatusText = () => {
    switch (status) {
      case 'working':
        return '专注工作中';
      case 'break':
        return '休息时间';
      case 'paused':
        return '已暂停';
      default:
        return '准备开始';
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mr: 1 }}>
          番茄钟
        </Typography>
        {notificationPermission !== 'granted' && (
          <IconButton 
            color="primary" 
            onClick={handleRequestNotificationPermission} 
            title="启用通知"
            sx={{ ml: 1 }}
          >
            <Notifications />
          </IconButton>
        )}
      </Box>
      
      {/* 当前任务 */}
      {currentTask && (
        <Typography variant="subtitle1" align="center" gutterBottom>
          当前任务: {currentTask.title}
        </Typography>
      )}
      
      {/* 状态显示 */}
      <Typography variant="subtitle2" align="center" color="text.secondary" gutterBottom>
        {getStatusText()}
      </Typography>
      
      {/* 进度条 */}
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        color={status === 'break' ? 'secondary' : 'primary'}
        sx={{ my: 2, height: 10, borderRadius: 5 }}
      />
      
      {/* 时间显示 */}
      <Typography variant="h2" align="center" sx={{ my: 3, fontWeight: 'bold' }}>
        {formatTime(timeLeft)}
      </Typography>
      
      {/* 控制按钮 */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        justifyContent: 'center', 
        gap: 2, 
        mb: 3 
      }}>
        {status === 'idle' && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PlayArrow />}
            onClick={handleStart}
            size="large"
            fullWidth
            sx={{ maxWidth: '200px' }}
          >
            开始专注
          </Button>
        )}
        
        {(status === 'working' || status === 'paused') && (
          <>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={status === 'working' ? <Pause /> : <PlayArrow />}
              onClick={handlePauseResume}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, mb: { xs: 1, sm: 0 } }}
            >
              {status === 'working' ? '暂停' : '继续'}
            </Button>
            
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<Stop />}
              onClick={handleStop}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, mb: { xs: 1, sm: 0 } }}
            >
              停止
            </Button>
            
            {status === 'working' && (
              <Button 
                variant="outlined" 
                color="warning" 
                onClick={handleInterruption}
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
              >
                记录中断
              </Button>
            )}
          </>
        )}
        
        {status === 'break' && (
          <>
            <Button 
              variant="outlined" 
              color="secondary" 
              startIcon={<SkipNext />}
              onClick={handleSkipBreak}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, mb: { xs: 1, sm: 0 } }}
            >
              跳过休息
            </Button>
            
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<Stop />}
              onClick={handleStop}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
            >
              停止
            </Button>
          </>
        )}
      </Box>
      
      {/* 中断输入 */}
      {showInterruptionInput && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="中断原因"
            value={interruptionReason}
            onChange={(e) => setInterruptionReason(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && submitInterruption()}
          />
          <Button variant="contained" onClick={submitInterruption}>
            提交
          </Button>
          <IconButton onClick={() => {
            setShowInterruptionInput(false);
            // 恢复番茄钟
            if (status === 'paused') {
              resumePomodoro();
            }
          }}>
            <Stop />
          </IconButton>
        </Box>
      )}
      
      {/* 笔记输入 */}
      {(status === 'working' || status === 'paused') && !showInterruptionInput && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="番茄钟笔记"
            placeholder="记录这个番茄钟期间的工作内容..."
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              if (notes.trim()) {
                // 保存笔记但不停止番茄钟
                updateNotes(notes);
                // 显示提交成功的反馈
                setSnackbarMessage('笔记已保存！');
                setSnackbarOpen(true);
              }
            }}
          >
            保存笔记
          </Button>
        </Box>
      )}
      {/* 提示消息 */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PomodoroTimer;