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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (reports.length === 0) {
    return (
      <Box p={2}>
        <Typography color="text.secondary">過去の日報がありません</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {reports.map((report) => (
        <ListItem key={report.date} disablePadding>
          <ListItemButton
            selected={selectedDate === report.date}
            onClick={() => onDateSelect(report.date)}
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
            <ListItemText
              primary={report.date}
              secondary={report.title}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: selectedDate === report.date ? 'bold' : 'normal',
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                sx: {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
});