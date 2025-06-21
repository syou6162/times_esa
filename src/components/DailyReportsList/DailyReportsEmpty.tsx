import React from 'react';
import { Box, Typography } from '@mui/material';

export const DailyReportsEmpty: React.FC = () => {
  return (
    <Box p={2}>
      <Typography sx={{ color: 'white' }}>過去の日報がありません</Typography>
    </Box>
  );
};