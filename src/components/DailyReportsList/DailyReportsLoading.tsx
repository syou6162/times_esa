import React from 'react';
import { Box, Skeleton } from '@mui/material';

export const DailyReportsLoading: React.FC = () => {
  return (
    <Box sx={{ p: 1 }}>
      {[...Array(5)].map((_, index) => (
        <Skeleton 
          key={index} 
          variant="rectangular" 
          height={72} 
          sx={{ mb: 1, borderRadius: 1 }}
        />
      ))}
    </Box>
  );
};