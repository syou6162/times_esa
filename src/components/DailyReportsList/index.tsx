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
} from '@mui/material';
import { apiClient } from '../../api/client';
import type { DailyReportSummary } from '../../../types/api';

interface DailyReportsListProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
}

export const DailyReportsList: React.FC<DailyReportsListProps> = ({
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
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
    <List>
      {reports.map((report) => (
        <ListItem key={report.date} disablePadding>
          <ListItemButton
            selected={selectedDate === report.date}
            onClick={() => onDateSelect(report.date)}
          >
            <ListItemText
              primary={report.date}
              secondary={report.title || '無題の日報'}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};