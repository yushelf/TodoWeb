import React from 'react';
import { Box, Container, Grid, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import TaskQuadrants from '../components/tasks/TaskQuadrants';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import TaskList from '../components/tasks/TaskList';
import { useTaskStore } from '../store/taskStore';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { getTodayTasks, getUpcomingTasks } = useTaskStore();
  
  const todayTasks = getTodayTasks();
  const upcomingTasks = getUpcomingTasks();
  
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 } }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* 番茄钟计时器 - 在移动端放在顶部，占满宽度 */}
        <Grid item xs={12} md={4} lg={3} order={{ xs: 1, md: 1 }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: 'auto',
              minHeight: { xs: 250, sm: 300 },
              mb: { xs: 2, sm: 0 }
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              番茄钟
            </Typography>
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              py: { xs: 2, sm: 3 }
            }}>
              <PomodoroTimer />
            </Box>
          </Paper>
        </Grid>
        
        {/* 四象限任务管理 */}
        <Grid item xs={12} md={8} lg={9} order={{ xs: 3, md: 2 }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 'auto' : 600,
              minHeight: { xs: 400, sm: 500, md: 600 }
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              任务四象限
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <TaskQuadrants />
            </Box>
          </Paper>
        </Grid>
        
        {/* 今日任务列表 - 在移动端放在四象限之前 */}
        <Grid item xs={12} md={6} lg={6} order={{ xs: 2, md: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 'auto' : 400,
              minHeight: { xs: 300, sm: 350, md: 400 }
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              今日任务
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <TaskList tasks={todayTasks} emptyMessage="今天没有待办任务" />
            </Box>
          </Paper>
        </Grid>
        
        {/* 即将到来的任务列表 */}
        <Grid item xs={12} md={6} lg={6} order={{ xs: 4, md: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 'auto' : 400,
              minHeight: { xs: 300, sm: 350, md: 400 }
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              即将到来的任务
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <TaskList tasks={upcomingTasks} emptyMessage="没有即将到来的任务" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;