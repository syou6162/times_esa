import React, { useState } from 'react';
import { Button } from '@mui/material';
import { CopyButton } from './share_button/copy_button';
import { TweetButton } from './share_button/tweet_button';

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

type DailyReportShareProps = {
  esaText: string;
}

const DailyReportShare: React.FC<DailyReportShareProps> = (props: DailyReportShareProps) => {
  const texts = `${props.esaText}\n\n`.replace(/(\r\n|\n|\r)/gm, '\n')
    .split('\n---\n').filter(t => t.trim() !== '').map((t) => {
      const trimmedText = t.trim();
      
      // アンカータグ付きの形式: <a id="1234" href="#1234">12:34</a> 内容
      const anchorRegex = /^<a id="\d{4}" href="#\d{4}">(?<time>\d\d:\d\d)<\/a>\s?(?<tweet>[\s\S]*?)\s?$/;
      
      // プレーンな形式: 12:34 内容
      const plainRegex = /^(?<time>\d\d:\d\d)\s+(?<tweet>[\s\S]*?)$/;
      
      // 時間なしの形式: 内容のみ
      const noTimeRegex = /^(?<tweet>[\s\S]+)$/;
      
      const anchorMatch = trimmedText.match(anchorRegex);
      if (anchorMatch && anchorMatch.groups) {
        return [anchorMatch.groups.time || '', anchorMatch.groups.tweet || ''];
      }
      
      const plainMatch = trimmedText.match(plainRegex);
      if (plainMatch && plainMatch.groups) {
        return [plainMatch.groups.time || '', plainMatch.groups.tweet || ''];
      }
      
      const noTimeMatch = trimmedText.match(noTimeRegex);
      if (noTimeMatch && noTimeMatch.groups) {
        return ['', noTimeMatch.groups.tweet || ''];
      }
      
      return ['', trimmedText];
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

export type DailyReportProps = {
  fetching: boolean;
  fetchErrorMessage: string;

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
  SHARE = 'SHARE',
}

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
      return '今日の日報を取得中です...';
    // eslint-disable-next-line no-else-return
    } else if (props.fetchErrorMessage !== '') {
      return props.fetchErrorMessage;
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
