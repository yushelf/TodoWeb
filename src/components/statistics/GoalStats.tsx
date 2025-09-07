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
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
// 内联定义GoalProgressStats接口
interface GoalProgressStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  byCategory: Record<string, number>;
}

// 注册Chart.js组件
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

interface GoalStatsProps {
  goalStats: any; // 接收从StatisticsPage传来的数据
}

const GoalStats: React.FC<GoalStatsProps> = ({ goalStats }) => {
  // 确保goalStats是一个对象
  const stats = Array.isArray(goalStats) ? { totalGoals: 0, completedGoals: 0, inProgressGoals: 0, byCategory: {} } : goalStats;
  
  // 计算完成率
  const completionRate = stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals) * 100 : 0;
  
  // 准备目标状态数据
  const goalStatusData = {
    labels: ['已完成', '进行中'],
    datasets: [
      {
        data: [stats.completedGoals, stats.inProgressGoals],
        backgroundColor: [
          'rgba(76, 175, 80, 0.6)', // 绿色 - 已完成
          'rgba(33, 150, 243, 0.6)', // 蓝色 - 进行中
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(33, 150, 243, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 准备目标类别分布数据
  const categoryData = {
    labels: Object.keys(stats.byCategory || {}).map(category => 
      category === 'personal' ? '个人' :
      category === 'work' ? '工作' :
      category === 'study' ? '学习' :
      category === 'health' ? '健康' :
      category === 'finance' ? '财务' : category
    ),
    datasets: [
      {
        data: Object.values(stats.byCategory || {}).map((catStats: any) => catStats.total),
        backgroundColor: [
          'rgba(33, 150, 243, 0.6)', // 蓝色
          'rgba(76, 175, 80, 0.6)', // 绿色
          'rgba(156, 39, 176, 0.6)', // 紫色
          'rgba(255, 152, 0, 0.6)', // 橙色
          'rgba(244, 67, 54, 0.6)', // 红色
          'rgba(158, 158, 158, 0.6)', // 灰色
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(158, 158, 158, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 准备目标类别进度数据
  const categoryProgressData = {
    labels: Object.keys(stats.byCategory || {}).map(category => 
      category === 'personal' ? '个人' :
      category === 'work' ? '工作' :
      category === 'study' ? '学习' :
      category === 'health' ? '健康' :
      category === 'finance' ? '财务' : category
    ),
    datasets: [
      {
        label: '平均进度',
        data: Object.values(stats.byCategory || {}).map((catStats: any) => catStats.averageProgress),
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <Box>
      {/* 目标统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FlagIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">总目标数</Typography>
              </Box>
              <Typography variant="h3">{stats.totalGoals}</Typography>
              <Typography variant="body2" color="text.secondary">
                目标是明确方向的第一步
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">已完成目标</Typography>
              </Box>
              <Typography variant="h3">{stats.completedGoals}</Typography>
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
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">进行中目标</Typography>
              </Box>
              <Typography variant="h3">{stats.inProgressGoals}</Typography>
              <Typography variant="body2" color="text.secondary">
                占比: {stats.totalGoals > 0 ? ((stats.inProgressGoals / stats.totalGoals) * 100).toFixed(0) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 图表 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>目标状态分布</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie 
                data={goalStatusData} 
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
            <Typography variant="h6" gutterBottom>目标类别分布</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut 
                data={categoryData} 
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
            <Typography variant="h6" gutterBottom>各类别目标平均进度</Typography>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={categoryProgressData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: '进度 (%)',
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

export default GoalStats;