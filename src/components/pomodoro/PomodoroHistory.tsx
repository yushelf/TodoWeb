import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timer as TimerIcon,
  Event as EventIcon,
  Error as ErrorIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { useTaskStore } from '../../store/taskStore';
import { formatDate, formatDateFriendly } from '../../utils/timeUtils';
// 使用内联定义的PomodoroRecord类型
interface PomodoroRecord {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  notes: string;
  interruptions: {
    id: string;
    time: Date;
    reason: string;
    type: 'internal' | 'external';
  }[];
}

interface PomodoroHistoryProps {
  pomodoroRecords: PomodoroRecord[];
}

const PomodoroHistory: React.FC<PomodoroHistoryProps> = ({ pomodoroRecords }) => {
  const { getTaskById } = useTaskStore();
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  
  // 获取今天的番茄钟记录
  const todayRecords = pomodoroRecords.filter(record => {
    const today = new Date();
    const recordDate = new Date(record.startTime);
    return (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    );
  });
  
  // 获取过去7天的中断记录
  const getInterruptionRecords = (days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    
    const interruptions: {
      id: string;
      time: Date;
      reason: string;
      type: 'internal' | 'external';
      pomodoroId: string;
    }[] = [];
    
    pomodoroRecords.forEach(record => {
      const recordDate = new Date(record.startTime);
      if (recordDate >= pastDate && recordDate <= today) {
        record.interruptions.forEach(interruption => {
          interruptions.push({
            ...interruption,
            pomodoroId: record.id
          });
        });
      }
    });
    
    return interruptions;
  };
  
  const lastWeekInterruptions = getInterruptionRecords(7);
  
  // 按日期分组记录
  const groupRecordsByDate = (records: PomodoroRecord[]) => {
    const grouped: Record<string, PomodoroRecord[]> = {};
    
    records.forEach(record => {
      const dateStr = formatDate(new Date(record.startTime));
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(record);
    });
    
    return grouped;
  };
  
  const groupedRecords = groupRecordsByDate(pomodoroRecords);
  
  // 切换记录展开状态
  const toggleRecordExpand = (recordId: string) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };
  
  // 渲染单个番茄钟记录
  const renderPomodoroRecord = (record: PomodoroRecord) => {
    const task = record.taskId ? getTaskById(record.taskId) : null;
    const isExpanded = expandedRecords[record.id] || false;
    
    return (
      <ListItem key={record.id} divider>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <TimerIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  {task ? task.title : '无任务'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {new Date(record.startTime).toLocaleTimeString()} - {new Date(record.endTime).toLocaleTimeString()}
              </Typography>
            </Box>
          }
          secondary={
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Chip 
                  size="small" 
                  color={record.completed ? "success" : "error"}
                  label={record.completed ? "已完成" : "未完成"} 
                  sx={{ mt: 1 }}
                />
                <IconButton size="small" onClick={() => toggleRecordExpand(record.id)}>
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2 }}>
                  {record.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        <NoteIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        笔记
                      </Typography>
                      <Typography variant="body2">{record.notes}</Typography>
                    </Box>
                  )}
                  
                  {record.interruptions.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        <ErrorIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        中断 ({record.interruptions.length})
                      </Typography>
                      <List dense>
                        {record.interruptions.map((interruption) => (
                          <ListItem key={interruption.id}>
                            <ListItemText
                              primary={interruption.reason}
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {interruption.type === 'internal' ? '内部中断' : '外部中断'}
                                  </Typography>
                                  {' — '}{new Date(interruption.time).toLocaleTimeString()}
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          }
        />
      </ListItem>
    );
  };
  
  // 渲染中断卡片
  const renderInterruptionCard = () => {
    if (lastWeekInterruptions.length === 0) return null;
    
    // 计算内部和外部中断的数量
    const internalCount = lastWeekInterruptions.filter(i => i.type === 'internal').length;
    const externalCount = lastWeekInterruptions.filter(i => i.type === 'external').length;
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <ErrorIcon />
            </Avatar>
          }
          title="过去7天的中断"
          subheader={`共 ${lastWeekInterruptions.length} 次中断`}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="h4" align="center">{internalCount}</Typography>
              <Typography variant="body2" align="center" color="text.secondary">内部中断</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4" align="center">{externalCount}</Typography>
              <Typography variant="body2" align="center" color="text.secondary">外部中断</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // 渲染今日概览
  const renderTodayOverview = () => {
    if (todayRecords.length === 0) return null;
    
    const completedCount = todayRecords.filter(r => r.completed).length;
    const totalDuration = todayRecords.reduce((total, record) => {
      return total + (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / (1000 * 60);
    }, 0);
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <TimerIcon />
            </Avatar>
          }
          title="今日概览"
          subheader={`${formatDateFriendly(new Date())}`}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="h4" align="center">{todayRecords.length}</Typography>
              <Typography variant="body2" align="center" color="text.secondary">总番茄数</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" align="center">{completedCount}</Typography>
              <Typography variant="body2" align="center" color="text.secondary">完成番茄数</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" align="center">{Math.round(totalDuration)}</Typography>
              <Typography variant="body2" align="center" color="text.secondary">专注分钟</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box sx={{ p: 2 }}>
      {renderTodayOverview()}
      {renderInterruptionCard()}
      
      {Object.entries(groupedRecords).length > 0 ? (
        Object.entries(groupedRecords)
          .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
          .map(([date, records]) => (
            <Paper key={date} sx={{ mb: 3, overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1 }} />
                  {formatDateFriendly(new Date(date))}
                </Typography>
              </Box>
              <List>
                {records.map(renderPomodoroRecord)}
              </List>
            </Paper>
          ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary">
            暂无番茄钟记录
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default PomodoroHistory;