import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import type { DateRange } from '@mui/x-date-pickers-pro/models';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import zhCN from 'date-fns/locale/zh-CN';
import PomodoroHistory from '../components/pomodoro/PomodoroHistory';
import StatisticsOverview from '../components/statistics/StatisticsOverview';
import PomodoroStats from '../components/statistics/PomodoroStats';
import TaskStats from '../components/statistics/TaskStats';
import GoalStats from '../components/statistics/GoalStats';
import AdvancedCharts from '../components/statistics/AdvancedCharts';
import TaskAnalytics from '../components/statistics/TaskAnalytics';
import PomodoroAnalytics from '../components/statistics/PomodoroAnalytics';
import { usePomodoroStore } from '../store/pomodoroStore';
import { useStatisticsStore } from '../store/statisticsStore';
import { useTaskStore } from '../store/taskStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      style={{ display: value !== index ? 'none' : 'block' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `statistics-tab-${index}`,
    'aria-controls': `statistics-tabpanel-${index}`,
  };
}

const StatisticsPage: React.FC = () => {
  // 添加响应式设计相关的钩子
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange<Date>>([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]);
  
  const { getRecordsByDateRange } = usePomodoroStore();
  const { 
    generateDailyStats, 
    generateWeeklyStats,
    generateTaskCompletionStats,
    generateGoalProgressStats,
    generateFocusMetrics
  } = useStatisticsStore();
  
  // 处理标签页变化
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 处理日期范围变化
  const handleDateRangeChange = (newDateRange: DateRange<Date>) => {
    if (newDateRange[0] && newDateRange[1]) {
      setDateRange(newDateRange);
    }
  };
  
  // 获取选定日期范围内的番茄钟记录
  const pomodoroRecords = dateRange[0] && dateRange[1] 
    ? getRecordsByDateRange(dateRange[0], dateRange[1])
    : [];
  
  // 生成统计数据
  const dailyStats = dateRange[0] && dateRange[1] 
    ? generateDailyStats(dateRange[0])
    : { date: new Date(), totalPomodoros: 0, completedPomodoros: 0, interruptedPomodoros: 0, totalFocusTime: 0, byQuadrant: {}, byGoalCategory: {} };
    
  const weeklyStats = dateRange[0] && dateRange[1] 
    ? generateWeeklyStats(dateRange[0], dateRange[1])
    : [];
    
  const taskCompletionStats = dateRange[0] && dateRange[1] 
    ? generateTaskCompletionStats(dateRange[0], dateRange[1])
    : { completed: 0, total: 0, byQuadrant: { 'important-urgent': 0, 'important-notUrgent': 0, 'notImportant-urgent': 0, 'notImportant-notUrgent': 0 } };
    
  const goalProgressStats = dateRange[0] && dateRange[1] 
    ? generateGoalProgressStats(dateRange[0], dateRange[1])
    : [];
    
  const focusMetrics = dateRange[0] && dateRange[1] 
    ? generateFocusMetrics(dateRange[0], dateRange[1])
    : { focusScore: 0, consistencyScore: 0, completionRate: 0, interruptionRate: 0, averageFocusTime: 0 };
  
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: { xs: 2, sm: 3 },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" component="h1" sx={{ mb: { xs: 1, sm: 0 } }}>
          统计与分析
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            localeText={{ start: '开始日期', end: '结束日期' }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          />
        </LocalizationProvider>
      </Box>
      
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="statistics tabs" 
            variant="scrollable" 
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="概览" {...a11yProps(0)} />
            <Tab label="番茄钟统计" {...a11yProps(1)} />
            <Tab label="任务统计" {...a11yProps(2)} />
            <Tab label="目标统计" {...a11yProps(3)} />
            <Tab label="任务分析" {...a11yProps(4)} />
            <Tab label="番茄钟分析" {...a11yProps(5)} />
            <Tab label="高级分析" {...a11yProps(6)} />
            <Tab label="番茄钟历史" {...a11yProps(7)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <StatisticsOverview 
            dailyStats={dailyStats}
            weeklyStats={weeklyStats}
            taskCompletionStats={taskCompletionStats}
            goalProgressStats={goalProgressStats}
            focusMetrics={focusMetrics}
            dateRange={dateRange}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <PomodoroStats 
            dailyStats={dailyStats}
            weeklyStats={weeklyStats}
            focusMetrics={focusMetrics}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <TaskStats 
            taskCompletionStats={taskCompletionStats}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <GoalStats 
            goalStats={goalProgressStats}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <TaskAnalytics 
            tasks={useTaskStore().tasks}
            dateRange={dateRange}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={5}>
          <PomodoroAnalytics 
            pomodoroRecords={pomodoroRecords}
            tasks={useTaskStore().tasks}
            dateRange={dateRange}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={6}>
          <AdvancedCharts 
            pomodoroRecords={pomodoroRecords}
            tasks={useTaskStore().tasks}
            dateRange={dateRange}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={7}>
          <PomodoroHistory pomodoroRecords={pomodoroRecords} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default StatisticsPage;