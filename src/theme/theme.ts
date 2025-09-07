import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// 创建主题配置
export const getThemeOptions = (mode: PaletteMode): ThemeOptions => {
  // 共享配置
  const commonOptions: ThemeOptions = {
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light'
              ? '0 4px 12px rgba(0, 0, 0, 0.05)'
              : '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  };

  // 明亮模式配置
  const lightTheme: ThemeOptions = {
    ...commonOptions,
    palette: {
      mode: 'light',
      primary: {
        main: '#2196f3', // 蓝色
        light: '#64b5f6',
        dark: '#1976d2',
        contrastText: '#fff',
      },
      secondary: {
        main: '#ff9800', // 橙色
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#fff',
      },
      error: {
        main: '#f44336', // 红色
        light: '#e57373',
        dark: '#d32f2f',
        contrastText: '#fff',
      },
      warning: {
        main: '#ff9800', // 橙色
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#fff',
      },
      info: {
        main: '#2196f3', // 蓝色
        light: '#64b5f6',
        dark: '#1976d2',
        contrastText: '#fff',
      },
      success: {
        main: '#4caf50', // 绿色
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#fff',
      },
      background: {
        default: '#f5f7fa',
        paper: '#ffffff',
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
        disabled: '#999999',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
    },
  };

  // 暗黑模式配置
  const darkTheme: ThemeOptions = {
    ...commonOptions,
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9', // 亮蓝色
        light: '#e3f2fd',
        dark: '#42a5f5',
        contrastText: '#000',
      },
      secondary: {
        main: '#ffb74d', // 亮橙色
        light: '#ffe0b2',
        dark: '#ff9800',
        contrastText: '#000',
      },
      error: {
        main: '#f44336', // 红色
        light: '#e57373',
        dark: '#d32f2f',
        contrastText: '#fff',
      },
      warning: {
        main: '#ff9800', // 橙色
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#000',
      },
      info: {
        main: '#29b6f6', // 亮蓝色
        light: '#4fc3f7',
        dark: '#0288d1',
        contrastText: '#000',
      },
      success: {
        main: '#66bb6a', // 绿色
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#000',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
        disabled: '#6c6c6c',
      },
      divider: 'rgba(255, 255, 255, 0.12)',
    },
  };

  return mode === 'light' ? lightTheme : darkTheme;
};

// 创建主题
export const getTheme = (mode: PaletteMode) => {
  return createTheme(getThemeOptions(mode));
};