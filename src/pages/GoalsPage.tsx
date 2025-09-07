import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Paper,
  InputBase,
  Divider,
  Chip,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  CardActions,
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
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import GoalList from '../components/goals/GoalList';
import GoalForm from '../components/goals/GoalForm';
import { useGoalStore } from '../store/goalStore';
// 内联定义Goal接口和GoalStatus类型
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

type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';

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
      id={`goal-tabpanel-${index}`}
      aria-labelledby={`goal-tab-${index}`}
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
    id: `goal-tab-${index}`,
    'aria-controls': `goal-tabpanel-${index}`,
  };
}

const GoalsPage: React.FC = () => {
  const {
    goals,
    getGoalsByStatus,
  } = useGoalStore();
  
  // 添加响应式设计相关的钩子
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 状态
  const [tabValue, setTabValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'all'>('all');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // 获取不同状态的目标
  const activeGoals = goals.filter(g => g.status === 'in_progress' || g.status === 'not_started');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const cancelledGoals = goals.filter(g => g.status === 'cancelled');
  
  // 处理标签页变化
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 打开目标表单
  const handleOpenForm = () => {
    setIsFormOpen(true);
  };
  
  // 关闭目标表单
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  // 打开筛选菜单
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // 关闭筛选菜单
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // 处理状态筛选变化
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    setSelectedStatus(event.target.value as GoalStatus | 'all');
  };
  
  // 清除所有筛选
  const clearFilters = () => {
    setSelectedStatus('all');
    setSearchQuery('');
  };
  
  // 筛选目标
  const filterGoals = (goalsToFilter: Goal[]): Goal[] => {
    let filteredGoals = [...goalsToFilter];
    
    // 按搜索查询筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredGoals = filteredGoals.filter(goal => 
        goal.title.toLowerCase().includes(query) || 
        (goal.description && goal.description.toLowerCase().includes(query))
      );
    }
    
    // 按状态筛选
    if (selectedStatus !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.status === selectedStatus);
    }
    
    return filteredGoals;
  };
  
  // 获取筛选后的目标
  const filteredActiveGoals = filterGoals(activeGoals);
  const filteredCompletedGoals = filterGoals(completedGoals);
  const filteredCancelledGoals = filterGoals(cancelledGoals);
  
  // 判断是否有筛选条件
  const hasFilters = selectedStatus !== 'all' || searchQuery !== '';
  
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" component="h1">
          目标管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
          size={isSmallScreen ? "small" : "medium"}
        >
          {isSmallScreen ? "添加" : "新建目标"}
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
              placeholder="搜索目标..."
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
              onClick={handleFilterClick}
              variant="outlined"
              size={isSmallScreen ? "small" : "medium"}
              fullWidth={isMobile}
              color={hasFilters ? "secondary" : "primary"}
            >
              筛选
            </Button>
          </Box>
        </Box>
        
        {/* 活跃的筛选条件 */}
        {hasFilters && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedStatus !== 'all' && (
              <Chip
                label={`状态: ${getStatusLabel(selectedStatus)}`}
                onDelete={() => setSelectedStatus('all')}
                size={isSmallScreen ? "small" : "medium"}
              />
            )}
            {searchQuery && (
              <Chip
                label={`搜索: ${searchQuery}`}
                onDelete={() => setSearchQuery('')}
                size={isSmallScreen ? "small" : "medium"}
              />
            )}
            <Chip
              label="清除所有筛选"
              onClick={clearFilters}
              variant="outlined"
              size={isSmallScreen ? "small" : "medium"}
            />
          </Box>
        )}
        
        {/* 目标标签页 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
          >
            <Tab label={`进行中 (${filteredActiveGoals.length})`} {...a11yProps(0)} />
            <Tab label={`已完成 (${filteredCompletedGoals.length})`} {...a11yProps(1)} />
            <Tab label={`已取消 (${filteredCancelledGoals.length})`} {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <GoalList 
            goals={filteredActiveGoals} 
            showProgress={true} 
            emptyMessage="没有找到符合条件的进行中目标"
            onAddGoal={handleOpenForm}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setIsFormOpen(true);
            }}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <GoalList 
            goals={filteredCompletedGoals} 
            showProgress={false} 
            emptyMessage="没有找到符合条件的已完成目标"
            onAddGoal={handleOpenForm}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setIsFormOpen(true);
            }}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <GoalList 
            goals={filteredCancelledGoals} 
            showProgress={false} 
            emptyMessage="没有找到符合条件的已取消目标"
            onAddGoal={handleOpenForm}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setIsFormOpen(true);
            }}
          />
        </TabPanel>
      </Paper>
      
      {/* 筛选菜单 */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          elevation: 3,
          sx: { width: 300, maxWidth: '100%', p: 2 },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          筛选选项
        </Typography>
        
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>状态</InputLabel>
          <Select
            value={selectedStatus}
            label="状态"
            onChange={handleStatusChange}
          >
            <MenuItem value="all">全部</MenuItem>
            <MenuItem value="not_started">未开始</MenuItem>
            <MenuItem value="in_progress">进行中</MenuItem>
            <MenuItem value="completed">已完成</MenuItem>
            <MenuItem value="cancelled">已取消</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={clearFilters} sx={{ mr: 1 }}>
            清除
          </Button>
          <Button onClick={handleFilterClose} variant="contained">
            应用
          </Button>
        </Box>
      </Menu>
      
      {/* 目标表单对话框 */}
      <GoalForm 
        open={isFormOpen} 
        onClose={handleCloseForm} 
        goal={editingGoal} 
      />
    </Container>
  );
};

// 获取状态标签
function getStatusLabel(status: string) {
  switch(status) {
    case 'not_started': return '未开始';
    case 'in_progress': return '进行中';
    case 'completed': return '已完成';
    case 'cancelled': return '已取消';
    default: return '全部';
  }
}

export default GoalsPage;