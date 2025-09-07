import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useStatisticsStore } from '../../store/statisticsStore';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { formatDate } from '../../utils/timeUtils';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const StatisticsOverview: React.FC = () => {
  const { 
    generateDailyStats, 
    generateWeeklyStats,
    generateTaskCompletionStats,
    generateGoalProgressStats,
    generateFocusMetrics
  } = useStatisticsStore();
  
  const { tasks } = useTaskStore();
  // 内联定义Goal接口
  interface Goal {
     id: string;
     title: string;
     description: string;
     category: string;
     type: 'long-term' | 'mid-term' | 'short-term';
     status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
     progress: number;
     createdAt: Date;
     targetDate?: Date;
   }
  
  const { goals } = useGoalStore();
  const { getTotalPomodorosToday, getCompletedPomodorosToday, getTotalFocusTimeToday } = usePomodoroStore();
  
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [tabValue, setTabValue] = useState(0);
  
  // 获取统计数据
  const dailyStats = generateDailyStats(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 过去7天
  const weeklyStats = generateWeeklyStats(new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), new Date()); // 过去4周
  const taskStats = generateTaskCompletionStats(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
  const goalStats = generateGoalProgressStats(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
  const focusMetrics = generateFocusMetrics(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
  
  // 处理标签变化
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 处理时间范围变化
  const handleTimeRangeChange = (range: 'week' | 'month') => {
    setTimeRange(range);
  };
  
  // 番茄钟趋势图数据
  const getPomodoroTrendData = () => {
    const stats = timeRange === 'week' ? [dailyStats] : weeklyStats;
    
    // 确保 stats 是数组
    if (!Array.isArray(stats)) {
      console.error('Stats is not an array:', stats);
      return {
        labels: [],
        datasets: [
          {
            label: '完成的番茄钟',
            data: [],
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            tension: 0.3,
          },
          {
            label: '中断的番茄钟',
            data: [],
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            tension: 0.3,
          },
        ],
      };
    }
    
    const labels = stats.map(stat => formatDate(stat.date));
    const completedData = stats.map(stat => stat.completedPomodoros);
    const interruptedData = stats.map(stat => stat.interruptedPomodoros);
    
    return {
      labels,
      datasets: [
        {
          label: '完成的番茄钟',
          data: completedData,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          tension: 0.3,
        },
        {
          label: '中断的番茄钟',
          data: interruptedData,
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          tension: 0.3,
        },
      ],
    };
  };
  
  // 任务完成情况图表数据
  const getTaskCompletionData = () => {
    return {
      labels: ['已完成', '进行中', '待处理'],
      datasets: [
        {
          data: [
            tasks.filter(t => t.status === 'completed').length,
            tasks.filter(t => t.status === 'in-progress').length,
            tasks.filter(t => t.status === 'pending').length,
          ],
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // 任务象限分布图表数据
  const getTaskQuadrantData = () => {
    return {
      labels: ['重要且紧急', '重要不紧急', '紧急不重要', '不重要不紧急'],
      datasets: [
        {
          data: [
            tasks.filter(t => t.quadrant === 1).length,
            tasks.filter(t => t.quadrant === 2).length,
            tasks.filter(t => t.quadrant === 3).length,
            tasks.filter(t => t.quadrant === 4).length,
          ],
          backgroundColor: ['#f44336', '#2196f3', '#ff9800', '#9e9e9e'],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // 专注度雷达图数据
  const getFocusRadarData = () => {
    return {
      labels: ['完成率', '专注时长', '连续性', '中断率', '目标达成'],
      datasets: [
        {
          label: '本周',
          data: [
            focusMetrics.completionRate * 100,
            focusMetrics.averageFocusTime,
            focusMetrics.consistencyScore * 100,
            (1 - focusMetrics.interruptionRate) * 100,
            focusMetrics.goalAchievementRate * 100,
          ],
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196f3',
          pointBackgroundColor: '#2196f3',
        },
      ],
    };
  };
  
  // 目标进度图表数据
  const getGoalProgressData = () => {
    const activeGoals = goals.filter(g => g.status === 'in-progress');
    return {
      labels: activeGoals.map(g => g.title),
      datasets: [
        {
          label: '完成进度',
          data: activeGoals.map(goal => {
            const goalStat = goalStats.find(stat => stat.goalId === goal.id);
            return goalStat ? goalStat.progressPercentage : 0;
          }),
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
        },
      ],
    };
  };
  
  // 渲染今日概览卡片
  const renderTodayOverview = () => {
    const todayPomodoros = getTotalPomodorosToday();
    const completedPomodoros = getCompletedPomodorosToday();
    const focusMinutes = Math.round(getTotalFocusTimeToday());
    const completedTasks = tasks.filter(t => 
      t.status === 'completed' && 
      new Date(t.completedAt as Date).toDateString() === new Date().toDateString()
    ).length;
    
    return (
      <Card elevation={2}>
        <CardHeader 
          title="今日概览" 
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <TrendingUpIcon />
            </Avatar>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {todayPomodoros}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  番茄钟总数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {completedPomodoros}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  完成番茄数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">
                  {focusMinutes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  专注分钟
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {completedTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  完成任务
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        数据统计与分析
      </Typography>
      
      {/* 今日概览 */}
      <Box sx={{ mb: 4 }}>
        {renderTodayOverview()}
      </Box>
      
      {/* 标签页导航 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="statistics tabs">
          <Tab label="番茄钟趋势" />
          <Tab label="任务分析" />
          <Tab label="目标进度" />
          <Tab label="专注度指标" />
        </Tabs>
      </Box>
      
      {/* 番茄钟趋势 */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              番茄钟趋势
            </Typography>
            <Box>
              <Tabs 
                value={timeRange} 
                onChange={(e, val) => handleTimeRangeChange(val)}
                aria-label="time range tabs"
                textColor="primary"
                indicatorColor="primary"
                sx={{ minHeight: 'auto' }}
              >
                <Tab label="周" value="week" sx={{ minHeight: 'auto', py: 1 }} />
                <Tab label="月" value="month" sx={{ minHeight: 'auto', py: 1 }} />
              </Tabs>
            </Box>
          </Box>
          
          <Paper elevation={1} sx={{ p: 3 }}>
            <Line 
              data={getPomodoroTrendData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: '番茄钟数量'
                    }
                  }
                }
              }} 
            />
          </Paper>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="番茄钟完成率" 
                  avatar={
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <TimerIcon />
                    </Avatar>
                  }
                />
                <CardContent>
                  <Typography variant="h3" align="center" color="success.main">
                    {Math.round(focusMetrics.completionRate * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    完成的番茄钟占总番茄钟的比例
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="平均专注时长" 
                  avatar={
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <TimerIcon />
                    </Avatar>
                  }
                />
                <CardContent>
                  <Typography variant="h3" align="center" color="info.main">
                    {focusMetrics.averageFocusTime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    每个番茄钟的平均专注分钟数
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* 任务分析 */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            任务分析
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  任务完成情况
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Doughnut 
                    data={getTaskCompletionData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }} 
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  任务象限分布
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Doughnut 
                    data={getTaskQuadrantData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }} 
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* 目标进度 */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            目标进度
          </Typography>
          
          <Paper elevation={1} sx={{ p: 3 }}>
            {goals.filter(g => g.status === 'in-progress').length > 0 ? (
              <Bar 
                data={getGoalProgressData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: '完成百分比'
                      }
                    }
                  }
                }} 
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  暂无进行中的目标
                </Typography>
              </Box>
            )}
          </Paper>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="目标达成率" 
                  avatar={
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <FlagIcon />
                    </Avatar>
                  }
                />
                <CardContent>
                  <Typography variant="h3" align="center" color="success.main">
                    {Math.round(focusMetrics.goalAchievementRate * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    已完成目标占总目标的比例
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="任务完成率" 
                  avatar={
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <CheckCircleIcon />
                    </Avatar>
                  }
                />
                <CardContent>
                  <Typography variant="h3" align="center" color="info.main">
                    {Math.round(taskStats.completionRate * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    已完成任务占总任务的比例
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* 专注度指标 */}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            专注度指标
          </Typography>
          
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Radar 
                data={getFocusRadarData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      min: 0,
                      max: 100,
                      ticks: {
                        stepSize: 20,
                      },
                    },
                  },
                }} 
              />
            </Box>
          </Paper>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="连续性得分" 
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <TrendingUpIcon />
                    </Avatar>
                  }
                />
                <CardContent>
                  <Typography variant="h3" align="center" color="primary.main">
                    {Math.round(focusMetrics.consistencyScore * 100)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    反映你使用番茄钟的规律性和连续性
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="中断率" 
                  avatar={
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <TimerIcon />
                    </Avatar>
                  }
                />
                <CardContent>
                  <Typography variant="h3" align="center" color="error.main">
                    {Math.round(focusMetrics.interruptionRate * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    番茄钟被中断的比例
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="专注效率" 
                  avatar={
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <TrendingUpIcon />
                    </Avatar>
                  }
                />
                <CardContent>
                  <Typography variant="h3" align="center" color="success.main">
                    {Math.round(focusMetrics.focusEfficiency * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    实际专注时间与计划时间的比例
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default StatisticsOverview;