import React, { memo } from 'react';
import PastReportHeader from '../PastReportHeader';
import DailyReport from '../DailyReport';
import { DailyReportSummary } from '../../types/dailyReport';

export type PastReportViewProps = {
  report: DailyReportSummary;
  esaText: string;
  esaHtml: string;
  esaUrl?: string;
  fetching?: boolean;
  fetchErrorMessage?: string;
  reloadDailyReport?: () => void;
};

export const PastReportView: React.FC<PastReportViewProps> = memo(({
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
      <PastReportHeader report={report} isReadOnly={true} reportUrl={esaUrl} />
      
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

PastReportView.displayName = 'PastReportView';

export default PastReportView;