import React, { memo } from 'react';
import DailyReportHeader from '../DailyReportHeader';
import DailyReport from '../DailyReport';
import { DailyReportSummary } from '../../types/dailyReport';

export type DailyReportDetailViewProps = {
  report: DailyReportSummary;
  esaText: string;
  esaHtml: string;
  esaUrl?: string;
  fetching?: boolean;
  fetchErrorMessage?: string;
  reloadDailyReport?: () => void;
};

export const DailyReportDetailView: React.FC<DailyReportDetailViewProps> = memo(({
  report,
  esaText,
  esaHtml,
  esaUrl,
  fetching = false,
  fetchErrorMessage = '',
  reloadDailyReport = () => {},
}) => {
  return (
    <>
      <DailyReportHeader report={report} isReadOnly={true} reportUrl={esaUrl} />
      
      <hr style={{
        borderTop: '2px dashed #bbb',
        borderBottom: 'none',
        margin: '20px 0',
      }} />
      
      <DailyReport
        fetching={fetching}
        fetchErrorMessage={fetchErrorMessage}
        esaText={esaText}
        esaHtml={esaHtml}
        reloadDailyReport={reloadDailyReport}
      />
    </>
  );
});

DailyReportDetailView.displayName = 'DailyReportDetailView';

export default DailyReportDetailView;