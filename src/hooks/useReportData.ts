import { useState, useEffect } from 'react';
import { DailyReportSummary, SelectedDateState } from '../types/domain';
import { mockDailyReports } from '../data/mockReports';

export type UseReportDataReturn = {
  reports: DailyReportSummary[];
  selectedDate: SelectedDateState;
  setSelectedDate: (date: SelectedDateState) => void;
  currentReport: DailyReportSummary | null;
  isToday: boolean;
};

export const useReportData = (): UseReportDataReturn => {
  const [reports] = useState<DailyReportSummary[]>(mockDailyReports);
  const [selectedDate, setSelectedDate] = useState<SelectedDateState>('today');

  const currentReport = selectedDate === 'today' 
    ? null 
    : reports.find(report => report.date === selectedDate) || null;

  const isToday = selectedDate === 'today';

  return {
    reports,
    selectedDate,
    setSelectedDate,
    currentReport,
    isToday,
  };
};