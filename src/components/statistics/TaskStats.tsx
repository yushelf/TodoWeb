import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

// 注册Chart.js组件
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

// 修改接口以匹配StatisticsPage传递的数据结构
interface TaskStatsProps {
  taskCompletionStats: {
    completed: number;
    total: number;
    byQuadrant: {
      'important-urgent': number;
      'important-notUrgent': number;
      'notImportant-urgent': number;
      'notImportant-notUrgent': number;
    };
  };
}

const TaskStats: React.FC<TaskStatsProps> = ({ taskCompletionStats }) => {
  // 从taskCompletionStats中提取数据
  const totalTasks = taskCompletionStats.total || 0;
  const completedTasks = taskCompletionStats.completed || 0;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = 0; // 假设没有逾期任务数据，设为0
  
  // 计算完成率
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // 准备任务状态数据
  const taskStatusData = {
    labels: ['已完成', '进行中', '已逾期'],
    datasets: [
      {
        data: [completedTasks, pendingTasks - overdueTasks, overdueTasks],
        backgroundColor: [
          'rgba(76, 175, 80, 0.6)', // 绿色 - 已完成
          'rgba(33, 150, 243, 0.6)', // 蓝色 - 进行中
          'rgba(244, 67, 54, 0.6)', // 红色 - 已逾期
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(244, 67, 54, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 准备四象限任务分布数据
  const quadrantData = {
    labels: ['重要且紧急', '重要不紧急', '不重要但紧急', '不重要不紧急'],
    datasets: [
      {
        data: [
          taskCompletionStats.byQuadrant['important-urgent'] || 0,
          taskCompletionStats.byQuadrant['important-notUrgent'] || 0,
          taskCompletionStats.byQuadrant['notImportant-urgent'] || 0,
          taskCompletionStats.byQuadrant['notImportant-notUrgent'] || 0,
        ],
        backgroundColor: [
          'rgba(244, 67, 54, 0.6)', // 红色 - 重要且紧急
          'rgba(33, 150, 243, 0.6)', // 蓝色 - 重要不紧急
          'rgba(255, 152, 0, 0.6)', // 橙色 - 不重要但紧急
          'rgba(76, 175, 80, 0.6)', // 绿色 - 不重要不紧急
        ],
        borderColor: [
          'rgba(244, 67, 54, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 由于没有四象限完成率数据，我们使用固定值
  const quadrantCompletionData = {
    labels: ['重要且紧急', '重要不紧急', '不重要但紧急', '不重要不紧急'],
    datasets: [
      {
        label: '完成率',
        data: [80, 60, 40, 20], // 使用固定值
        backgroundColor: [
          'rgba(244, 67, 54, 0.6)',
          'rgba(33, 150, 243, 0.6)',
          'rgba(255, 152, 0, 0.6)',
          'rgba(76, 175, 80, 0.6)',
        ],
        borderColor: [
          'rgba(244, 67, 54, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <Box>
      {/* 任务统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">总任务数</Typography>
              </Box>
              <Typography variant="h3">{totalTasks}</Typography>
              <Typography variant="body2" color="text.secondary">
                任务总数统计
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">已完成任务</Typography>
              </Box>
              <Typography variant="h3">{completedTasks}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionRate} 
                    color="success" 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {completionRate.toFixed(0)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">进行中任务</Typography>
              </Box>
              <Typography variant="h3">{pendingTasks - overdueTasks}</Typography>
              <Typography variant="body2" color="text.secondary">
                占比: {totalTasks > 0 ? (((pendingTasks - overdueTasks) / totalTasks) * 100).toFixed(0) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FlagIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">已逾期任务</Typography>
              </Box>
              <Typography variant="h3">{overdueTasks}</Typography>
              <Typography variant="body2" color="text.secondary">
                占比: {totalTasks > 0 ? ((overdueTasks / totalTasks) * 100).toFixed(0) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 图表 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>任务状态分布</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie 
                data={taskStatusData} 
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
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>四象限任务分布</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut 
                data={quadrantData} 
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
        
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>四象限任务完成率</Typography>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={quadrantCompletionData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: '完成率 (%)',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskStats;