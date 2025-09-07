import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  InputAdornment,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Timer as TimerIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useUserStore } from '../../store/userStore';

// 从 userStore 导入默认设置
import { defaultPreferences } from '../../store/userStore';

const UserSettings: React.FC = () => {
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
  
  // 本地状态
  const [localPomodoroSettings, setLocalPomodoroSettings] = useState(
    pomodoroSettings ? { ...pomodoroSettings } : { ...defaultPreferences.pomodoroSettings }
  );
  const [localNotificationSettings, setLocalNotificationSettings] = useState(
    notificationSettings ? { ...notificationSettings } : { ...defaultPreferences.notificationSettings }
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('设置已保存');
  
  // 在组件挂载时初始化设置
  useEffect(() => {
    console.log('UserSettings组件 - 设置更新:', {
      pomodoroSettings,
      notificationSettings
    });
    
    // 始终使用从currentUser中获取的最新设置
    setLocalPomodoroSettings({ ...pomodoroSettings });
    setLocalNotificationSettings({ ...notificationSettings });
    
    console.log('UserSettings组件 - 本地设置已更新为:', {
      localPomodoroSettings: { ...pomodoroSettings },
      localNotificationSettings: { ...notificationSettings }
    });
  }, [pomodoroSettings, notificationSettings]);
  
  // 处理番茄钟设置变化
  const handlePomodoroSettingChange = (setting: string, value: number) => {
    setLocalPomodoroSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // 处理通知设置变化
  const handleNotificationSettingChange = (setting: string, value: boolean) => {
    setLocalNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // 处理声音选择变化
  const handleSoundChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    setLocalNotificationSettings(prev => ({
      ...prev,
      sound: event.target.value as string
    }));
  };
  
  // 保存设置
  const saveSettings = () => {
    updatePomodoroSettings(localPomodoroSettings);
    updateNotificationSettings(localNotificationSettings);
    setSnackbarMessage('设置已保存');
    setSnackbarOpen(true);
    
    // 添加日志，帮助调试设置保存
    console.log('保存设置:', {
      pomodoroSettings: localPomodoroSettings,
      notificationSettings: localNotificationSettings
    });
  };
  
  // 关闭提示
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        用户设置
      </Typography>
      
      <Grid container spacing={3}>
        {/* 番茄钟设置 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TimerIcon />
                </Avatar>
              }
              title="番茄钟设置"
            />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography id="work-duration-slider" gutterBottom>
                  番茄钟工作时长 (分钟)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={localPomodoroSettings.workDuration}
                      onChange={(_, value) => handlePomodoroSettingChange('workDuration', value as number)}
                      aria-labelledby="work-duration-slider"
                      valueLabelDisplay="auto"
                      step={5}
                      marks
                      min={15}
                      max={60}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      value={localPomodoroSettings.workDuration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 25;
                        handlePomodoroSettingChange('workDuration', value);
                      }}
                      inputProps={{
                        step: 5,
                        min: 15,
                        max: 60,
                        type: 'number',
                      }}
                      sx={{ width: 80 }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography id="short-break-slider" gutterBottom>
                  短休息时长 (分钟)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={localPomodoroSettings.shortBreakDuration}
                      onChange={(_, value) => handlePomodoroSettingChange('shortBreakDuration', value as number)}
                      aria-labelledby="short-break-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={3}
                      max={10}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      value={localPomodoroSettings.shortBreakDuration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 5;
                        handlePomodoroSettingChange('shortBreakDuration', value);
                      }}
                      inputProps={{
                        step: 1,
                        min: 3,
                        max: 10,
                        type: 'number',
                      }}
                      sx={{ width: 80 }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography id="long-break-slider" gutterBottom>
                  长休息时长 (分钟)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={localPomodoroSettings.longBreakDuration}
                      onChange={(_, value) => handlePomodoroSettingChange('longBreakDuration', value as number)}
                      aria-labelledby="long-break-slider"
                      valueLabelDisplay="auto"
                      step={5}
                      marks
                      min={15}
                      max={30}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      value={localPomodoroSettings.longBreakDuration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 15;
                        handlePomodoroSettingChange('longBreakDuration', value);
                      }}
                      inputProps={{
                        step: 5,
                        min: 15,
                        max: 30,
                        type: 'number',
                      }}
                      sx={{ width: 80 }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography id="long-break-interval-slider" gutterBottom>
                  长休息间隔 (番茄钟数)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={localPomodoroSettings.longBreakInterval}
                      onChange={(_, value) => handlePomodoroSettingChange('longBreakInterval', value as number)}
                      aria-labelledby="long-break-interval-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={2}
                      max={6}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      value={localPomodoroSettings.longBreakInterval}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 4;
                        handlePomodoroSettingChange('longBreakInterval', value);
                      }}
                      inputProps={{
                        step: 1,
                        min: 2,
                        max: 6,
                        type: 'number',
                      }}
                      sx={{ width: 80 }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPomodoroSettings.autoStartBreaks}
                      onChange={(e) => handlePomodoroSettingChange('autoStartBreaks', e.target.checked ? 1 : 0)}
                    />
                  }
                  label="自动开始休息"
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPomodoroSettings.autoStartPomodoros}
                      onChange={(e) => handlePomodoroSettingChange('autoStartPomodoros', e.target.checked ? 1 : 0)}
                    />
                  }
                  label="休息后自动开始下一个番茄钟"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 通知和主题设置 */}
        <Grid item xs={12} md={6}>
          <Grid container direction="column" spacing={3}>
            {/* 通知设置 */}
            <Grid item>
              <Card elevation={2}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <NotificationsIcon />
                    </Avatar>
                  }
                  title="通知设置"
                />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localNotificationSettings.pomodoroEnd}
                          onChange={(e) => handleNotificationSettingChange('pomodoroEnd', e.target.checked)}
                        />
                      }
                      label="番茄钟结束时通知"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localNotificationSettings.breakEnd}
                          onChange={(e) => handleNotificationSettingChange('breakEnd', e.target.checked)}
                        />
                      }
                      label="休息结束时通知"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localNotificationSettings.playSound}
                          onChange={(e) => handleNotificationSettingChange('playSound', e.target.checked)}
                        />
                      }
                      label="播放声音"
                    />
                  </Box>
                  
                  {localNotificationSettings.playSound && (
                    <Box sx={{ mb: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>通知声音</InputLabel>
                        <Select
                          value={localNotificationSettings.sound}
                          onChange={handleSoundChange}
                          label="通知声音"
                        >
                          <MenuItem value="bell">铃声</MenuItem>
                          <MenuItem value="digital">数字音</MenuItem>
                          <MenuItem value="gentle">柔和提示音</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* 主题设置 */}
            <Grid item>
              <Card elevation={2}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <PaletteIcon />
                    </Avatar>
                  }
                  title="主题设置"
                />
                <Divider />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      深色模式
                    </Typography>
                    <Switch
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                      color="primary"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      {/* 保存按钮 */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          size="large"
        >
          保存设置
        </Button>
      </Box>
      
      {/* 保存成功提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserSettings;