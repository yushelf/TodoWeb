import React, { useState, useRef } from 'react';
import {
  Typography,
  Button,
  Box,
  Divider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import dataService from '../../services/dataService';

const DataManagement: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导出数据
  const handleExportData = () => {
    try {
      dataService.exportDataToFile();
      setSnackbar({ open: true, message: '数据导出成功', severity: 'success' });
    } catch (error) {
      console.error('导出数据失败:', error);
      setSnackbar({ open: true, message: '导出数据失败', severity: 'error' });
    }
  };

  // 处理导入数据
  const handleImportData = async (file: File) => {
    setImporting(true);
    try {
      const success = await dataService.importDataFromFile(file);
      if (success) {
        setSnackbar({ open: true, message: '数据导入成功', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: '数据导入失败', severity: 'error' });
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      setSnackbar({ open: true, message: '导入数据失败', severity: 'error' });
    } finally {
      setImporting(false);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImportData(file);
    }
  };

  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 处理重置数据
  const handleResetData = () => {
    dataService.resetAllData();
    setOpenResetDialog(false);
    setSnackbar({ open: true, message: '所有数据已重置', severity: 'success' });
  };

  // 关闭Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>数据管理</Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>数据备份与恢复</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          导出您的所有数据进行备份，或从之前的备份中恢复数据。
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handleExportData}
          >
            导出数据
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<UploadIcon />} 
            onClick={triggerFileInput}
            disabled={importing}
          >
            {importing ? <CircularProgress size={24} /> : '导入数据'}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json" 
            onChange={handleFileChange} 
          />
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box>
        <Typography variant="subtitle1" gutterBottom>重置数据</Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          重置将清除所有番茄钟记录、任务和目标数据。此操作不可逆，请确保在重置前备份您的数据。
        </Alert>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={() => setOpenResetDialog(true)}
        >
          重置所有数据
        </Button>
      </Box>

      {/* 重置确认对话框 */}
      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
      >
        <DialogTitle>确定要重置所有数据吗？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            此操作将清除所有番茄钟记录、任务和目标数据，且无法恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>取消</Button>
          <Button onClick={handleResetData} color="error" autoFocus>
            确定重置
          </Button>
        </DialogActions>
      </Dialog>

      {/* 消息提示 */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataManagement;