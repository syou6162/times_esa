import React, { useEffect } from 'react';
import { Container, Box } from '@mui/material';

import { EsaSubmitForm } from '../EsaSubmitForm';
import PastReportsSidebar from '../PastReportsSidebar';
import MobileHamburgerMenu from '../MobileHamburgerMenu';
import TodayReportView from '../TodayReportView';
import PastReportView from '../PastReportView';
import { useReportData } from '../../hooks/useReportData';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useDailyReportAPI } from '../../hooks/useDailyReportAPI';
import { makeDefaultEsaCategory } from '../../util';
import { getPostsCount } from '../../utils/dailyReportUtils';
import { mockPastReportContent } from '../../data/mockReports';

const SIDEBAR_WIDTH = 280;

type TimesEsaProps = {
  canFetchCloudFunctionEndpoints: boolean;
};

const TimesEsa: React.FC<TimesEsaProps> = (props: TimesEsaProps) => {
  // カスタムフックを使用
  const { reports, selectedDate, setSelectedDate, currentReport, isToday } = useReportData();
  const { isMobile, sidebarOpen, setSidebarOpen, toggleSidebar } = useResponsiveLayout();
  const { 
    fetching, 
    fetchErrorMessage, 
    dailyReportData, 
    tagCandidates, 
    loadDailyReport, 
    loadTagList 
  } = useDailyReportAPI(props.canFetchCloudFunctionEndpoints);


  useEffect(() => {
    if (props.canFetchCloudFunctionEndpoints) {
      loadDailyReport();
      loadTagList();
    }
  }, [props.canFetchCloudFunctionEndpoints, loadDailyReport, loadTagList]);

  // 日報を選択した時の処理
  const handleSelectReport = (date: string) => {
    setSelectedDate(date);
    if (isMobile) {
      setSidebarOpen(false);
    }
    
    if (date === 'today') {
      loadDailyReport();
    }
  };

  // 過去の日報データ取得
  const getPastReportContent = (date: string) => {
    const content = mockPastReportContent[date as keyof typeof mockPastReportContent];
    return content ? {
      esaText: content.body_md,
      esaHtml: content.body_html,
    } : { esaText: '', esaHtml: '' };
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* サイドバー（デスクトップ） */}
      {!isMobile && (
        <Box sx={{ flexShrink: 0, width: SIDEBAR_WIDTH }}>
          <PastReportsSidebar
            reports={reports}
            selectedDate={selectedDate}
            onSelectReport={handleSelectReport}
          />
        </Box>
      )}

      {/* モバイル用ハンバーガーメニュー */}
      {isMobile && (
        <MobileHamburgerMenu
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        >
          <PastReportsSidebar
            reports={reports}
            selectedDate={selectedDate}
            onSelectReport={handleSelectReport}
          />
        </MobileHamburgerMenu>
      )}

      {/* メインコンテンツ */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>        
        <Container maxWidth={false} sx={{ 
          p: 2, 
          pt: isMobile ? 4 : 2
        }}>
          {/* 今日の日報表示 */}
          {isToday && dailyReportData && (
            <TodayReportView
              esaCategory={dailyReportData.category || makeDefaultEsaCategory(new Date())}
              esaTitle={dailyReportData.title || '日報'}
              esaTags={dailyReportData.tags || []}
              esaTagCandidates={tagCandidates}
              esaUrl={dailyReportData.url || ''}
              esaText={dailyReportData.text || ''}
              esaHtml={dailyReportData.html || ''}
              fetching={fetching}
              fetchErrorMessage={fetchErrorMessage}
              onSubmit={(category, title, md, html, tags) => {
                // フォーム送信の処理は後で実装
                console.log('Form submitted:', { category, title, md, html, tags });
              }}
              reloadDailyReport={loadDailyReport}
            />
          )}

          {/* 過去の日報表示 */}
          {!isToday && currentReport && (() => {
            const { esaText, esaHtml } = getPastReportContent(currentReport.date);
            return (
              <PastReportView
                report={currentReport}
                esaText={esaText}
                esaHtml={esaHtml}
                fetching={false}
                fetchErrorMessage=""
                reloadDailyReport={() => {}}
              />
            );
          })()}
        </Container>
      </Box>
    </Box>
  );
};

export default TimesEsa;
