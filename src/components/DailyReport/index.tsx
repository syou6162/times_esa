import React, { useState } from 'react';
import { Button } from '@material-ui/core';

type DailyReportHtmlProps = {
  esaHtml: string;
};

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

type DailyReportTweetProps = {
  esaText: string;
};

const DailyReportTweet: React.FC<DailyReportTweetProps> = (props: DailyReportTweetProps) => {
  const texts = `${props.esaText}\n\n`.split('\n---\n\n').slice(0, -1).map((t) => {
    const regex = /(\d\d:\d\d)\s+(.*?)\s/;
    const match = t.match(regex)!;
    return [match[1], match[2]];
  });
  return (
    <div
      style={{
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        textAlign: 'left',
        justifyContent: 'left',
        alignItems: 'left',
      }}
    >
      {texts.map(([time, t]) => {
        const tweet = `https://twitter.com/intent/tweet?text=${t}`;
        return (
          <div>
            {time}
            {' '}
            {t}
            <Button
              style={{
                margin: '5px',
                textTransform: 'none',
                float: 'right',
              }}
              variant="contained"
              color="primary"
              href={tweet}
            >
              Tweetする
            </Button>
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

type DailyReportProps = {
  fetching: boolean;
  esaText: string;
  esaHtml: string;
  reloadDailyReport: () => void;
};

// eslint-disable-next-line no-shadow, no-unused-vars
enum DailyReportType {
  // eslint-disable-next-line no-unused-vars
  HTML = 'HTML',
  // eslint-disable-next-line no-unused-vars
  TEXT = 'TEXT',
  // eslint-disable-next-line no-unused-vars
  TWEET = 'TWEET',
}

const DailyReport: React.FC<DailyReportProps> = (props: DailyReportProps) => {
  const [
    dailyReportType,
    setDailyReportType,
  ] = useState<DailyReportType>(DailyReportType.HTML);

  const getDailyReportByType = (t: DailyReportType) => {
    switch (t) {
      case DailyReportType.TEXT:
        return (<DailyReportText esaText={props.esaText} />);
      case DailyReportType.HTML:
        return (<DailyReportHtml esaHtml={props.esaHtml} />);
      case DailyReportType.TWEET:
        return (<DailyReportTweet esaText={props.esaText} />);
      default:
        return (<DailyReportHtml esaHtml={props.esaHtml} />);
    }
  };

  return (
    <div>
      <Button
        style={{
          margin: '5px',
        }}
        variant="contained"
        onClick={props.reloadDailyReport}
      >
        最新の日報を取得する
      </Button>
      <Button
        style={{
          margin: '5px',
          textTransform: 'none',
        }}
        variant="contained"
        onClick={() => { setDailyReportType(DailyReportType.HTML); }}
      >
        html
      </Button>
      <Button
        style={{
          margin: '5px',
          textTransform: 'none',
        }}
        variant="contained"
        onClick={() => { setDailyReportType(DailyReportType.TEXT); }}
      >
        text
      </Button>
      <Button
        style={{
          margin: '5px',
          textTransform: 'none',
        }}
        variant="contained"
        onClick={() => { setDailyReportType(DailyReportType.TWEET); }}
      >
        tweet
      </Button>
      { /* eslint no-nested-ternary: 0 */ }
      <div>
        {
          props.fetching ? ('今日の日報を取得中です...') : getDailyReportByType(dailyReportType)
        }
      </div>
    </div>
  );
};

export default DailyReport;
