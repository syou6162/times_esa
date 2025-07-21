import React from 'react';
import { Box, Typography, Button, Divider, Fade } from '@mui/material';
import { DailyReportsList } from '../DailyReportsList';
import type { DailyReportsSidebarProps } from '../../types/components';

export const DailyReportsSidebar: React.FC<DailyReportsSidebarProps> = ({
  selectedDate,
  onDateSelect,
  onTodayClick,
  isMobile,
}) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
      <Box sx={{ p: 2, pt: isMobile ? 2 : 2, pl: isMobile ? 8 : 2 }}>
        <Typography variant="h6" gutterBottom>
          過去の日報一覧
        </Typography>
      </Box>
      {selectedDate && (
        <Fade in={true}>
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={onTodayClick}
              sx={{
                mb: 1,
              }}
            >
              今日の日報に戻る
            </Button>
          </Box>
        </Fade>
      )}
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DailyReportsList
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
        />
      </Box>
    </Box>
  );
};
