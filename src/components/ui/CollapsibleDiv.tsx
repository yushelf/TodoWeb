import React, { useState, ReactNode } from 'react';
import { Box, IconButton, Collapse, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface CollapsibleDivProps {
  /**
   * 折叠区域的标题
   */
  title?: ReactNode;
  
  /**
   * 折叠区域的内容
   */
  children: ReactNode;
  
  /**
   * 初始是否展开
   */
  defaultExpanded?: boolean;
  
  /**
   * 自定义标题区域样式
   */
  headerSx?: object;
  
  /**
   * 自定义内容区域样式
   */
  contentSx?: object;
  
  /**
   * 自定义容器样式
   */
  sx?: object;
  
  /**
   * 展开/收起状态变化时的回调
   */
  onExpandChange?: (expanded: boolean) => void;
  
  /**
   * 是否显示展开/收起图标
   */
  showExpandIcon?: boolean;
  
  /**
   * 自定义展开/收起图标位置
   */
  iconPosition?: 'start' | 'end';
}

/**
 * 可折叠的div组件
 * 点击可以展开或收起内容，提供更多空间给页面
 */
const CollapsibleDiv: React.FC<CollapsibleDivProps> = ({
  title,
  children,
  defaultExpanded = false,
  headerSx = {},
  contentSx = {},
  sx = {},
  onExpandChange,
  showExpandIcon = true,
  iconPosition = 'end'
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (onExpandChange) {
      onExpandChange(newExpanded);
    }
  };
  
  return (
    <Box sx={{ width: '100%', ...sx }}>
      {/* 标题区域，点击可展开/收起 */}
      <Box
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          p: 1,
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          },
          ...headerSx
        }}
      >
        {/* 根据iconPosition决定图标位置 */}
        {iconPosition === 'start' && showExpandIcon && (
          <IconButton size="small" edge="start" onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
        
        {/* 标题内容 */}
        {typeof title === 'string' ? (
          <Typography variant="subtitle1" component="div">
            {title}
          </Typography>
        ) : (
          title
        )}
        
        {/* 根据iconPosition决定图标位置 */}
        {iconPosition === 'end' && showExpandIcon && (
          <IconButton size="small" edge="end" onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      
      {/* 可折叠内容区域 */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1, ...contentSx }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

export default CollapsibleDiv;