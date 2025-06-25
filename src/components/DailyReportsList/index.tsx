import React, { useState, useEffect } from 'react';
import { List } from '@mui/material';
import { format } from 'date-fns';
import { apiClient } from '../../api/client';
import type { DailyReportSummary } from '../../../types/api';
import type { DailyReportsListProps } from '../../types/components';
import { DailyReportItem } from './DailyReportItem';
import { DailyReportsLoading } from './DailyReportsLoading';
import { DailyReportsError } from './DailyReportsError';
import { DailyReportsEmpty } from './DailyReportsEmpty';

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
    return <DailyReportsLoading />;
  }

  if (error) {
    return <DailyReportsError message={error} />;
  }

  if (reports.length === 0) {
    return <DailyReportsEmpty />;
  }

  const todayDateString = format(new Date(), 'yyyy-MM-dd');
  
  const filteredReports = selectedDate 
    ? reports.filter(report => report.date !== todayDateString)
    : reports;

  return (
    <List sx={{ p: 0 }}>
      {filteredReports.map((report) => (
        <DailyReportItem
          key={report.date}
          report={report}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
        />
      ))}
    </List>
  );
});
