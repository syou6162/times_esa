import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import { apiClient } from '../../api/client';
import type { DailyReportSummary } from '../../../types/api';
import type { DailyReportsListProps } from '../../types/components';

export const DailyReportsList: React.FC<DailyReportsListProps> = React.memo(({
  selectedDate,
  onDateSelect,
}) => {
  const [reports, setReports] = useState<DailyReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiClient.getRecentDailyReports();
        
        if (result.data && result.data.reports) {
          setReports(result.data.reports);
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('日報の一覧を取得できませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
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
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ bgcolor: 'error.dark', color: 'white' }}>{error}</Alert>
      </Box>
    );
  }

  if (reports.length === 0) {
    return (
      <Box p={2}>
        <Typography sx={{ color: 'white' }}>過去の日報がありません</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {reports.map((report) => (
        <ListItem key={report.date} disablePadding>
          <ListItemButton
            selected={selectedDate === report.date}
            onClick={() => onDateSelect(report.date, { title: report.title, tags: report.tags })}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
              transition: 'background-color 0.2s',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <ListItemText
                primary={report.date}
                secondary={report.title}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: selectedDate === report.date ? 'bold' : 'normal',
                  color: 'white',
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  sx: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
              {report.tags && report.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                  {report.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
});