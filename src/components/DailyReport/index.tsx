import React, { useState } from 'react';
import { Button } from '@material-ui/core';

type DailyReportTextProps = {
  esaText: string;
};

const DailyReportText: React.FC<DailyReportTextProps> = (props: DailyReportTextProps) => {
  return (
    <div style={{
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      textAlign: 'left',
      justifyContent: 'left',
      alignItems: 'left',
    }}
    >
      {props.esaText}
    </div>
  );
};

type DailyReportHtmlProps = {
  esaHtml: string;
};

const DailyReportHtml: React.FC<DailyReportHtmlProps> = (props: DailyReportHtmlProps) => {
  return (
    <div
      style={{
        textAlign: 'left',
        justifyContent: 'left',
        alignItems: 'left',
      }}
      dangerouslySetInnerHTML={{ __html: props.esaHtml }}
    />
  );
};

type DailyReportProps = {
  fetching: boolean;
  esaText: string;
  esaHtml: string;
};

const DailyReport: React.FC<DailyReportProps> = (props: DailyReportProps) => {
  const [isText, setIsText] = useState(false);

  const handleClick = () => {
    setIsText(!isText);
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleClick}
      >
        { isText ? 'text => html' : 'html => text' }
      </Button>
      { /* eslint no-nested-ternary: 0 */ }
      <div>
        {
          props.fetching ? ('今日の日報を取得中です...') : (
            isText ? <DailyReportText esaText={props.esaText} />
              : <DailyReportHtml esaHtml={props.esaHtml} />
          )
        }
      </div>
    </div>
  );
};

export default DailyReport;
