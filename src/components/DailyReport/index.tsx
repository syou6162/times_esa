import React, { useState } from 'react';
import { Button, CircularProgress, Box, Alert } from '@mui/material';
import { CopyButton } from './share_button/copy_button';
import { TweetButton } from './share_button/tweet_button';
import { DailyReportType } from '../../types';
import { DailyReportProps, DailyReportHtmlProps, DailyReportTextProps, DailyReportShareProps } from '../../types/components';


const DailyReportHtml: React.FC<DailyReportHtmlProps> = (props: DailyReportHtmlProps) => {
  return (
    <div
      style={{
        whiteSpace: 'normal',
        overflow: 'hidden',
        textAlign: 'left',
        justifyContent: 'left',
        alignItems: 'left',
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: props.esaHtml }}
    />
  );
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


const DailyReportShare: React.FC<DailyReportShareProps> = (props: DailyReportShareProps) => {
  const texts = `${props.esaText}\n\n`.replace(/(\r\n|\n|\r)/gm, '\n')
    .split('\n---\n\n').slice(0, -1).map((t) => {
      const anchorRegex = /^<a id="\d{4}" href="#\d{4}">(?<time>\d\d:\d\d)<\/a>\s?(?<tweet>[\s\S]*?)\s?$/;
      const plainRegex = /^(?<time>\d\d:\d\d)?\s?(?<tweet>[\s\S]*?)\s?$/;
      const match = t.match(anchorRegex) || t.match(plainRegex);
      if (match != null && match.groups) {
        return [match.groups.time, match.groups.tweet];
      }
      return ['', ''];
    });
  return (
    <div>
      {texts.map(([time, t]) => {
        return (
          <div
            key={`${time}_${t}`}
          >
            <div
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                textAlign: 'left',
                justifyContent: 'left',
                alignItems: 'left',
              }}
            >
              {time}
              {' '}
              {t}
            </div>
            <div>
              <TweetButton text={t} />
              <CopyButton text={t} />
            </div>
            <hr
              style={{
                clear: 'both',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};


export const DailyReport: React.FC<DailyReportProps> = (props: DailyReportProps) => {
  const [dailyReportType, setDailyReportType] = useState<DailyReportType>(DailyReportType.HTML);

  const getDailyReportByType = (t: DailyReportType) => {
    switch (t) {
      case DailyReportType.TEXT:
        return (<DailyReportText esaText={props.esaText} />);
      case DailyReportType.HTML:
        return (<DailyReportHtml esaHtml={props.esaHtml} />);
      case DailyReportType.SHARE:
        return (<DailyReportShare esaText={props.esaText} />);
      default:
        return (<DailyReportHtml esaHtml={props.esaHtml} />);
    }
  };

  const getDailyReportTypeButton = (label: string, t: DailyReportType) => {
    return (
      <Button
        style={{
          margin: '3px',
          textTransform: 'none',
        }}
        variant="contained"
        color="secondary"
        size="small"
        onClick={() => { setDailyReportType(t); }}
      >
        {label}
      </Button>
    );
  };
  const getDailyReport = () => {
    if (props.fetching) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" py={4}>
          <CircularProgress size={40} />
          <Box ml={2}>日報を取得中です...</Box>
        </Box>
      );
    // eslint-disable-next-line no-else-return
    } else if (props.fetchErrorMessage !== '') {
      return (
        <Box py={2}>
          <Alert severity="error" variant="outlined">
            {props.fetchErrorMessage}
          </Alert>
        </Box>
      );
    }
    return getDailyReportByType(dailyReportType);
  };

  return (
    <div>
      <Button
        style={{
          margin: '3px',
          textTransform: 'none',
        }}
        variant="contained"
        size="small"
        color="secondary"
        onClick={props.reloadDailyReport}
        disabled={props.isReadOnly}
      >
        Update
      </Button>
      { getDailyReportTypeButton('html', DailyReportType.HTML) }
      { getDailyReportTypeButton('text', DailyReportType.TEXT) }
      { getDailyReportTypeButton('share', DailyReportType.SHARE) }
      { /* eslint no-nested-ternary: 0 */ }
      <div>
        { getDailyReport() }
      </div>
    </div>
  );
};

export default DailyReport;
