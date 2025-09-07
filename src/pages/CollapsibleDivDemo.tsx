import React from 'react';
import { Container, Typography, Paper, Box, Grid, Divider } from '@mui/material';
import CollapsibleDiv from '../components/ui/CollapsibleDiv';

/**
 * CollapsibleDiv组件演示页面
 */
const CollapsibleDivDemo: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        可折叠Div组件演示
      </Typography>
      <Typography variant="body1" paragraph>
        这个页面展示了CollapsibleDiv组件的各种用法，可以点击标题区域展开或收起内容。
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              基本用法
            </Typography>
            
            <CollapsibleDiv title="点击展开或收起">
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body1">
                  这是可折叠区域的内容。点击标题可以展开或收起这部分内容。
                </Typography>
              </Box>
            </CollapsibleDiv>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              默认展开
            </Typography>
            
            <CollapsibleDiv title="默认展开的内容" defaultExpanded={true}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body1">
                  这个区域默认是展开的。你可以点击标题将其收起。
                </Typography>
              </Box>
            </CollapsibleDiv>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              自定义样式
            </Typography>
            
            <CollapsibleDiv 
              title="自定义样式的折叠区域" 
              headerSx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                p: 2,
                borderRadius: 2
              }}
              contentSx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'primary.main',
                borderRadius: '0 0 8px 8px'
              }}
            >
              <Typography variant="body1">
                这个区域使用了自定义样式。你可以自定义标题区域和内容区域的样式。
              </Typography>
            </CollapsibleDiv>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              图标位置：开始
            </Typography>
            
            <CollapsibleDiv 
              title="图标在左侧" 
              iconPosition="start"
            >
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body1">
                  这个区域的展开/收起图标位于左侧。
                </Typography>
              </Box>
            </CollapsibleDiv>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              无图标
            </Typography>
            
            <CollapsibleDiv 
              title="没有展开/收起图标" 
              showExpandIcon={false}
            >
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body1">
                  这个区域没有展开/收起图标，但整个标题区域仍然可以点击。
                </Typography>
              </Box>
            </CollapsibleDiv>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              嵌套使用
            </Typography>
            
            <CollapsibleDiv title="外层折叠区域">
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  这是外层折叠区域的内容。
                </Typography>
                
                <CollapsibleDiv title="内层折叠区域 1">
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">
                      这是内层折叠区域 1 的内容。
                    </Typography>
                  </Box>
                </CollapsibleDiv>
                
                <Divider sx={{ my: 2 }} />
                
                <CollapsibleDiv title="内层折叠区域 2">
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">
                      这是内层折叠区域 2 的内容。
                    </Typography>
                  </Box>
                </CollapsibleDiv>
              </Box>
            </CollapsibleDiv>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CollapsibleDivDemo;