import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon,
  BubbleChart as BubbleChartIcon,
  PieChart as PieChartIcon,
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
  TimeScale,
  BubbleController,
  ScatterController,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, Bubble, Scatter, PolarArea } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useStatisticsStore } from '../../store/statisticsStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { formatDate, formatTime } from '../../utils/timeUtils';

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
  RadialLinearScale,
  TimeScale,
  BubbleController,
  ScatterController
);

// 热力图颜色生成函数
const generateHeatmapColor = (value: number, maxValue: number) => {
  // 从浅绿色到深绿色的渐变
  const intensity = Math.min(value / maxValue, 1);
  return `rgba(76, 175, 80, ${0.2 + intensity * 0.8})`;
};

// 番茄钟分布热力图组件
interface PomodoroHeatmapProps {
  pomodoroRecords: any[];
  dateRange: [Date, Date] | null;
}

export const PomodoroHeatmap: React.FC<PomodoroHeatmapProps> = ({ pomodoroRecords, dateRange }) => {
  const theme = useTheme();
  
  // 如果没有日期范围或记录，返回空组件
  if (!dateRange || !dateRange[0] || !dateRange[1] || pomodoroRecords.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有足够的数据来生成热力图
        </Typography>
      </Paper>
    );
  }
  
  // 按小时和星期几统计番茄钟数量
  const hourlyData: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
  let maxValue = 0;
  
  pomodoroRecords.forEach(record => {
    const date = new Date(record.startTime);
    const dayOfWeek = date.getDay(); // 0-6, 0 is Sunday
    const hour = date.getHours(); // 0-23
    
    hourlyData[dayOfWeek][hour] += 1;
    maxValue = Math.max(maxValue, hourlyData[dayOfWeek][hour]);
  });
  
  // 生成气泡图数据
  const bubbleData = {
    datasets: [
      {
        label: '番茄钟分布',
        data: hourlyData.flatMap((hours, dayIndex) => 
          hours.map((count, hourIndex) => ({
            x: hourIndex,
            y: dayIndex,
            r: count > 0 ? Math.max(count * 3, 5) : 0, // 气泡大小
          }))
        ).filter(item => item.r > 0), // 只显示有数据的点
        backgroundColor: (context: any) => {
          const value = context.raw.r / 3;
          return generateHeatmapColor(value, maxValue);
        },
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: -0.5,
        max: 23.5,
        title: {
          display: true,
          text: '小时',
        },
        ticks: {
          callback: (value: number) => `${value}:00`,
          stepSize: 2,
        },
      },
      y: {
        min: -0.5,
        max: 6.5,
        reverse: true, // 反转Y轴，使星期一在上方
        title: {
          display: true,
          text: '星期',
        },
        ticks: {
          callback: (value: number) => ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][value],
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => {
            const item = tooltipItems[0];
            const day = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][item.raw.y];
            const hour = item.raw.x;
            return `${day} ${hour}:00-${hour+1}:00`;
          },
          label: (tooltipItem: any) => {
            return `番茄钟数量: ${tooltipItem.raw.r / 3}`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, height: '400px' }}>
      <Typography variant="subtitle1" gutterBottom>
        番茄钟时间分布热力图
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <Bubble data={bubbleData} options={options} />
      </Box>
    </Paper>
  );
};

// 任务完成时长散点图组件
interface TaskCompletionScatterProps {
  tasks: any[];
  dateRange: [Date, Date] | null;
}

export const TaskCompletionScatter: React.FC<TaskCompletionScatterProps> = ({ tasks, dateRange }) => {
  const theme = useTheme();
  
  // 如果没有日期范围或任务，返回空组件
  if (!dateRange || !dateRange[0] || !dateRange[1] || tasks.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有足够的数据来生成散点图
        </Typography>
      </Paper>
    );
  }
  
  // 过滤已完成的任务
  const completedTasks = tasks.filter(task => 
    task.status === 'completed' && 
    task.completedAt && 
    task.createdAt &&
    new Date(task.completedAt) >= dateRange[0] &&
    new Date(task.completedAt) <= dateRange[1]
  );
  
  // 计算每个任务的完成时间（小时）和预估番茄钟数
  const taskData = completedTasks.map(task => {
    const createdAt = new Date(task.createdAt);
    const completedAt = new Date(task.completedAt);
    const completionTime = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // 小时
    
    return {
      x: task.estimatedPomodoros || 1, // 预估番茄钟数
      y: completionTime, // 完成时间（小时）
      r: task.pomodorosSpent || 1, // 实际花费的番茄钟数
      taskId: task.id,
      title: task.title,
      quadrant: task.quadrant,
    };
  });
  
  // 按象限分组
  const quadrantData = {
    'important_urgent': taskData.filter(t => t.quadrant === 'important_urgent'),
    'important_not_urgent': taskData.filter(t => t.quadrant === 'important_not_urgent'),
    'not_important_urgent': taskData.filter(t => t.quadrant === 'not_important_urgent'),
    'not_important_not_urgent': taskData.filter(t => t.quadrant === 'not_important_not_urgent'),
  };
  
  // 生成散点图数据
  const scatterData = {
    datasets: [
      {
        label: '重要且紧急',
        data: quadrantData.important_urgent,
        backgroundColor: 'rgba(244, 67, 54, 0.6)',
        borderColor: 'rgba(244, 67, 54, 1)',
        borderWidth: 1,
      },
      {
        label: '重要不紧急',
        data: quadrantData.important_not_urgent,
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      },
      {
        label: '紧急不重要',
        data: quadrantData.not_important_urgent,
        backgroundColor: 'rgba(255, 152, 0, 0.6)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1,
      },
      {
        label: '不重要不紧急',
        data: quadrantData.not_important_not_urgent,
        backgroundColor: 'rgba(158, 158, 158, 0.6)',
        borderColor: 'rgba(158, 158, 158, 1)',
        borderWidth: 1,
      },
    ].filter(dataset => dataset.data.length > 0), // 只显示有数据的象限
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: '预估番茄钟数',
        },
        min: 0,
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        title: {
          display: true,
          text: '完成时间（小时）',
        },
        min: 0,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => {
            return tooltipItems[0].raw.title;
          },
          label: (tooltipItem: any) => {
            const item = tooltipItem.raw;
            return [
              `预估番茄钟: ${item.x}`,
              `实际番茄钟: ${item.r}`,
              `完成时间: ${Math.round(item.y * 10) / 10} 小时`,
            ];
          },
        },
      },
    },
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, height: '400px' }}>
      <Typography variant="subtitle1" gutterBottom>
        任务完成时间与预估分析
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <Scatter data={scatterData} options={options} />
      </Box>
    </Paper>
  );
};

// 番茄钟效率分析组件
interface PomodoroEfficiencyProps {
  pomodoroRecords: any[];
  dateRange: [Date, Date] | null;
}

export const PomodoroEfficiency: React.FC<PomodoroEfficiencyProps> = ({ pomodoroRecords, dateRange }) => {
  const theme = useTheme();
  
  // 如果没有日期范围或记录，返回空组件
  if (!dateRange || !dateRange[0] || !dateRange[1] || pomodoroRecords.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有足够的数据来生成效率分析
        </Typography>
      </Paper>
    );
  }
  
  // 按小时统计番茄钟完成率
  const hourlyStats: { [hour: number]: { total: number, completed: number } } = {};
  
  // 初始化每小时的统计数据
  for (let i = 0; i < 24; i++) {
    hourlyStats[i] = { total: 0, completed: 0 };
  }
  
  // 统计每小时的番茄钟数量和完成情况
  pomodoroRecords.forEach(record => {
    const hour = new Date(record.startTime).getHours();
    hourlyStats[hour].total += 1;
    if (record.completed) {
      hourlyStats[hour].completed += 1;
    }
  });
  
  // 计算每小时的完成率
  const hourlyCompletionRates = Object.entries(hourlyStats).map(([hour, stats]) => ({
    hour: parseInt(hour),
    completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    total: stats.total,
  })).filter(item => item.total > 0); // 只显示有数据的小时
  
  // 按完成率排序
  hourlyCompletionRates.sort((a, b) => b.completionRate - a.completionRate);
  
  // 生成柱状图数据
  const barData = {
    labels: hourlyCompletionRates.map(item => `${item.hour}:00`),
    datasets: [
      {
        label: '番茄钟完成率',
        data: hourlyCompletionRates.map(item => item.completionRate),
        backgroundColor: hourlyCompletionRates.map(item => 
          `rgba(76, 175, 80, ${0.4 + (item.completionRate / 100) * 0.6})`
        ),
        borderColor: theme.palette.success.main,
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: '完成率 (%)',
        },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const index = tooltipItem.dataIndex;
            const item = hourlyCompletionRates[index];
            return [
              `完成率: ${Math.round(item.completionRate)}%`,
              `总番茄钟: ${item.total}`,
              `完成番茄钟: ${Math.round(item.total * item.completionRate / 100)}`,
            ];
          },
        },
      },
    },
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, height: '400px' }}>
      <Typography variant="subtitle1" gutterBottom>
        番茄钟效率分析（按小时）
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <Bar data={barData} options={options} />
      </Box>
    </Paper>
  );
};

// 中断原因分析组件
interface InterruptionAnalysisProps {
  pomodoroRecords: any[];
  dateRange: [Date, Date] | null;
}

export const InterruptionAnalysis: React.FC<InterruptionAnalysisProps> = ({ pomodoroRecords, dateRange }) => {
  const theme = useTheme();
  
  // 如果没有日期范围或记录，返回空组件
  if (!dateRange || !dateRange[0] || !dateRange[1] || pomodoroRecords.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有足够的数据来生成中断分析
        </Typography>
      </Paper>
    );
  }
  
  // 过滤出有中断的番茄钟记录
  const interruptedRecords = pomodoroRecords.filter(record => 
    !record.completed && record.interruptions && record.interruptions.length > 0
  );
  
  // 如果没有中断记录，返回空组件
  if (interruptedRecords.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          在选定时间范围内没有中断记录
        </Typography>
      </Paper>
    );
  }
  
  // 统计中断原因
  const interruptionReasons: { [reason: string]: number } = {};
  
  interruptedRecords.forEach(record => {
    record.interruptions.forEach((interruption: any) => {
      const reason = interruption.reason || '未指定原因';
      interruptionReasons[reason] = (interruptionReasons[reason] || 0) + 1;
    });
  });
  
  // 转换为数组并排序
  const sortedReasons = Object.entries(interruptionReasons)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
  
  // 取前10个原因，其余归为"其他"
  let topReasons = sortedReasons.slice(0, 10);
  const otherReasonsCount = sortedReasons.slice(10).reduce((sum, item) => sum + item.count, 0);
  
  if (otherReasonsCount > 0) {
    topReasons.push({ reason: '其他', count: otherReasonsCount });
  }
  
  // 生成饼图数据
  const pieData = {
    labels: topReasons.map(item => item.reason),
    datasets: [
      {
        data: topReasons.map(item => item.count),
        backgroundColor: [
          'rgba(244, 67, 54, 0.7)',
          'rgba(33, 150, 243, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(156, 39, 176, 0.7)',
          'rgba(0, 188, 212, 0.7)',
          'rgba(255, 87, 34, 0.7)',
          'rgba(121, 85, 72, 0.7)',
          'rgba(63, 81, 181, 0.7)',
          'rgba(158, 158, 158, 0.7)',
          'rgba(96, 125, 139, 0.7)',
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const dataset = tooltipItem.dataset;
            const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const value = dataset.data[tooltipItem.dataIndex];
            const percentage = Math.round((value / total) * 100);
            return `${tooltipItem.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, height: '400px' }}>
      <Typography variant="subtitle1" gutterBottom>
        番茄钟中断原因分析
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <Doughnut data={pieData} options={options} />
      </Box>
    </Paper>
  );
};

// 高级统计分析组件
interface AdvancedChartsProps {
  pomodoroRecords: any[];
  tasks: any[];
  dateRange: [Date, Date] | null;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ pomodoroRecords, tasks, dateRange }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        高级数据分析
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <PomodoroHeatmap pomodoroRecords={pomodoroRecords} dateRange={dateRange} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <TaskCompletionScatter tasks={tasks} dateRange={dateRange} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <PomodoroEfficiency pomodoroRecords={pomodoroRecords} dateRange={dateRange} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <InterruptionAnalysis pomodoroRecords={pomodoroRecords} dateRange={dateRange} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedCharts;