import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputBase,
  Chip,
  Divider,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import { useTaskStore } from '../store/taskStore';
// 内联定义Task相关接口
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  quadrant: 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  goalId?: string;
  pomodorosEstimated?: number;
  pomodorosSpent: number;
  createdAt: Date;
  tags: string[];
}

enum TaskStatus {
  Active = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

type TaskPriority = 'high' | 'medium' | 'low';
type TaskQuadrant = 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent';

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
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
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
    id: `task-tab-${index}`,
    'aria-controls': `task-tabpanel-${index}`,
  };
}

const TasksPage: React.FC = () => {
  const {
    tasks,
    getTasksByStatus,
    getTasksByQuadrant,
    getTasksByPriority,
    getTasksByTag,
  } = useTaskStore();
  
  // 添加响应式设计相关的钩子
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 状态
  const [tabValue, setTabValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedQuadrant, setSelectedQuadrant] = useState<TaskQuadrant | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  
  // 获取不同状态的任务
  const activeTasks = getTasksByStatus(TaskStatus.Active);
  const completedTasks = getTasksByStatus(TaskStatus.Completed);
  
  // 处理标签页变化
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 打开任务表单
  const handleOpenTaskDialog = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };
  
  // 关闭任务表单
  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setEditingTask(null);
  };
  
  // 打开筛选菜单
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // 关闭筛选菜单
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };
  
  // 处理任务点击
  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };
  
  // 处理任务提交
  const handleTaskSubmit = (task: Omit<Task, 'id' | 'createdAt' | 'pomodorosSpent'>) => {
    // 处理任务提交逻辑
    if (editingTask) {
      // 更新现有任务
      useTaskStore.getState().updateTask(editingTask.id, task);
    } else {
      // 添加新任务
      useTaskStore.getState().addTask(task);
    }
    setTaskDialogOpen(false);
  };
  
  // 处理任务表单提交 - 这个函数不再需要，由TaskForm内部处理提交
  
  // 应用筛选
  const handleApplyFilters = () => {
    handleFilterMenuClose();
  };
  
  // 清除所有筛选
  const clearAllFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };
  
  // 获取状态标签
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'not_started': return '未开始';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '全部';
    }
  };
  
  // 获取优先级标签
  const getPriorityLabel = (priority: string) => {
    switch(priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '全部';
    }
  };
  
  // 筛选任务
  const filterTasks = (tasksToFilter: Task[]): Task[] => {
    let filteredTasks = [...tasksToFilter];
    
    // 按搜索查询筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // 按优先级筛选
    if (priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    // 按状态筛选
    if (statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    return filteredTasks;
  };
  
  // 获取筛选后的任务
  const filteredTasks = filterTasks(tasks);
  
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" component="h1">
          任务管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenTaskDialog}
          size={isSmallScreen ? "small" : "medium"}
        >
          {isSmallScreen ? "添加" : "添加任务"}
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1, sm: 2 },
          mb: 2 
        }}>
          {/* 搜索框 */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flex: 1,
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1, 
            px: 1 
          }}>
            <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            <InputBase
              placeholder="搜索任务..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          
          {/* 筛选按钮 */}
          <Box>
            <Button
              startIcon={<FilterListIcon />}
              onClick={handleFilterMenuOpen}
              variant="outlined"
              size={isSmallScreen ? "small" : "medium"}
              fullWidth={isMobile}
            >
              筛选
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterMenuClose}
            >
              <MenuItem>
                <FormControl fullWidth size="small">
                  <InputLabel>状态</InputLabel>
                  <Select
                    value={statusFilter}
                    label="状态"
                    onChange={(e) => setStatusFilter(e.target.value as string)}
                  >
                    <MenuItem value="all">全部</MenuItem>
                    <MenuItem value="not_started">未开始</MenuItem>
                    <MenuItem value="in_progress">进行中</MenuItem>
                    <MenuItem value="completed">已完成</MenuItem>
                    <MenuItem value="cancelled">已取消</MenuItem>
                  </Select>
                </FormControl>
              </MenuItem>
              <MenuItem>
                <FormControl fullWidth size="small">
                  <InputLabel>优先级</InputLabel>
                  <Select
                    value={priorityFilter}
                    label="优先级"
                    onChange={(e) => setPriorityFilter(e.target.value as string)}
                  >
                    <MenuItem value="all">全部</MenuItem>
                    <MenuItem value="high">高</MenuItem>
                    <MenuItem value="medium">中</MenuItem>
                    <MenuItem value="low">低</MenuItem>
                  </Select>
                </FormControl>
              </MenuItem>
              <MenuItem>
                <Button 
                  variant="contained" 
                  size="small" 
                  fullWidth 
                  onClick={handleApplyFilters}
                >
                  应用筛选
                </Button>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* 活跃的筛选条件 */}
        {(statusFilter !== 'all' || priorityFilter !== 'all') && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {statusFilter !== 'all' && (
              <Chip
                label={`状态: ${getStatusLabel(statusFilter)}`}
                onDelete={() => setStatusFilter('all')}
                size={isSmallScreen ? "small" : "medium"}
              />
            )}
            {priorityFilter !== 'all' && (
              <Chip
                label={`优先级: ${getPriorityLabel(priorityFilter)}`}
                onDelete={() => setPriorityFilter('all')}
                size={isSmallScreen ? "small" : "medium"}
              />
            )}
            <Chip
              label="清除所有筛选"
              onClick={clearAllFilters}
              variant="outlined"
              size={isSmallScreen ? "small" : "medium"}
            />
          </Box>
        )}
        
        {/* 任务标签页 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
          >
            <Tab label="全部任务" />
            <Tab label="今日任务" />
            <Tab label="即将到期" />
            <Tab label="已完成" />
          </Tabs>
        </Box>
        
        {/* 任务列表 */}
        <Box sx={{ mt: 2 }}>
          {/* 全部任务 */}
          <TabPanel value={tabValue} index={0}>
            <TaskList 
              tasks={filteredTasks} 
              onTaskClick={handleTaskClick}
              emptyMessage="没有找到符合条件的任务"
            />
          </TabPanel>
          
          {/* 今日任务 */}
          <TabPanel value={tabValue} index={1}>
            <TaskList 
              tasks={filteredTasks.filter(task => {
                if (!task.dueDate) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate.getTime() === today.getTime();
              })} 
              onTaskClick={handleTaskClick}
              emptyMessage="今天没有到期的任务"
            />
          </TabPanel>
          
          {/* 即将到期任务 */}
          <TabPanel value={tabValue} index={2}>
            <TaskList 
              tasks={filteredTasks.filter(task => {
                if (!task.dueDate || task.status === 'completed') return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);
                
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                
                return dueDate >= tomorrow && dueDate <= nextWeek;
              })} 
              onTaskClick={handleTaskClick}
              emptyMessage="未来一周内没有到期的任务"
            />
          </TabPanel>
          
          {/* 已完成任务 */}
          <TabPanel value={tabValue} index={3}>
            <TaskList 
              tasks={filteredTasks.filter(task => task.status === 'completed')} 
              onTaskClick={handleTaskClick}
              emptyMessage="没有已完成的任务"
              showCompleted={true}
            />
          </TabPanel>
        </Box>
      </Paper>
      
      {/* 任务表单对话框 */}
      <TaskForm 
        open={taskDialogOpen} 
        onClose={handleCloseTaskDialog}
        task={editingTask} 
        onSubmit={handleTaskSubmit} 
      />
    </Container>
  );
};

export default TasksPage;