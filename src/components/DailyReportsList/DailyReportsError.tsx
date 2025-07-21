import React from 'react';
import { Box, Alert } from '@mui/material';

type DailyReportsErrorProps = {
  message: string;
};

export const DailyReportsError: React.FC<DailyReportsErrorProps> = ({ message }) => {
  return (
    <Box p={2}>
      <Alert severity="error" sx={{ bgcolor: 'error.dark', color: 'white' }}>{message}</Alert>
    </Box>
  );
};
