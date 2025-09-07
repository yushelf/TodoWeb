import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import UserSettings from '../components/settings/UserSettings';
import DataManagement from '../components/settings/DataManagement';
import { useUserStore } from '../store/userStore';

const SettingsPage: React.FC = () => {
  // 添加响应式设计相关的钩子
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 获取用户状态和初始化函数
  const { currentUser, isAuthenticated, initUser } = useUserStore();
  
  // 在组件挂载时检查用户状态，如果未初始化则初始化
  useEffect(() => {
    console.log('SettingsPage加载 - 当前用户状态:', { currentUser, isAuthenticated });
    
    if (!currentUser || !isAuthenticated) {
      console.log('SettingsPage - 初始化用户');
      initUser();
    } else {
      console.log('SettingsPage - 用户已存在:', currentUser);
    }
  }, [currentUser, isAuthenticated, initUser]);
  
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: { xs: 2, sm: 3 } }}>
        设置
      </Typography>
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <UserSettings />
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <DataManagement />
      </Paper>
    </Container>
  );
};

export default SettingsPage;