import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Checkbox,
  Tooltip,
} from '@mui/material';
import {
  Timer as TimerIcon,
  History as HistoryIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  SkipNext as SkipNextIcon,
  Note as NoteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import PomodoroHistory from '../components/pomodoro/PomodoroHistory';
import { usePomodoroStore } from '../store/pomodoroStore';
import { useTaskStore } from '../store/taskStore';
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
      id={`pomodoro-tabpanel-${index}`}
      aria-labelledby={`pomodoro-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box 
          sx={{ 
            p: 3,
            maxHeight: '60vh',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `pomodoro-tab-${index}`,
    'aria-controls': `pomodoro-tabpanel-${index}`,
  };
}

const PomodoroPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});
  const { getRecordsByDate, startPomodoro } = usePomodoroStore();
  const { getTasksByStatus, updateTask, deleteTask } = useTaskStore();
  
  const todayRecords = getRecordsByDate(new Date());
  const activeTasks = getTasksByStatus('in_progress');
  
  // 处理任务选择
  const handleTaskSelection = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskId]: selected
    }));
  };
  
  // 处理开始番茄钟
  const handleStartPomodoro = (taskId: string) => {
    startPomodoro(taskId);
    // 已经在番茄钟页面，不需要跳转
  };
  
  // 处理编辑任务
  const handleEditTask = (taskId: string) => {
    console.log('编辑任务:', taskId);
    // 这里可以添加编辑任务的逻辑，比如打开编辑对话框
  };
  
  // 处理删除任务
  const handleDeleteTask = (taskId: string) => {
    try {
      deleteTask(taskId);
      // 如果任务被删除，清除选中状态
      setSelectedTasks(prev => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
    } catch (error) {
      console.log('删除任务时出错:', error);
    }
  };
  
  // 处理标签页变化
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        番茄钟
      </Typography>
      
      <Grid container spacing={3}>
        {/* 番茄钟计时器 */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 400,
            }}
          >
            <Typography variant="h6" gutterBottom component="div">
              计时器
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <PomodoroTimer />
            </Box>
          </Paper>
        </Grid>
        
        {/* 任务选择和历史记录 */}
        <Grid item xs={12} md={6} lg={8}>
          <Paper elevation={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="pomodoro tabs">
                <Tab icon={<TimerIcon />} label="可用任务" {...a11yProps(0)} />
                <Tab icon={<HistoryIcon />} label="今日记录" {...a11yProps(1)} />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
                选择一个任务开始番茄钟
              </Typography>
              <List sx={{ 
                width: '100%', 
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}>
                {activeTasks.length > 0 ? (
                  activeTasks.map((task) => (
                    <ListItem
                      key={task.id}
                      alignItems="flex-start"
                      sx={{ 
                        py: 2,
                        flexDirection: { xs: 'column', sm: 'row' },
                        '& .MuiListItemText-root': { mb: { xs: 2, sm: 0 } }
                      }}
                      // 移除secondaryAction，改为在ListItem内部末尾添加按钮
                      // secondaryAction属性会导致在小屏幕上按钮与文本重叠
                      divider
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                              {task.title}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ mr: 1 }}
                                >
                                  预估番茄数: 
                                </Typography>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={task.pomodorosEstimated || 0}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value, 10) || 0;
                                    updateTask(task.id, { pomodorosEstimated: Math.max(0, value) });
                                  }}
                                  InputProps={{ 
                                    inputProps: { min: 0, style: { padding: '2px 8px', width: '40px' } } 
                                  }}
                                  variant="outlined"
                                  sx={{ my: -1 }}
                                />
                              </Box>
                              {task.tags && task.tags.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                  {task.tags.map((tag, index) => (
                                    <Chip 
                                      key={index} 
                                      label={tag} 
                                      size="small" 
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        
                        {/* 将按钮移到ListItem内部，避免重叠问题 */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                        }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => handleStartPomodoro(task.id)}
                          >
                            开始
                          </Button>
                          
                          {selectedTasks[task.id] && (
                            <>
                              <Tooltip title="编辑任务">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleEditTask(task.id)}
                                  sx={{ ml: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="删除任务">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteTask(task.id)}
                                  sx={{ ml: 0.5 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <ListItem sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        没有活动任务
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        请先在任务管理中创建任务
                      </Typography>
                    </Box>
                  </ListItem>
                )}
              </List>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <PomodoroHistory pomodoroRecords={todayRecords} />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PomodoroPage;