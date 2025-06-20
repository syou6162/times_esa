import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { DailyReportSummary, SelectedDateState } from '../../types/dailyReport';

const SIDEBAR_WIDTH = 280;

export type PastReportsSidebarProps = {
  reports: DailyReportSummary[];
  selectedDate: SelectedDateState;
  onSelectReport: (date: SelectedDateState) => void;
};

export const PastReportsSidebar: React.FC<PastReportsSidebarProps> = ({
  reports,
  selectedDate,
  onSelectReport,
}) => {
  return (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', bgcolor: '#1e1e1e', p: 2 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        日報一覧
      </Typography>
      <List>
        {/* 今日の日報 */}
        <ListItem
          component="button"
          onClick={() => onSelectReport('today')}
          selected={selectedDate === 'today'}
          sx={{
            borderRadius: 1,
            mb: 1,
            bgcolor: selectedDate === 'today' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <ListItemText
            primary="今日の日報"
            secondary="編集可能"
            primaryTypographyProps={{ sx: { color: 'white', fontWeight: selectedDate === 'today' ? 'bold' : 'normal' } }}
            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
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
              bgcolor: selectedDate === report.date ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
              flexDirection: 'column',
              alignItems: 'stretch',
              px: 2,
              py: 1.5,
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'white', 
                  fontWeight: selectedDate === report.date ? 'bold' : 'normal',
                  mb: 0.5
                }}
              >
                {report.formattedDate}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white', 
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
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '0.75rem',
                      height: 20,
                    }}
                  />
                ))}
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
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
};

export default PastReportsSidebar;