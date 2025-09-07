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
  Divider,
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
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
  TimeScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useTaskStore } from '../../store/taskStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
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
  TimeScale
);

// 任务完成率分析组件
interface TaskCompletionRateProps {
  tasks: any[];
  dateRange: [Date, Date] | null;
}

export const TaskCompletionRate: React.FC<TaskCompletionRateProps> = ({ tasks, dateRange }) => {
  const theme = useTheme();
  
  // 如果没有日期范围或任务，返回空组件
  if (!dateRange || !dateRange[0] || !dateRange[1] || tasks.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有足够的数据来生成任务完成率分析
        </Typography>
      </Paper>
    );
  }
  
  // 过滤在日期范围内的任务
  const filteredTasks = tasks.filter(task => {
    const createdAt = new Date(task.createdAt);
    return createdAt >= dateRange[0] && createdAt <= dateRange[1];
  });
  
  // 按优先级分组
  const priorityGroups = {
    high: filteredTasks.filter(task => task.priority === 'high'),
    medium: filteredTasks.filter(task => task.priority === 'medium'),
    low: filteredTasks.filter(task => task.priority === 'low'),
  };
  
  // 计算每个优先级的完成率
  const completionRates = {
    high: {
      total: priorityGroups.high.length,
      completed: priorityGroups.high.filter(task => task.status === 'completed').length,
      rate: priorityGroups.high.length > 0 
        ? (priorityGroups.high.filter(task => task.status === 'completed').length / priorityGroups.high.length) * 100 
        : 0
    },
    medium: {
      total: priorityGroups.medium.length,
      completed: priorityGroups.medium.filter(task => task.status === 'completed').length,
      rate: priorityGroups.medium.length > 0 
        ? (priorityGroups.medium.filter(task => task.status === 'completed').length / priorityGroups.medium.length) * 100 
        : 0
    },
    low: {
      total: priorityGroups.low.length,
      completed: priorityGroups.low.filter(task => task.status === 'completed').length,
      rate: priorityGroups.low.length > 0 
        ? (priorityGroups.low.filter(task => task.status === 'completed').length / priorityGroups.low.length) * 100 
        : 0
    },
  };
  
  // 生成柱状图数据
  const barData = {
    labels: ['高优先级', '中优先级', '低优先级'],
    datasets: [
      {
        label: '完成率',
        data: [completionRates.high.rate, completionRates.medium.rate, completionRates.low.rate],
        backgroundColor: [
          'rgba(244, 67, 54, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(76, 175, 80, 0.7)',
        ],
        borderColor: [
          'rgba(244, 67, 54, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
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
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const index = tooltipItem.dataIndex;
            const priorities = ['high', 'medium', 'low'];
            const priority = priorities[index];
            const stats = completionRates[priority as keyof typeof completionRates];
            
            return [
              `完成率: ${Math.round(stats.rate)}%`,
              `完成任务: ${stats.completed}`,
              `总任务数: ${stats.total}`,
            ];
          },
        },
      },
    },
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, height: '400px' }}>
      <Typography variant="subtitle1" gutterBottom>
        任务完成率（按优先级）
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <Bar data={barData} options={options} />
      </Box>
    </Paper>
  );
};

// 任务时间分布分析组件
interface TaskTimeDistributionProps {
  tasks: any[];
  dateRange: [Date, Date] | null;
}

export const TaskTimeDistribution: React.FC<TaskTimeDistributionProps> = ({ tasks, dateRange }) => {
  const theme = useTheme();
  
  // 如果没有日期范围或任务，返回空组件
  if (!dateRange || !dateRange[0] || !dateRange[1] || tasks.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有足够的数据来生成任务时间分布分析
        </Typography>
      </Paper>
    );
  }
  
  // 过滤在日期范围内创建的已完成任务
  const completedTasks = tasks.filter(task => 
    task.status === 'completed' && 
    task.createdAt && 
    task.completedAt &&
    new Date(task.createdAt) >= dateRange[0] &&
    new Date(task.createdAt) <= dateRange[1]
  );
  
  // 计算每个任务的完成时间（小时）
  const taskCompletionTimes = completedTasks.map(task => {
    const createdAt = new Date(task.createdAt);
    const completedAt = new Date(task.completedAt);
    const completionTime = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // 小时
    
    return {
      ...task,
      completionTime,
    };
  });
  
  // 按完成时间分组
  const timeGroups = {
    '0-1h': taskCompletionTimes.filter(task => task.completionTime <= 1).length,
    '1-4h': taskCompletionTimes.filter(task => task.completionTime > 1 && task.completionTime <= 4).length,
    '4-8h': taskCompletionTimes.filter(task => task.completionTime > 4 && task.completionTime <= 8).length,
    '8-24h': taskCompletionTimes.filter(task => task.completionTime > 8 && task.completionTime <= 24).length,
    '1-3d': taskCompletionTimes.filter(task => task.completionTime > 24 && task.completionTime <= 72).length,
    '3-7d': taskCompletionTimes.filter(task => task.completionTime > 72 && task.completionTime <= 168).length,
    '>7d': taskCompletionTimes.filter(task => task.completionTime > 168).length,
  };
  
  // 生成饼图数据
  const pieData = {
    labels: Object.keys(timeGroups),
    datasets: [
      {
        data: Object.values(timeGroups),
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',
          'rgba(33, 150, 243, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(244, 67, 54, 0.7)',
          'rgba(156, 39, 176, 0.7)',
          'rgba(121, 85, 72, 0.7)',
          'rgba(158, 158, 158, 0.7)',
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
            return `${tooltipItem.label}: ${value} 任务 (${percentage}%)`;
          },
        },
      },
    },
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, height: '400px' }}>
      <Typography variant="subtitle1" gutterBottom>
        任务完成时间分布
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <Pie data={pieData} options={options} />
      </Box>
    </Paper>
  );
};

// 任务按日期分布分析组件
interface TaskDateDistributionProps {
  tasks: any[];
  dateRange: [Date, Date] | null;
}

export const TaskDateDistribution: React.FC<TaskDateDistributionProps> = ({ tasks, dateRange }) => {
  const theme = useTheme();
  
  // 如果没有日期范围或任务，返回空组件
  if (!dateRange || !dateRange[0] || !dateRange[1] || tasks.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有足够的数据来生成任务日期分布分析
        </Typography>
      </Paper>
    );
  }
  
  // 计算日期范围内的天数
  const daysDiff = Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24));
  
  // 生成日期范围内的所有日期
  const dates = [];
  for (let i = 0; i <= daysDiff; i++) {
    const date = new Date(dateRange[0]);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  
  // 按日期统计创建和完成的任务数量
  const dateStats = dates.map(date => {
    const dateString = formatDate(date);
    
    // 统计当天创建的任务
    const createdTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate.toDateString() === date.toDateString();
    });
    
    // 统计当天完成的任务
    const completedTasks = tasks.filter(task => {
      if (!task.completedAt) return false;
      const taskDate = new Date(task.completedAt);
      return taskDate.toDateString() === date.toDateString();
    });
    
    return {
      date,
      dateString,
      created: createdTasks.length,
      completed: completedTasks.length,
    };
  });
  
  // 生成折线图数据
  const lineData = {
    labels: dateStats.map(stat => stat.dateString),
    datasets: [
      {
        label: '创建的任务',
        data: dateStats.map(stat => stat.created),
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        tension: 0.3,
      },
      {
        label: '完成的任务',
        data: dateStats.map(stat => stat.completed),
        borderColor: theme.palette.success.main,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.3,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '任务数量',
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, height: '400px' }}>
      <Typography variant="subtitle1" gutterBottom>
        任务创建与完成趋势
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <Line data={lineData} options={options} />
      </Box>
    </Paper>
  );
};

// 任务象限分析组件
interface TaskQuadrantAnalysisProps {
  tasks: any[];
  dateRange: [Date, Date] | null;
}

export const TaskQuadrantAnalysis: React.FC<TaskQuadrantAnalysisProps> = ({ tasks, dateRange }) => {
  const theme = useTheme();
  
  // 如果没有日期范围或任务，返回空组件
  if (!dateRange || !dateRange[0] || !dateRange[1] || tasks.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有足够的数据来生成任务象限分析
        </Typography>
      </Paper>
    );
  }
  
  // 过滤在日期范围内的任务
  const filteredTasks = tasks.filter(task => {
    const createdAt = new Date(task.createdAt);
    return createdAt >= dateRange[0] && createdAt <= dateRange[1];
  });
  
  // 按象限分组
  const quadrantGroups = {
    'important_urgent': filteredTasks.filter(task => task.quadrant === 'important_urgent'),
    'important_not_urgent': filteredTasks.filter(task => task.quadrant === 'important_not_urgent'),
    'not_important_urgent': filteredTasks.filter(task => task.quadrant === 'not_important_urgent'),
    'not_important_not_urgent': filteredTasks.filter(task => task.quadrant === 'not_important_not_urgent'),
  };
  
  // 计算每个象限的任务数量和完成情况
  const quadrantStats = {
    'important_urgent': {
      total: quadrantGroups.important_urgent.length,
      completed: quadrantGroups.important_urgent.filter(task => task.status === 'completed').length,
      inProgress: quadrantGroups.important_urgent.filter(task => task.status === 'in-progress').length,
      pending: quadrantGroups.important_urgent.filter(task => task.status === 'pending').length,
    },
    'important_not_urgent': {
      total: quadrantGroups.important_not_urgent.length,
      completed: quadrantGroups.important_not_urgent.filter(task => task.status === 'completed').length,
      inProgress: quadrantGroups.important_not_urgent.filter(task => task.status === 'in-progress').length,
      pending: quadrantGroups.important_not_urgent.filter(task => task.status === 'pending').length,
    },
    'not_important_urgent': {
      total: quadrantGroups.not_important_urgent.length,
      completed: quadrantGroups.not_important_urgent.filter(task => task.status === 'completed').length,
      inProgress: quadrantGroups.not_important_urgent.filter(task => task.status === 'in-progress').length,
      pending: quadrantGroups.not_important_urgent.filter(task => task.status === 'pending').length,
    },
    'not_important_not_urgent': {
      total: quadrantGroups.not_important_not_urgent.length,
      completed: quadrantGroups.not_important_not_urgent.filter(task => task.status === 'completed').length,
      inProgress: quadrantGroups.not_important_not_urgent.filter(task => task.status === 'in-progress').length,
      pending: quadrantGroups.not_important_not_urgent.filter(task => task.status === 'pending').length,
    },
  };
  
  // 生成堆叠柱状图数据
  const barData = {
    labels: ['重要且紧急', '重要不紧急', '紧急不重要', '不重要不紧急'],
    datasets: [
      {
        label: '已完成',
        data: [
          quadrantStats.important_urgent.completed,
          quadrantStats.important_not_urgent.completed,
          quadrantStats.not_important_urgent.completed,
          quadrantStats.not_important_not_urgent.completed,
        ],
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
      },
      {
        label: '进行中',
        data: [
          quadrantStats.important_urgent.inProgress,
          quadrantStats.important_not_urgent.inProgress,
          quadrantStats.not_important_urgent.inProgress,
          quadrantStats.not_important_not_urgent.inProgress,
        ],
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      },
      {
        label: '待处理',
        data: [
          quadrantStats.important_urgent.pending,
          quadrantStats.important_not_urgent.pending,
          quadrantStats.not_important_urgent.pending,
          quadrantStats.not_important_not_urgent.pending,
        ],
        backgroundColor: 'rgba(255, 152, 0, 0.7)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: '任务数量',
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, height: '400px' }}>
      <Typography variant="subtitle1" gutterBottom>
        任务象限分析
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <Bar data={barData} options={options} />
      </Box>
    </Paper>
  );
};

// 任务分析组件
interface TaskAnalyticsProps {
  tasks: any[];
  dateRange: [Date, Date] | null;
}

const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ tasks, dateRange }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        任务分析
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TaskCompletionRate tasks={tasks} dateRange={dateRange} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TaskTimeDistribution tasks={tasks} dateRange={dateRange} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TaskDateDistribution tasks={tasks} dateRange={dateRange} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TaskQuadrantAnalysis tasks={tasks} dateRange={dateRange} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskAnalytics;