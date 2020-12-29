import React from 'react';

type DailyReportProps = {
  fetching: boolean;
  esaText: string;
};

const DailyReport: React.FC<DailyReportProps> = (props: DailyReportProps) => {
  return (
    <div style={{
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      textAlign: 'left',
      justifyContent: 'left',
      alignItems: 'left',
    }}
    >
      {props.fetching ? ('今日の日報を取得中です...') : props.esaText}
    </div>
  );
};

export default DailyReport;
