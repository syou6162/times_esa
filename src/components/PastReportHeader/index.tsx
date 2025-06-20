import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { DailyReportSummary } from '../../types/dailyReport';

export type PastReportHeaderProps = {
  report: DailyReportSummary;
  isReadOnly?: boolean;
};

export const PastReportHeader: React.FC<PastReportHeaderProps> = ({
  report,
  isReadOnly = true,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
        {report.formattedDate}の日報{isReadOnly && '（読み取り専用）'}
      </Typography>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        {report.title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {report.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            variant="outlined"
          />
        ))}
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
        {isReadOnly && '過去の日報は編集できません・'}{report.postsCount}個のつぶやき
      </Typography>
    </Box>
  );
};

export default PastReportHeader;