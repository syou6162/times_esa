import React, { memo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { DailyReportSummary } from '../../types/dailyReport';

export type PastReportHeaderProps = {
  report: DailyReportSummary;
  isReadOnly?: boolean;
  reportUrl?: string;
};

export const PastReportHeader: React.FC<PastReportHeaderProps> = memo(({
  report,
  isReadOnly = true,
  reportUrl,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>
          {report.title}
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        {(reportUrl || report.url) ? (
          <a
            href={reportUrl || report.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}
          >
            {report.formattedDate}の日報
          </a>
        ) : (
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {report.formattedDate}の日報
          </Typography>
        )}
      </Box>
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
        {report.postsCount}個のつぶやき
      </Typography>
    </Box>
  );
});

PastReportHeader.displayName = 'PastReportHeader';

export default PastReportHeader;