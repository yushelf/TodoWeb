import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import type { DateRange } from '@mui/x-date-pickers-pro/models';
import { format, isWithinInterval, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  TimeScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useStatisticsStore } from '../../store/statisticsStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import type { PomodoroRecord, Task } from '../../models/types';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  TimeScale
);

interface PomodoroAnalyticsProps {
  pomodoroRecords: PomodoroRecord[];
  tasks: Task[];
  dateRange: DateRange<Date>;
}

// 番茄钟效率分析组件
const PomodoroEfficiency: React.FC<PomodoroAnalyticsProps> = ({ pomodoroRecords, dateRange }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // 过滤日期范围内的番茄钟记录
  const filteredRecords = pomodoroRecords.filter(record => {
    if (!dateRange[0] || !dateRange[1]) return true;
    const recordDate = new Date(record.startTime);
    return isWithinInterval(recordDate, {
      start: startOfDay(dateRange[0]),
      end: endOfDay(dateRange[1])
    });
  });

  // 计算完成率
  const completedPomodoros = filteredRecords.filter(record => record.completed).length;
  const totalPomodoros = filteredRecords.length;
  const completionRate = totalPomodoros > 0 ? (completedPomodoros / totalPomodoros) * 100 : 0;

  // 计算平均专注时长
  const totalFocusTime = filteredRecords.reduce((sum, record) => {
    if (record.completed) {
      return sum + (record.duration || 0);
    }
    return sum + (record.actualDuration || 0);
  }, 0);
  const averageFocusTime = totalPomodoros > 0 ? totalFocusTime / totalPomodoros : 0;

  // 按日期分组的效率数据
  const efficiencyByDate = filteredRecords.reduce((acc, record) => {
    const date = format(new Date(record.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = {
        total: 0,
        completed: 0,
        focusTime: 0,
      };
    }
    acc[date].total += 1;
    if (record.completed) {
      acc[date].completed += 1;
      acc[date].focusTime += record.duration || 0;
    } else {
      acc[date].focusTime += record.actualDuration || 0;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number; focusTime: number }>);

  // 准备图表数据
  const dates = Object.keys(efficiencyByDate).sort();
  const completionRates = dates.map(date => {
    const { total, completed } = efficiencyByDate[date];
    return total > 0 ? (completed / total) * 100 : 0;
  });
  const averageFocusTimes = dates.map(date => {
    const { total, focusTime } = efficiencyByDate[date];
    return total > 0 ? focusTime / total : 0;
  });

  const efficiencyData = {
    labels: dates,
    datasets: [
      {
        label: '完成率 (%)',
        data: completionRates,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: '平均专注时长 (分钟)',
        data: averageFocusTimes,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  const efficiencyOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: '番茄钟效率趋势',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '完成率 (%)',
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '平均专注时长 (分钟)',
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // 时间段分布数据
  const timeDistribution = {
    morning: 0,   // 6-12
    afternoon: 0, // 12-18
    evening: 0,   // 18-24
    night: 0,     // 0-6
  };

  filteredRecords.forEach(record => {
    const hour = new Date(record.startTime).getHours();
    if (hour >= 6 && hour < 12) timeDistribution.morning += 1;
    else if (hour >= 12 && hour < 18) timeDistribution.afternoon += 1;
    else if (hour >= 18 && hour < 24) timeDistribution.evening += 1;
    else timeDistribution.night += 1;
  });

  const timeDistributionData = {
    labels: ['早晨 (6-12)', '下午 (12-18)', '晚上 (18-24)', '夜间 (0-6)'],
    datasets: [
      {
        label: '番茄钟数量',
        data: [
          timeDistribution.morning,
          timeDistribution.afternoon,
          timeDistribution.evening,
          timeDistribution.night,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(54, 162, 235, 0.7)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        番茄钟效率分析
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                完成率
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={completionRate}
                    size={80}
                    thickness={5}
                    sx={{ color: completionRate > 70 ? 'success.main' : completionRate > 40 ? 'warning.main' : 'error.main' }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {`${Math.round(completionRate)}%`}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    完成番茄钟: {completedPomodoros}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总番茄钟: {totalPomodoros}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                平均专注时长
              </Typography>
              <Typography variant="h4">
                {Math.round(averageFocusTime)} 分钟
              </Typography>
              <Typography variant="body2" color="text.secondary">
                总专注时长: {Math.round(totalFocusTime)} 分钟
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                时间段分布
              </Typography>
              <Box sx={{ height: 150 }}>
                <Doughnut data={timeDistributionData} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={(_, newValue) => newValue && setTimeRange(newValue)}
                size="small"
              >
                <ToggleButton value="day">日</ToggleButton>
                <ToggleButton value="week">周</ToggleButton>
                <ToggleButton value="month">月</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ height: 300 }}>
              <Line options={efficiencyOptions} data={efficiencyData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// 中断分析组件
const InterruptionAnalysis: React.FC<PomodoroAnalyticsProps> = ({ pomodoroRecords, dateRange }) => {
  // 过滤日期范围内的番茄钟记录
  const filteredRecords = pomodoroRecords.filter(record => {
    if (!dateRange[0] || !dateRange[1]) return true;
    const recordDate = new Date(record.startTime);
    return isWithinInterval(recordDate, {
      start: startOfDay(dateRange[0]),
      end: endOfDay(dateRange[1])
    });
  });

  // 计算中断次数和原因
  const interruptedRecords = filteredRecords.filter(record => !record.completed);
  const totalInterruptions = interruptedRecords.length;
  
  // 中断原因分析（模拟数据，实际应用中应该从记录中获取）
  const interruptionReasons = {
    '外部干扰': Math.floor(totalInterruptions * 0.3),
    '疲劳': Math.floor(totalInterruptions * 0.25),
    '紧急事务': Math.floor(totalInterruptions * 0.2),
    '注意力分散': Math.floor(totalInterruptions * 0.15),
    '其他': totalInterruptions - Math.floor(totalInterruptions * 0.3) - Math.floor(totalInterruptions * 0.25) - Math.floor(totalInterruptions * 0.2) - Math.floor(totalInterruptions * 0.15),
  };

  // 中断时长分析
  const interruptionDurations = interruptedRecords.map(record => {
    const actualDuration = record.actualDuration || 0;
    const plannedDuration = record.duration || 0;
    return plannedDuration - actualDuration;
  });

  // 平均中断时长
  const averageInterruptionTime = interruptionDurations.length > 0
    ? interruptionDurations.reduce((sum, duration) => sum + duration, 0) / interruptionDurations.length
    : 0;

  // 中断原因图表数据
  const reasonsData = {
    labels: Object.keys(interruptionReasons),
    datasets: [
      {
        label: '中断次数',
        data: Object.values(interruptionReasons),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 中断时间分布图表数据
  const durationRanges = ['0-5分钟', '5-10分钟', '10-15分钟', '15+分钟'];
  const durationCounts = [0, 0, 0, 0];

  interruptionDurations.forEach(duration => {
    if (duration <= 5) durationCounts[0] += 1;
    else if (duration <= 10) durationCounts[1] += 1;
    else if (duration <= 15) durationCounts[2] += 1;
    else durationCounts[3] += 1;
  });

  const durationData = {
    labels: durationRanges,
    datasets: [
      {
        label: '中断次数',
        data: durationCounts,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        中断分析
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                中断率
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={totalInterruptions > 0 ? (totalInterruptions / filteredRecords.length) * 100 : 0}
                    size={80}
                    thickness={5}
                    sx={{ color: 'error.main' }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {filteredRecords.length > 0 ? `${Math.round((totalInterruptions / filteredRecords.length) * 100)}%` : '0%'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    中断番茄钟: {totalInterruptions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总番茄钟: {filteredRecords.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                平均中断时长
              </Typography>
              <Typography variant="h4">
                {Math.round(averageInterruptionTime)} 分钟
              </Typography>
              <Typography variant="body2" color="text.secondary">
                总中断次数: {totalInterruptions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                中断时长分布
              </Typography>
              <Box sx={{ height: 150 }}>
                <Bar 
                  data={durationData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: '次数'
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              中断原因分析
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut 
                data={reasonsData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                    title: {
                      display: true,
                      text: '中断原因分布'
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// 主组件
const PomodoroAnalytics: React.FC<PomodoroAnalyticsProps> = (props) => {
  return (
    <Box>
      <PomodoroEfficiency {...props} />
      <Divider sx={{ my: 4 }} />
      <InterruptionAnalysis {...props} />
    </Box>
  );
};

export default PomodoroAnalytics;