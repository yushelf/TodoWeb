import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Chip, 
  Typography, 
  Box,
  Tooltip,
  Checkbox,
  Paper,
  Button
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Timer as TimerIcon,
  Flag as FlagIcon,
  Today as TodayIcon
} from '@mui/icons-material';
// 内联定义Task接口
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
import { useTaskStore } from '../../store/taskStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { formatDateFriendly, isOverdue } from '../../utils/timeUtils';

interface TaskListProps {
  tasks: Task[];
  quadrant?: string;
  showCompleted?: boolean;
  showQuadrant?: boolean;
  onTaskClick?: (task: Task) => void;
  emptyMessage?: string;
}

// 优先级对应的颜色
const priorityColors = {
  high: '#f44336', // 红色
  medium: '#ff9800', // 橙色
  low: '#4caf50', // 绿色
};

const TaskList: React.FC<TaskListProps> = ({ tasks, quadrant, showCompleted = false, onTaskClick, emptyMessage = '暂无任务' }) => {
  const navigate = useNavigate();
  const { deleteTask } = useTaskStore();
  const { startPomodoro } = usePomodoroStore();
  
  // 添加选中任务的状态
  const [selectedTasks, setSelectedTasks] = React.useState<{[key: string]: boolean}>({});
  
  // 处理任务状态变更
  const handleTaskStatusChange = (taskId: string, completed: boolean) => {
    const { updateTask } = useTaskStore.getState();
    updateTask(taskId, { status: completed ? 'completed' : 'not_started' });
  };
  
  // 批量处理选中任务的状态变更
  const handleSelectedTasksStatusChange = (completed: boolean) => {
    const { updateTask } = useTaskStore.getState();
    Object.keys(selectedTasks).forEach(taskId => {
      if (selectedTasks[taskId]) {
        updateTask(taskId, { status: completed ? 'completed' : 'not_started' });
      }
    });
  };
  
  // 处理任务选中状态变更
  const handleTaskSelection = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskId]: selected
    }));
  };
  
  // 处理删除任务
  const handleDeleteTask = (taskId: string) => {
    console.log('%c开始处理删除任务', 'color: blue; font-weight: bold', { taskId });
    
    if (!taskId) {
      console.log('%c删除任务失败: 无效的任务ID', 'color: blue');
      return;
    }
    
    try {
      if (window.confirm('确定要删除此任务吗？')) {
        console.log('%c用户确认删除任务', 'color: blue');
        
        // 检查deleteTask函数是否存在
        if (typeof deleteTask !== 'function') {
          console.log('%c删除任务失败: deleteTask不是一个函数', 'color: blue');
          return;
        }
        
        // 调用删除函数
        deleteTask(taskId);
        console.log('%c任务删除函数已调用', 'color: green; font-weight: bold');
        
        // 延迟检查任务是否真的被删除
        setTimeout(() => {
          const taskStillExists = useTaskStore.getState().getTaskById(taskId);
          console.log('%c检查任务是否已删除', 'color: blue', { 
            taskId, 
            stillExists: !!taskStillExists,
            currentTasks: useTaskStore.getState().tasks.length
          });
          
          if (taskStillExists) {
            console.warn('%c任务可能未成功删除', 'color: orange; font-weight: bold');
          } else {
            console.log('%c任务已成功删除', 'color: green; font-weight: bold');
          }
        }, 1000);
      } else {
        console.log('%c用户取消删除任务', 'color: gray');
      }
    } catch (error) {
      console.log('%c删除任务过程中出错:', 'color: blue', error);
    }
  };
  
  // 开始番茄钟
  const handleStartPomodoro = (task: Task) => {
    const { startPomodoro } = usePomodoroStore.getState();
    startPomodoro(task.id);
    // 同时将任务状态更新为进行中
    const { updateTask } = useTaskStore.getState();
    updateTask(task.id, { status: 'in_progress' });
    
    // 使用React Router的navigate进行页面跳转，保持应用状态
    navigate('/pomodoro');
  };
  
  // 检查是否有选中的任务
  const hasSelectedTasks = Object.values(selectedTasks).some(selected => selected);
  
  // 如果没有任务，显示空状态
  if (tasks.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {quadrant ? '此象限暂无任务' : emptyMessage}
        </Typography>
      </Paper>
    );
  }
  
  return (
    <div>
      {/* 批量操作按钮 */}
      {hasSelectedTasks && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => handleSelectedTasksStatusChange(true)}
          >
            标记为已完成
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleSelectedTasksStatusChange(false)}
          >
            标记为未完成
          </Button>
        </Box>
      )}
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {tasks.map((task) => {
        const labelId = `task-checkbox-${task.id}`;
        const isCompleted = task.status === 'completed';
        
        return (
          <ListItem 
            key={task.id} 
            alignItems="flex-start"
            sx={{
              mb: 1,
              borderRadius: 1,
              bgcolor: isCompleted ? 'action.hover' : 'background.paper',
              '&:hover': { bgcolor: 'action.hover' },
              ...(isOverdue(task.dueDate) && !isCompleted && { borderLeft: '4px solid #f44336' })
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Tooltip title={selectedTasks[task.id] ? "取消选择" : "选择任务"}>
                <Checkbox
                  edge="start"
                  checked={!!selectedTasks[task.id]}
                  onChange={(e) => handleTaskSelection(task.id, e.target.checked)}
                  color="primary"
                />
              </Tooltip>
            </Box>
            
            <ListItemText
              id={labelId}
              primary={
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    color: isCompleted ? 'text.secondary' : 'text.primary'
                  }}
                >
                  {task.title}
                </Typography>
              }
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <React.Fragment>
                  {task.description && (
                    <Typography 
                      variant="body2" 
                      component="div"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {task.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {/* 优先级标签 */}
                    <Tooltip title="优先级">
                      <Chip 
                        icon={<FlagIcon />} 
                        label={task.priority} 
                        size="small" 
                        sx={{ 
                          bgcolor: priorityColors[task.priority as keyof typeof priorityColors],
                          color: 'white'
                        }} 
                      />
                    </Tooltip>
                    
                    {/* 番茄钟数量 */}
                    <Tooltip title="预估番茄数">
                      <Chip 
                        icon={<TimerIcon />} 
                        label={`${task.pomodorosSpent}/${task.pomodorosEstimated || 0}`} 
                        size="small" 
                        color="default"
                        variant="outlined"
                      />
                    </Tooltip>
                    
                    {/* 截止日期 */}
                    {task.dueDate && (
                      <Tooltip title="截止日期">
                        <Chip 
                          icon={<TodayIcon />} 
                          label={task.dueDate instanceof Date ? formatDateFriendly(task.dueDate) : '日期无效'} 
                          size="small"
                          color={task.dueDate instanceof Date && isOverdue(task.dueDate) && !isCompleted ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                    
                    {/* 标签 */}
                    {task.tags && task.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </React.Fragment>
              }
            />
            
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex' }}>
                {/* 开始番茄钟按钮 - 始终显示 */}
                {!isCompleted && (
                  <Tooltip title="开始番茄钟">
                    <IconButton 
                      edge="end" 
                      aria-label="start-pomodoro" 
                      onClick={() => handleStartPomodoro(task)}
                      color="primary"
                    >
                      <TimerIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {/* 编辑按钮 - 仅在选中时显示 */}
                {selectedTasks[task.id] && (
                  <Tooltip title="编辑任务">
                    <IconButton 
                      edge="end" 
                      aria-label="edit"
                      onClick={() => onTaskClick && onTaskClick(task)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {/* 删除按钮 - 仅在选中时显示 */}
                {selectedTasks[task.id] && (
                  <Tooltip title="删除任务">
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('%c删除任务按钮被点击', 'color: red; font-weight: bold', {
                          taskId: task.id,
                          taskTitle: task.title
                        });
                        try {
                          handleDeleteTask(task.id);
                          console.log('%c删除任务函数已调用完成', 'color: green; font-weight: bold');
                        } catch (error) {
                          console.error('%c删除任务过程中出错:', 'color: red; background: yellow', error);
                          console.log(`删除任务时出错: ${error}`);
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
                )}
                

              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
    </div>
  );
};

export default TaskList;