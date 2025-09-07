import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Tabs, Tab, Chip } from '@mui/material';
import { useTaskStore } from '../../store/taskStore';
import TaskList from './TaskList';
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

// 四象限标题和描述
const quadrantInfo = [
  {
    id: 'important_urgent',
    title: '重要且紧急',
    description: '需要立即处理的危机和问题',
    color: '#f44336', // 红色
  },
  {
    id: 'important_not_urgent',
    title: '重要不紧急',
    description: '有助于实现长期目标的活动',
    color: '#2196f3', // 蓝色
  },
  {
    id: 'not_important_urgent',
    title: '紧急不重要',
    description: '干扰你工作的事情',
    color: '#ff9800', // 橙色
  },
  {
    id: 'not_important_not_urgent',
    title: '不重要不紧急',
    description: '消耗时间的活动',
    color: '#9e9e9e', // 灰色
  },
];

const TaskQuadrants: React.FC = () => {
  // 从任务存储中获取任务
  const tasks = useTaskStore(state => state.tasks);
  const [tabValue, setTabValue] = useState(0);
  
  // 按象限过滤任务
  const getTasksByQuadrant = (quadrant: string): Task[] => {
    return tasks.filter(task => 
      task.quadrant === quadrant && 
      (task.status === 'not_started' || task.status === 'in_progress')
    );
  };
  
  // 处理标签变化
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        任务四象限
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        基于《高效能人士的七个习惯》中的"要事第一"原则，将任务按重要性和紧急性分类
      </Typography>
      
      {/* 移动设备上的标签页导航 */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {quadrantInfo.map(quadrant => (
            <Tab 
              key={quadrant.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2">{quadrant.title}</Typography>
                  <Chip 
                    size="small" 
                    label={getTasksByQuadrant(quadrant.id).length} 
                    sx={{ ml: 1, bgcolor: quadrant.color, color: 'white' }} 
                  />
                </Box>
              } 
            />
          ))}
        </Tabs>
        
        {/* 移动设备上只显示当前选中的象限 */}
        <Box sx={{ p: 1 }}>
          {quadrantInfo.map((quadrant, index) => (
            tabValue === index && (
              <Paper 
                key={quadrant.id} 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  borderTop: `4px solid ${quadrant.color}`,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {quadrant.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {quadrant.description}
                </Typography>
                <TaskList tasks={getTasksByQuadrant(quadrant.id)} quadrant={quadrant.id} />
              </Paper>
            )
          ))}
        </Box>
      </Box>
      
      {/* 桌面设备上的网格布局 */}
      <Grid container spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
        {quadrantInfo.map(quadrant => (
          <Grid item xs={12} md={6} key={quadrant.id}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                height: '100%',
                borderTop: `4px solid ${quadrant.color}`,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {quadrant.title}
                <Chip 
                  size="small" 
                  label={getTasksByQuadrant(quadrant.id).length} 
                  sx={{ ml: 1, bgcolor: quadrant.color, color: 'white' }} 
                />
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {quadrant.description}
              </Typography>
              <TaskList tasks={getTasksByQuadrant(quadrant.id)} quadrant={quadrant.id} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TaskQuadrants;