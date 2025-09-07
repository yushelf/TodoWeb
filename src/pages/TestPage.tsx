import React from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import StabilityTester from '../components/test/StabilityTester';
import SettingsTester from '../components/test/SettingsTester';
import PomodoroTester from '../components/test/PomodoroTester';
import TaskGoalTester from '../components/test/TaskGoalTester';

const TestPage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          应用测试中心
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          此页面包含各种测试工具，用于评估应用的稳定性、性能、错误处理能力和用户设置功能。
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="测试选项卡">
            <Tab label="稳定性测试" />
            <Tab label="设置测试" />
            <Tab label="番茄钟测试" />
            <Tab label="任务目标测试" />
          </Tabs>
        </Box>

        {tabValue === 0 && <StabilityTester />}
        {tabValue === 1 && <SettingsTester />}
        {tabValue === 2 && <PomodoroTester />}
        {tabValue === 3 && <TaskGoalTester />}
      </Box>
    </Container>
  );
};

export default TestPage;