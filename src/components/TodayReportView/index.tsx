import React from 'react';
import { EsaSubmitForm } from '../EsaSubmitForm';
import DailyReport from '../DailyReport';

export type TodayReportViewProps = {
  // ESA関連のデータ
  esaCategory: string;
  esaTitle: string;
  esaTags: string[];
  esaTagCandidates: string[];
  esaUrl: string;
  esaText: string;
  esaHtml: string;
  
  // 状態管理
  fetching: boolean;
  fetchErrorMessage: string;
  
  // コールバック
  onSubmit: (
    category: string,
    title: string,
    md: string,
    html: string,
    tags: string[]
  ) => void;
  reloadDailyReport: () => void;
};

const getPostsCount = (md: string): number => {
  return md.split('---').length - 1;
};

export const TodayReportView: React.FC<TodayReportViewProps> = ({
  esaCategory,
  esaTitle,
  esaTags,
  esaTagCandidates,
  esaUrl,
  esaText,
  esaHtml,
  fetching,
  fetchErrorMessage,
  onSubmit,
  reloadDailyReport,
}) => {
  return (
    <>
      <a
        href={esaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        #times_esa
      </a>
      {`: 今日は${getPostsCount(esaText)}個つぶやいたよ`}
      
      <EsaSubmitForm
        key="esa_form"
        category={esaCategory}
        title={esaTitle}
        tags={esaTags}
        tagCandidates={esaTagCandidates}
        fetching={fetching}
        onSubmit={onSubmit}
      />
      
      <hr style={{
        borderTop: '2px dashed #bbb', 
        borderBottom: 'none',
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
};

export default TodayReportView;