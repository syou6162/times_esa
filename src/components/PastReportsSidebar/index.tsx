import React, { memo } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { DailyReportSummary, SelectedDateState } from '../../types/dailyReport';

const SIDEBAR_WIDTH = 280;

export type PastReportsSidebarProps = {
  reports: DailyReportSummary[];
  selectedDate: SelectedDateState;
  onSelectReport: (date: SelectedDateState) => void;
};

export const PastReportsSidebar: React.FC<PastReportsSidebarProps> = memo(({
  reports,
  selectedDate,
  onSelectReport,
}) => {
  return (
    <Box sx={{ 
      width: SIDEBAR_WIDTH, 
      height: '100%', 
      bgcolor: '#121212', 
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      '& ::-webkit-scrollbar': {
        width: '8px',
      },
      '& ::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
      },
      '& ::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      },
    }}>
      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 2 }}>
        日報一覧
      </Typography>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* 今日の日報 */}
        <ListItem
          component="button"
          onClick={() => onSelectReport('today')}
          selected={selectedDate === 'today'}
          sx={{
            borderRadius: 1,
            mb: 1,
            bgcolor: selectedDate === 'today' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.04)',
            },
            border: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <ListItemText
            primary="今日の日報"
            secondary="編集可能"
            primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.87)', fontWeight: selectedDate === 'today' ? 'bold' : 'normal' } }}
            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.6)' } }}
          />
        </ListItem>
        
        {/* 過去の日報 */}
        {reports.map((report) => (
          <ListItem
            key={report.date}
            component="button"
            onClick={() => onSelectReport(report.date)}
            selected={selectedDate === report.date}
            sx={{
              borderRadius: 1,
              mb: 1,
              bgcolor: selectedDate === report.date ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.04)',
              },
              flexDirection: 'column',
              alignItems: 'stretch',
              px: 2,
              py: 1.5,
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.87)', 
                  fontWeight: selectedDate === report.date ? 'bold' : 'normal',
                  mb: 0.5
                }}
              >
                {report.formattedDate}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.87)', 
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                {report.title}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {report.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.87)',
                      fontSize: '0.75rem',
                      height: 20,
                    }}
                  />
                ))}
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.75rem'
                }}
              >
                {report.postsCount}個のつぶやき
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

PastReportsSidebar.displayName = 'PastReportsSidebar';

export default PastReportsSidebar;