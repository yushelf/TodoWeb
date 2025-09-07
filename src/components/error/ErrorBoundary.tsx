import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新状态，下次渲染将显示降级UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息
    console.error('组件错误:', error, errorInfo);
    this.setState({ errorInfo });
    
    // 调用可选的错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // 在开发环境中，可以将错误信息发送到错误跟踪服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以添加错误上报逻辑
      // 例如: errorTrackingService.report(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError) {
      // 如果提供了自定义的降级UI，则使用它
      if (fallback) {
        return fallback;
      }

      // 默认的错误UI
      return (
        <Paper 
          elevation={3}
          sx={{
            p: 3,
            m: 2,
            borderRadius: 2,
            backgroundColor: '#fff8f8',
            border: '1px solid #ffcdd2'
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="error" gutterBottom>
              组件错误
            </Typography>
            
            <Typography variant="body1">
              {componentName ? `${componentName} 组件` : '页面组件'}加载失败
            </Typography>
            
            {error && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                错误信息: {error.toString()}
              </Typography>
            )}
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              sx={{ mt: 2 }}
            >
              尝试恢复
            </Button>
          </Box>
        </Paper>
      );
    }

    // 正常渲染子组件
    return children;
  }
}

export default ErrorBoundary;