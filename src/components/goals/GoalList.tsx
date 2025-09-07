import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Paper,
  LinearProgress,
  Chip,
  Tooltip,
  Collapse,
  Button,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { useGoalStore } from '../../store/goalStore';
import { useTaskStore } from '../../store/taskStore';
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
import { formatDate } from '../../utils/timeUtils';

interface GoalListProps {
  goals?: Goal[];
  onAddGoal?: () => void;
  onEditGoal?: (goal: Goal) => void;
  showProgress?: boolean;
  emptyMessage?: string;
}

const GoalList: React.FC<GoalListProps> = ({ goals: propGoals, onAddGoal, onEditGoal, showProgress = true, emptyMessage = "暂无目标" }) => {
  const { deleteGoal, completeGoal } = useGoalStore();
  const storeGoals = useGoalStore(state => state.goals);
  const goals = propGoals || storeGoals;
  const { getTasksByGoal } = useTaskStore();// 展开/折叠状态
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  
  // 用于强制重新渲染的状态
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 监听refreshKey变化，强制重新渲染
  useEffect(() => {
    // 当refreshKey变化时，组件会重新渲染
    console.log('组件重新渲染，refreshKey:', refreshKey);
  }, [refreshKey]);  
  // 切换目标展开状态
  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };
  
  // 处理删除目标
  const handleDeleteGoal = (goalId: string) => {
    console.log('%c准备删除目标，ID:', 'color: red; font-weight: bold', goalId);
    
    // 检查是否为有效的ID
    if (!goalId || typeof goalId !== 'string') {
      console.log('%c无效的目标ID:', 'color: blue', goalId);
      return;
    }
    
    // 检查确认对话框是否正常显示
    console.log('%c显示确认对话框', 'color: blue');
    const confirmResult = window.confirm('确定要删除这个目标吗？');
    console.log('%c确认对话框结果:', 'color: blue', confirmResult);
    
    if (confirmResult) {
      console.log('%c用户确认删除，开始执行删除操作', 'color: red; font-weight: bold');
      
      try {
        // 获取当前目标列表
        const currentGoals = useGoalStore.getState().goals;
        console.log('%c删除前的目标列表:', 'color: blue; font-weight: bold', JSON.stringify(currentGoals, null, 2));
        
        // 检查目标是否存在
        const goalToDelete = currentGoals.find(goal => goal.id === goalId);
        if (!goalToDelete) {
          const errorMsg = `错误: 找不到ID为${goalId}的目标`;
          console.log('%c' + errorMsg, 'color: blue');
          return;
        }
        
        console.log('%c要删除的目标详情:', 'color: orange', JSON.stringify(goalToDelete, null, 2));
        
        // 调用store的删除方法
        console.log('%c调用deleteGoal函数...', 'color: purple');
        console.log('%c删除函数引用检查:', 'color: purple', { deleteGoal, type: typeof deleteGoal });
        deleteGoal(goalId);
        console.log('%cdeleteGoal函数调用完成', 'color: green; font-weight: bold');
        
        // 从展开状态中移除已删除的目标
        setExpandedGoals(prev => {
          const newExpanded = {...prev};
          delete newExpanded[goalId];
          console.log('%c已从展开状态中移除目标', 'color: green');
          return newExpanded;
        });
        
        // 强制组件重新渲染
        setRefreshKey(prevKey => prevKey + 1);
        console.log('%c已触发组件重新渲染，refreshKey:', 'color: green', refreshKey + 1);
        
        // 从展开状态中移除已删除的目标
        console.log('%c从展开状态中移除目标', 'color: blue');
        setExpandedGoals(prev => {
          const newExpanded = {...prev};
          delete newExpanded[goalId];
          console.log('%c新的展开状态:', 'color: blue', newExpanded);
          return newExpanded;
        });
        
        // 强制组件重新渲染
        console.log('%c触发组件重新渲染', 'color: green');
        setRefreshKey(prevKey => {
          const newKey = prevKey + 1;
          console.log('%c新的refreshKey:', 'color: green', newKey);
          return newKey;
        });
        
        // 延迟检查更新结果
        console.log('%c设置延迟检查', 'color: orange');
        setTimeout(() => {
          console.log('%c延迟检查开始执行', 'color: orange; font-weight: bold');
          try {
            const updatedGoals = useGoalStore.getState().goals;
            console.log('%c最终目标列表:', 'color: blue; font-weight: bold', JSON.stringify(updatedGoals, null, 2));
            
            // 检查目标是否真的被删除了
            const stillExists = updatedGoals.some(goal => goal.id === goalId);
            console.log('%c目标在store中是否仍然存在:', 'color: red; font-weight: bold', stillExists);
            
            if (stillExists) {
              console.log('%c错误: 目标仍然存在于store中!', 'color: blue');
            } else {
              console.log('%c目标已成功从store中删除', 'color: green; font-weight: bold');
            }
            
            // 检查localStorage
            try {
              console.log('%c检查localStorage', 'color: purple');
              const storageKey = 'goals-storage';
              console.log('%c使用的存储键:', 'color: purple', storageKey);
              
              const storedData = localStorage.getItem(storageKey);
              console.log('%c从localStorage获取的原始数据:', 'color: purple', typeof storedData === 'string' ? storedData.substring(0, 100) + '...' : storedData);
              
              if (storedData) {
                try {
                  const parsedData = JSON.parse(storedData);
                  console.log('%c解析后的localStorage数据:', 'color: purple', parsedData);
                  
                  if (parsedData.state && Array.isArray(parsedData.state.goals)) {
                    console.log('%cLocalStorage中的目标数组:', 'color: purple', parsedData.state.goals);
                    
                    const stillExistsInStorage = parsedData.state.goals.some(goal => goal.id === goalId);
                    console.log('%c目标在localStorage中是否仍然存在:', 'color: red; font-weight: bold', stillExistsInStorage);
                    
                    if (stillExistsInStorage) {
                      console.error('%c错误: 目标在localStorage中仍然存在!', 'color: red; background: yellow; font-weight: bold');
                      alert('错误: 目标在localStorage中仍然存在，删除操作未完全成功!');
                      
                      // 尝试手动从localStorage中删除目标
                      parsedData.state.goals = parsedData.state.goals.filter(goal => goal.id !== goalId);
                      const updatedData = JSON.stringify(parsedData);
                      localStorage.setItem(storageKey, updatedData);
                      console.log('%c已手动从localStorage中删除目标', 'color: green; font-weight: bold');
                    } else {
                      console.log('%c目标已成功从localStorage中删除', 'color: green; font-weight: bold');
                    }
                  } else {
                    console.error('%c无效的localStorage数据格式:', 'color: red; background: yellow', parsedData);
                  }
                } catch (parseError) {
                  console.error('%c解析localStorage数据时出错:', 'color: red; background: yellow', parseError);
                  alert(`解析localStorage数据时出错: ${parseError.message}`);
                  
                  // 尝试重置localStorage数据
                  localStorage.removeItem(storageKey);
                  console.log('%c已清除localStorage中的goals-storage数据', 'color: green; font-weight: bold');
                }
              } else {
                console.warn('%cLocalStorage中没有找到数据', 'color: orange');
              }
            } catch (storageError) {
              console.log('%c检查localStorage时出错:', 'color: blue', storageError);
            }
            
            // 强制刷新页面以确保显示正确
            console.log('%c即将刷新页面...', 'color: orange; font-weight: bold');
            window.location.reload();
          } catch (checkError) {
            console.log('%c检查更新结果时出错:', 'color: blue', checkError);
          }
        }, 1000); // 增加延迟时间，确保有足够时间完成存储操作
      } catch (error) {
        console.log('%c删除目标过程中发生错误:', 'color: blue', error);
      }
    }
  };
  
  // 处理完成目标
  const handleCompleteGoal = (goalId: string) => {
    if (window.confirm('确定要将此目标标记为已完成吗？')) {
      completeGoal(goalId);
    }
  };
  
  // 计算目标进度
  const calculateGoalProgress = (goal: Goal): number => {
    const tasks = getTasksByGoal(goal.id);
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };
  
  // 如果没有目标，显示空状态
  if (goals.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          设定目标是高效能人士的重要习惯，它能帮助你明确方向，保持专注
        </Typography>
        </Paper>
    );
  }
  
  return (
    <Box key={refreshKey}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          我的目标
        </Typography>
      </Box>
      
      <List sx={{ width: '100%' }}>
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal);
          const isExpanded = expandedGoals[goal.id] || false;
          const tasks = getTasksByGoal(goal.id);
          const isCompleted = goal.status === 'completed';
          
          return (
            <Paper 
              key={goal.id} 
              elevation={1} 
              sx={{ 
                mb: 2, 
                borderLeft: isCompleted ? '4px solid #4caf50' : '4px solid #2196f3',
                opacity: isCompleted ? 0.8 : 1
              }}
            >
              <ListItem 
                onClick={(e) => {
                  // 检查点击是否来自操作按钮区域
                  if (e.target.closest('.MuiListItemSecondaryAction-root')) {
                    return;
                  }
                  toggleGoalExpand(goal.id);
                }}
                sx={{ 
                  bgcolor: isCompleted ? 'action.hover' : 'background.paper',
                  position: 'relative',
                  paddingRight: '150px', // 为按钮留出空间
                  cursor: 'pointer'
                }}
              >
                <Box sx={{ width: '100%', p: 1 }}>
                  {/* 标题区域 */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="h6" 
                      component="div"
                      sx={{ 
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {goal.title}
                    </Typography>
                    {isCompleted && (
                      <Chip 
                        label="已完成" 
                        color="success" 
                        size="small" 
                        icon={<CheckCircleIcon />}
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                  
                  {/* 目标描述 */}
                  {goal.description && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" component="div" color="text.secondary">
                        {goal.description}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* 进度条 */}
                  {showProgress && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        color={isCompleted ? "success" : "primary"}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="caption" component="div" color="text.secondary" sx={{ mt: 0.5 }}>
                        进度: {progress}%
                      </Typography>
                    </Box>
                  )}
                  
                  {/* 目标信息 */}
                  <Box sx={{ display: 'flex', mt: 1, color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <Typography variant="body2" component="div">
                        {tasks.length} 个任务
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" component="div">
                        {goal.totalPomodoros || 0} 个番茄钟
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" component="div">
                        {goal.targetDate ? (goal.targetDate instanceof Date ? formatDate(goal.targetDate) : new Date(goal.targetDate).toISOString().split('T')[0]) : '无截止日期'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              
              {/* 关联任务列表 */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    关联任务 ({tasks.length})
                  </Typography>
                  
                  {tasks.length > 0 ? (
                    <List dense>
                      {tasks.map(task => (
                        <ListItem key={task.id}>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2"
                                sx={{ 
                                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                  color: task.status === 'completed' ? 'text.secondary' : 'text.primary'
                                }}
                              >
                                {task.title}
                              </Typography>
                            }
                          />
                          <Chip 
                            size="small" 
                            label={task.status === 'completed' ? '已完成' : '进行中'} 
                            color={task.status === 'completed' ? 'success' : 'primary'}
                            variant="outlined"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      暂无关联任务
                    </Typography>
                  )}
                </Box>
              </Collapse>
              
              {/* 操作按钮 */}
              <Box className="MuiListItemSecondaryAction-root" sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex' }}>
                {!isCompleted && (
                  <Tooltip title="标记为完成">
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleCompleteGoal(goal.id);
                      }}
                      color="success"
                      size="small"
                      sx={{ mr: 1, '& svg': { pointerEvents: 'none' } }}
                      aria-label="标记为完成"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                <Tooltip title="编辑目标">
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if(onEditGoal) {
                        onEditGoal(goal);
                      }
                    }}
                    size="small"
                    sx={{ mr: 1, '& svg': { pointerEvents: 'none' } }}
                    aria-label="编辑目标"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="删除目标">
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('%c删除按钮被点击', 'color: red; font-weight: bold', {
                        event: e,
                        target: e.target,
                        currentTarget: e.currentTarget,
                        goalId: goal.id,
                        goalTitle: goal.title
                      });
                      try {
                        handleDeleteGoal(goal.id);
                        console.log('%c删除函数已调用完成', 'color: green; font-weight: bold');
                      } catch (error) {
                        console.error('%c删除过程中出错:', 'color: red; background: yellow', error);
                        alert(`删除目标时出错: ${error.message}`);
                      }
                    }}
                    sx={{ 
                      margin: '0 4px',
                      minWidth: 'auto',
                      padding: '4px 8px'
                    }}
                  >
                    删除
                  </Button>
                </Tooltip>
              </Box>
            </Paper>
          );
        })}
      </List>
    </Box>
  );
};

export default GoalList;