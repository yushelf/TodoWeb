import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Chip,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
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

type TaskPriority = 'high' | 'medium' | 'low';
type TaskQuadrant = 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent';
type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: Task; // 如果提供，则为编辑模式
  quadrant?: TaskQuadrant; // 如果从特定象限添加，预设象限
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'pomodorosSpent'>) => void;
}

// 初始任务状态
const initialTask: Omit<Task, 'id' | 'createdAt' | 'pomodorosSpent'> = {
  title: '',
  description: '',
  status: 'not_started',
  priority: 'medium',
  quadrant: 'important_not_urgent',
  pomodorosEstimated: 0,
  tags: [],
  goalId: undefined,
  dueDate: undefined,
  pomodorosSpent: 0, // 添加这个字段以匹配Task接口
};

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, task, quadrant, onSubmit }) => {
  // 从存储中获取目标列表
  const goals = useGoalStore(state => state.goals);
  const { addTask, updateTask } = useTaskStore();
  
  // 表单状态
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt'>>({ ...initialTask });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState<string>('');
  
  // 当编辑现有任务或预设象限时，初始化表单数据
  useEffect(() => {
    if (task) {
      // 编辑模式 - 使用现有任务数据
      const { id, createdAt, ...taskData } = task;
      setFormData(taskData);
    } else if (quadrant) {
      // 新建模式 - 预设象限
      setFormData(prev => ({ ...prev, quadrant }));
    } else {
      // 新建模式 - 使用默认值
      setFormData({ ...initialTask });
    }
  }, [task, quadrant]);
  
  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // 处理选择变化
  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };
  
  // 处理日期变化
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };
  
  // 处理番茄钟数量变化
  const handlePomodoroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setFormData(prev => ({ ...prev, pomodorosEstimated: Math.max(0, value) }));
  };
  
  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  // 删除标签
  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };
  
  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '任务标题不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 提交表单
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // 调用父组件传递的onSubmit回调
    const { id, createdAt, pomodorosSpent, ...taskData } = formData as any;
    onSubmit(taskData);
    
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {task ? '编辑任务' : '添加新任务'}
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* 任务标题 */}
          <Grid item xs={12}>
            <TextField
              name="title"
              label="任务标题"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title}
              autoFocus
            />
          </Grid>
          
          {/* 任务描述 */}
          <Grid item xs={12}>
            <TextField
              name="description"
              label="任务描述"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          
          {/* 任务象限 */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>任务象限</InputLabel>
              <Select
                name="quadrant"
                value={formData.quadrant}
                onChange={handleSelectChange}
                label="任务象限"
              >
                <MenuItem value="important_urgent">第一象限：重要且紧急</MenuItem>
                <MenuItem value="important_not_urgent">第二象限：重要不紧急</MenuItem>
                <MenuItem value="not_important_urgent">第三象限：紧急不重要</MenuItem>
                <MenuItem value="not_important_not_urgent">第四象限：不重要不紧急</MenuItem>
              </Select>
              <FormHelperText>
                基于《高效能人士的七个习惯》中的四象限法则
              </FormHelperText>
            </FormControl>
          </Grid>
          
          {/* 任务优先级 */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>优先级</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleSelectChange}
                label="优先级"
              >
                <MenuItem value="high">高</MenuItem>
                <MenuItem value="medium">中</MenuItem>
                <MenuItem value="low">低</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* 预估番茄数 */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="pomodorosEstimated"
              label="预估番茄数"
              type="number"
              value={formData.pomodorosEstimated || 0}
              onChange={handlePomodoroChange}
              fullWidth
              InputProps={{ inputProps: { min: 0 } }}
              helperText="预计完成此任务需要的番茄钟数量"
            />
          </Grid>
          
          {/* 截止日期 */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="截止日期"
                value={formData.dueDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: '任务的截止日期（可选）'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* 关联目标 */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>关联目标</InputLabel>
              <Select
                name="goalId"
                value={formData.goalId || ''}
                onChange={handleSelectChange}
                label="关联目标"
              >
                <MenuItem value="">无</MenuItem>
                {goals.map(goal => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                将任务与长期目标关联
              </FormHelperText>
            </FormControl>
          </Grid>
          
          {/* 任务状态 */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="状态"
              >
                <MenuItem value="not_started">未开始</MenuItem>
                <MenuItem value="in_progress">进行中</MenuItem>
                <MenuItem value="completed">已完成</MenuItem>
                <MenuItem value="cancelled">已取消</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* 标签 */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              标签
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="添加标签"
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                sx={{ mr: 1 }}
              />
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleAddTag}
                startIcon={<AddIcon />}
              >
                添加
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {task ? '更新' : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;