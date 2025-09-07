import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Paper,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
// 内联定义DailyPomodoroStats接口
interface DailyPomodoroStats {
  date: Date;
  totalPomodoros: number;
  completedPomodoros: number;
  interruptedPomodoros: number;
  totalFocusTime: number; // 总专注时间（分钟）
  byQuadrant: Record<string, number>; // 按四象限统计的番茄数
  byGoalCategory: Record<string, number>; // 按目标类别统计的番茄数
}

// 注册Chart.js组件
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

interface PomodoroStatsProps {
  dailyStats: DailyPomodoroStats | DailyPomodoroStats[];
  weeklyStats?: DailyPomodoroStats[];
  focusMetrics?: any;
}

const PomodoroStats: React.FC<PomodoroStatsProps> = ({
  dailyStats,
  weeklyStats = [],
  focusMetrics,
}) => {
  // 处理dailyStats可能是单个对象或数组的情况
  const dailyStatsArray = Array.isArray(dailyStats) ? dailyStats : [dailyStats];
  
  // 计算总番茄钟数据
  const totalPomodoros = dailyStatsArray.reduce((sum, stat) => sum + stat.totalPomodoros, 0);
  const completedPomodoros = dailyStatsArray.reduce((sum, stat) => sum + stat.completedPomodoros, 0);
  const interruptedPomodoros = dailyStatsArray.reduce((sum, stat) => sum + stat.interruptedPomodoros, 0);
  const totalFocusTime = dailyStatsArray.reduce((sum, stat) => sum + stat.totalFocusTime, 0);
  
  // 计算完成率
  const completionRate = totalPomodoros > 0 ? (completedPomodoros / totalPomodoros) * 100 : 0;
  
  // 格式化专注时间
  const formatFocusTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}小时${mins}分钟`;
  };
  
  // 准备每日番茄钟数据
  const dailyPomodoroData = {
    labels: dailyStatsArray.map(stat => new Date(stat.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: '完成的番茄钟',
        data: dailyStatsArray.map(stat => stat.completedPomodoros),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
      },
      {
        label: '中断的番茄钟',
        data: dailyStatsArray.map(stat => stat.interruptedPomodoros),
        backgroundColor: 'rgba(244, 67, 54, 0.6)',
      },
    ],
  };
  
  // 准备番茄钟完成情况数据
  const pomodoroCompletionData = {
    labels: ['完成', '中断'],
    datasets: [
      {
        data: [completedPomodoros, interruptedPomodoros],
        backgroundColor: ['rgba(76, 175, 80, 0.6)', 'rgba(244, 67, 54, 0.6)'],
        borderColor: ['rgba(76, 175, 80, 1)', 'rgba(244, 67, 54, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  // 准备四象限分布数据
  const quadrantData = {
    labels: ['重要且紧急', '重要不紧急', '不重要但紧急', '不重要不紧急'],
    datasets: [
      {
        data: [
          dailyStatsArray.reduce((sum, stat) => sum + (stat.byQuadrant['important_urgent'] || 0), 0),
          dailyStatsArray.reduce((sum, stat) => sum + (stat.byQuadrant['important_not_urgent'] || 0), 0),
          dailyStatsArray.reduce((sum, stat) => sum + (stat.byQuadrant['not_important_urgent'] || 0), 0),
          dailyStatsArray.reduce((sum, stat) => sum + (stat.byQuadrant['not_important_not_urgent'] || 0), 0),
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
  
  return (
    <Box>
      {/* 番茄钟统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">总番茄钟</Typography>
              </Box>
              <Typography variant="h3">{totalPomodoros}</Typography>
              <Typography variant="body2" color="text.secondary">
                总计 {formatFocusTime(totalFocusTime)} 专注时间
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">完成番茄钟</Typography>
              </Box>
              <Typography variant="h3">{completedPomodoros}</Typography>
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
                <CancelIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">中断番茄钟</Typography>
              </Box>
              <Typography variant="h3">{interruptedPomodoros}</Typography>
              <Typography variant="body2" color="text.secondary">
                中断率: {totalPomodoros > 0 ? ((interruptedPomodoros / totalPomodoros) * 100).toFixed(0) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">平均专注时间</Typography>
              </Box>
              <Typography variant="h3">
                {totalPomodoros > 0 ? (totalFocusTime / totalPomodoros).toFixed(0) : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                分钟/番茄钟
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 图表 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>每日番茄钟统计</Typography>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={dailyPomodoroData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                      }
                    }
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>番茄钟完成情况</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut 
                data={pomodoroCompletionData} 
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
            <Typography variant="h6" gutterBottom>四象限分布</Typography>
            <Box sx={{ height: 300 }}>
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
      </Grid>
    </Box>
  );
};

export default PomodoroStats;