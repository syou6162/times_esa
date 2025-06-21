import React, { useEffect, useMemo, useCallback } from 'react';
import { Container, Box } from '@mui/material';

import PastReportsSidebar from '../PastReportsSidebar';
import MobileHamburgerMenu from '../MobileHamburgerMenu';
import TodayReportView from '../TodayReportView';
import PastReportView from '../PastReportView';
import { useReportData } from '../../hooks/useReportData';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useDailyReportAPI } from '../../hooks/useDailyReportAPI';
import { makeDefaultEsaCategory } from '../../util';
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
  const handleSelectReport = useCallback((date: string) => {
    setSelectedDate(date);
    if (isMobile) {
      setSidebarOpen(false);
    }
    
    if (date === 'today') {
      loadDailyReport();
    }
  }, [isMobile, setSidebarOpen, setSelectedDate, loadDailyReport]);

  // 過去の日報データ取得
  const getPastReportContent = useCallback((date: string) => {
    const content = mockPastReportContent[date as keyof typeof mockPastReportContent];
    return content ? {
      esaText: content.body_md,
      esaHtml: content.body_html,
      esaUrl: content.url,
    } : { esaText: '', esaHtml: '', esaUrl: undefined };
  }, []);

  // 今日の日報表示用のプロパティを最適化
  const todayReportProps = useMemo(() => {
    if (!dailyReportData) return null;
    
    return {
      esaCategory: dailyReportData.category || makeDefaultEsaCategory(new Date()),
      esaTitle: dailyReportData.title || '日報',
      esaTags: dailyReportData.tags || [],
      esaTagCandidates: tagCandidates,
      esaUrl: dailyReportData.url || '',
      esaText: dailyReportData.text || '',
      esaHtml: dailyReportData.html || '',
      fetching,
      fetchErrorMessage,
    };
  }, [dailyReportData, tagCandidates, fetching, fetchErrorMessage]);

  // 過去の日報表示用のプロパティを最適化
  const pastReportProps = useMemo(() => {
    if (isToday || !currentReport) return null;
    
    const { esaText, esaHtml, esaUrl } = getPastReportContent(currentReport.date);
    return {
      report: currentReport,
      esaText,
      esaHtml,
      esaUrl,
      fetching: false,
      fetchErrorMessage: '',
      reloadDailyReport: () => {},
    };
  }, [isToday, currentReport, getPastReportContent]);

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
          {isToday && todayReportProps && (
            <TodayReportView
              {...todayReportProps}
              esaTagCandidates={tagCandidates}
              onSubmit={(category, title, md, html, tags) => {
                // フォーム送信の処理は後で実装
                console.log('Form submitted:', { category, title, md, html, tags });
              }}
              reloadDailyReport={loadDailyReport}
            />
          )}

          {/* 過去の日報表示 */}
          {pastReportProps && (
            <PastReportView {...pastReportProps} />
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default TimesEsa;
