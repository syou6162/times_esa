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
          {report.formattedDate}の日報{isReadOnly && '（読み取り専用）'}
        </Typography>
        {(reportUrl || report.url) && (
          <a
            href={reportUrl || report.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4fc3f7', textDecoration: 'none' }}
          >
            #times_esa
          </a>
        )}
      </Box>
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
});

PastReportHeader.displayName = 'PastReportHeader';

export default PastReportHeader;