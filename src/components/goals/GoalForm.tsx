import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useGoalStore } from '../../store/goalStore';
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

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  goal?: Goal; // 如果提供，则为编辑模式
}

// 初始目标状态
const initialGoal = {
  title: '',
  description: '',
  category: '',
  type: 'short-term' as const,
  status: 'not_started' as const,
  progress: 0,
  targetDate: undefined,
};

const GoalForm: React.FC<GoalFormProps> = ({ open, onClose, goal }) => {
  const { addGoal, updateGoal } = useGoalStore();
  
  // 表单状态
  const [formData, setFormData] = useState<Omit<Goal, 'id' | 'createdAt'>>({ ...initialGoal });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 当编辑现有目标时，初始化表单数据
  useEffect(() => {
    if (goal) {
      // 编辑模式 - 使用现有目标数据
      const { id, createdAt, ...goalData } = goal;
      setFormData(goalData);
    } else {
      // 新建模式 - 使用默认值
      setFormData({ ...initialGoal });
    }
  }, [goal]);
  
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
    setFormData(prev => ({ ...prev, targetDate: date }));
  };
  
  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '目标标题不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 提交表单
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (goal) {
      // 更新现有目标
      updateGoal(goal.id, formData);
    } else {
      // 添加新目标
      addGoal(formData);
    }
    
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {goal ? '编辑目标' : '添加新目标'}
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* 目标标题 */}
          <Grid item xs={12}>
            <TextField
              name="title"
              label="目标标题"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title || '设定一个明确、具体的目标'}
              autoFocus
            />
          </Grid>
          
          {/* 目标描述 */}
          <Grid item xs={12}>
            <TextField
              name="description"
              label="目标描述"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              helperText="描述你的目标，包括为什么它对你很重要（基于'以终为始'的原则）"
            />
          </Grid>
          
          {/* 截止日期 */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="目标日期"
                value={formData.targetDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: '目标的完成期限（可选）'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* 目标状态 */}
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
              <FormHelperText>
                目标的当前状态
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {goal ? '更新' : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalForm;