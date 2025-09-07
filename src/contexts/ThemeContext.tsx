import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { getTheme } from '../theme/theme';
import { useUserStore } from '../store/userStore';
import type { PaletteMode } from '@mui/material';

// 主题上下文接口
interface ThemeContextType {
  toggleTheme: () => void;
  mode: PaletteMode;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({ 
  toggleTheme: () => {}, 
  mode: 'light' 
});

// 主题提供器属性
interface ThemeProviderProps {
  children: ReactNode;
}

// 主题提供器组件
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 从用户存储中获取主题模式和切换函数
  const currentUser = useUserStore(state => state.currentUser);
  const toggleTheme = useUserStore(state => state.toggleTheme);
  
  // 当前主题模式
  const mode = currentUser?.preferences.theme || 'light';
  
  // 创建主题
  const theme = useMemo(() => getTheme(mode), [mode]);
  
  // 上下文值
  const contextValue = useMemo(() => ({
    toggleTheme,
    mode
  }), [toggleTheme, mode]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// 使用主题的钩子
export const useTheme = () => useContext(ThemeContext);