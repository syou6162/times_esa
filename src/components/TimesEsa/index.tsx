import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, List, ListItem, ListItemText, Button, Drawer, useMediaQuery, useTheme, IconButton, Chip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { getFunctions, httpsCallable } from 'firebase/functions';

import DailyReport from '../DailyReport';
import { EsaSubmitForm } from '../EsaSubmitForm';
import { functionsRegion, makeDefaultEsaCategory } from '../../util';

export type Tag = {
  name: string;
  posts_count: number; // eslint-disable-line camelcase
}

type dailyReportRequestType = {
  category: string;
}

type dailyReportResponseType = {
  updated_at: string;
  url: string;

  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
}

type tagListRequestType = {
}

type tagListResponseType = {
  tags: Tag[];
}

const getPostsCount = (md: string): number => {
  return md.split('---').length - 1;
};

// モックデータ
const mockPastReports = [
  { 
    date: '2024-06-19', 
    title: '開発、会議、レビュー', 
    postsCount: 5,
    tags: ['開発', 'times_esa'],
    formattedDate: '6月19日(水)'
  },
  { 
    date: '2024-06-18', 
    title: 'レビュー、設計', 
    postsCount: 3,
    tags: ['設計', 'レビュー'],
    formattedDate: '6月18日(火)'
  },
  { 
    date: '2024-06-17', 
    title: 'バグ修正、テスト', 
    postsCount: 7,
    tags: ['バグ修正', 'テスト'],
    formattedDate: '6月17日(月)'
  },
  { 
    date: '2024-06-14', 
    title: '企画会議、調査', 
    postsCount: 4,
    tags: ['企画', '調査'],
    formattedDate: '6月14日(金)'
  },
  { 
    date: '2024-06-13', 
    title: 'コードレビュー', 
    postsCount: 2,
    tags: ['レビュー'],
    formattedDate: '6月13日(木)'
  },
  { 
    date: '2024-06-12', 
    title: '機能実装、デバッグ', 
    postsCount: 6,
    tags: ['開発', 'デバッグ'],
    formattedDate: '6月12日(水)'
  },
  { 
    date: '2024-06-11', 
    title: 'ドキュメント作成', 
    postsCount: 3,
    tags: ['ドキュメント'],
    formattedDate: '6月11日(火)'
  },
  { 
    date: '2024-06-10', 
    title: 'プロトタイプ作成', 
    postsCount: 8,
    tags: ['プロトタイプ', '開発'],
    formattedDate: '6月10日(月)'
  },
];

const mockPastReportContent = {
  '2024-06-19': {
    body_md: '09:30 朝の準備\n---\n10:00 チーム会議参加\n---\n14:00 コードレビュー実施\n---\n16:30 新機能の設計検討\n---\n18:00 今日の振り返り',
    body_html: '<p>09:30 朝の準備</p><hr><p>10:00 チーム会議参加</p><hr><p>14:00 コードレビュー実施</p><hr><p>16:30 新機能の設計検討</p><hr><p>18:00 今日の振り返り</p>',
  },
  '2024-06-18': {
    body_md: '09:00 バグ調査開始\n---\n11:30 修正コミット\n---\n15:00 テスト実行',
    body_html: '<p>09:00 バグ調査開始</p><hr><p>11:30 修正コミット</p><hr><p>15:00 テスト実行</p>',
  },
};

const SIDEBAR_WIDTH = 280;

type TimesEsaProps = {
  canFetchCloudFunctionEndpoints: boolean;
};

const TimesEsa: React.FC<TimesEsaProps> = (props: TimesEsaProps) => {
  const [fetching, setFetching] = useState(false);
  const [fetchErrorMessage, setfetchErrorMessage] = useState<string>('');

  const [esaUpdatedAt, setUpdatedAt] = useState<string>('');
  const [esaUrl, setEsaUrl] = useState<string>('');
  const [esaText, setEsaText] = useState<string>('');
  const [esaHtml, setEsaHtml] = useState<string>('');
  const [esaTags, setEsaTags] = useState<string[]>([]);
  const [esaTagCandidates, setEsaTagCandidates] = useState<string[]>([]);
  const [esaTitle, setEsaTitle] = useState<string>('日報');
  const [esaCategory, setEsaCategory] = useState<string>('');

  // 新しい状態: 選択された日付とサイドバー表示状態
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // レスポンシブ対応
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const clearEsaFields = () => {
    setUpdatedAt('');
    setEsaUrl('');

    setEsaText('');
    setEsaHtml('');
    setEsaTags([]);
    setEsaTitle('日報');
    setEsaCategory('');
  };

  const loadDailyReport = () => {
    setFetching(true);
    setfetchErrorMessage('');

    const functions = getFunctions();
    functions.region = functionsRegion;
    const getDailyReport = httpsCallable<dailyReportRequestType, dailyReportResponseType>(functions, 'dailyReport');
    // ローカルで試したいときはこれを使う
    // const functions = firebase.functions();
    // functions.useFunctionsEmulator('http://localhost:5001');
    // const getDailyReport = functions.httpsCallable('dailyReport');

    const data = getDailyReport({
      category: makeDefaultEsaCategory(new Date()),
    });
    data.then((res) => {
      setUpdatedAt(res.data.updated_at);
      setEsaUrl(res.data.url);

      setEsaText(res.data.body_md);
      setEsaHtml(res.data.body_html);
      setEsaTags(res.data.tags);
      setEsaTitle(res.data.name);
      setEsaCategory(res.data.category);

      setFetching(false);
    }).catch((error) => {
      if (error.code === 'NOT_FOUND') {
        clearEsaFields();
      }
      setfetchErrorMessage(`${error.code}: ${error.message}`);
      setFetching(false);
    });
  };

  const loadTagList = () => {
    setFetching(true);
    setfetchErrorMessage('');

    const functions = getFunctions();
    functions.region = functionsRegion;

    const getTagList = httpsCallable<tagListRequestType, tagListResponseType>(functions, 'tagList');
    const data = getTagList();

    data.then((res) => {
      setEsaTagCandidates(res.data.tags.map((esaTag: Tag) => {
        return esaTag.name;
      }));

      setFetching(false);
    }).catch((error) => {
      setfetchErrorMessage(`${error.code}: ${error.message}`);
      setFetching(false);
    });
  };

  useEffect(() => {
    if (props.canFetchCloudFunctionEndpoints) {
      loadDailyReport();
      loadTagList();
    }

    return () => {
      setFetching(false); // To avoid memory leak
    };
  }, []);

  // 日報を選択した時の処理
  const handleSelectReport = (date: string) => {
    setSelectedDate(date);
    if (isMobile) {
      setSidebarOpen(false); // モバイルではサイドバーを閉じる
    }
    
    if (date === 'today') {
      // 今日の日報を再読み込み（実際のAPIは今は叩かない）
      loadDailyReport();
    } else {
      // モックデータから日報内容を取得
      const content = mockPastReportContent[date as keyof typeof mockPastReportContent];
      if (content) {
        setEsaText(content.body_md);
        setEsaHtml(content.body_html);
        setEsaTitle('過去の日報');
        setEsaCategory(`日報/${date.replace(/-/g, '/')}`);
        setEsaUrl(`https://example.esa.io/posts/mock-${date}`);
        setUpdatedAt(`${date}T18:00:00+09:00`);
      }
    }
  };

  // サイドバーの日報リスト
  const renderSidebar = () => (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', bgcolor: '#1e1e1e', p: 2 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        日報一覧
      </Typography>
      <List>
        {/* 今日の日報 */}
        <ListItem
          button
          onClick={() => handleSelectReport('today')}
          selected={selectedDate === 'today'}
          sx={{
            borderRadius: 1,
            mb: 1,
            bgcolor: selectedDate === 'today' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <ListItemText
            primary="今日の日報"
            secondary="編集可能"
            primaryTypographyProps={{ sx: { color: 'white', fontWeight: selectedDate === 'today' ? 'bold' : 'normal' } }}
            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
        </ListItem>
        
        {/* 過去の日報 */}
        {mockPastReports.map((report) => (
          <ListItem
            key={report.date}
            button
            onClick={() => handleSelectReport(report.date)}
            selected={selectedDate === report.date}
            sx={{
              borderRadius: 1,
              mb: 1,
              bgcolor: selectedDate === report.date ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
              flexDirection: 'column',
              alignItems: 'stretch',
              px: 2,
              py: 1.5,
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'white', 
                  fontWeight: selectedDate === report.date ? 'bold' : 'normal',
                  mb: 0.5
                }}
              >
                {report.formattedDate}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white', 
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                {report.title}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {report.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '0.75rem',
                      height: 20,
                    }}
                  />
                ))}
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem'
                }}
              >
                {report.postsCount}個のつぶやき
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* サイドバー（デスクトップ） */}
      {!isMobile && (
        <Box sx={{ flexShrink: 0 }}>
          {renderSidebar()}
        </Box>
      )}

      {/* サイドバー（モバイル） */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {renderSidebar()}
      </Drawer>

      {/* メインコンテンツ */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* モバイル用ハンバーガーメニュー */}
        {isMobile && (
          <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1000 }}>
            <IconButton
              onClick={() => setSidebarOpen(true)}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}
        
        <Container maxWidth={false} sx={{ 
          p: 2, 
          pt: isMobile ? 4 : 2  // モバイルでの上部マージンを調整
        }}>

          {/* 今日の日報表示 */}
          {selectedDate === 'today' && (
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
                onSubmit={(
                  category: string,
                  title: string,
                  md: string,
                  html: string,
                  tags: string[],
                ) => {
                  setfetchErrorMessage('');

                  setEsaCategory(category);
                  setEsaTitle(title);
                  setEsaText(md);
                  setEsaHtml(html);
                  setEsaTags(tags);
                }}
              />
              <hr style={{
                borderTop: '2px dashed #bbb', borderBottom: 'none',
              }}
              />
              <DailyReport
                fetching={fetching}
                fetchErrorMessage={fetchErrorMessage}
                esaText={esaText}
                esaHtml={esaHtml}
                reloadDailyReport={() => { loadDailyReport(); }}
              />
            </>
          )}

          {/* 過去の日報表示 */}
          {selectedDate !== 'today' && (() => {
            const selectedReport = mockPastReports.find(report => report.date === selectedDate);
            return (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                    {selectedReport?.formattedDate}の日報（読み取り専用）
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    {selectedReport?.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedReport?.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    過去の日報は編集できません・{selectedReport?.postsCount}個のつぶやき
                  </Typography>
                </Box>
                <hr style={{
                  borderTop: '2px dashed #bbb', borderBottom: 'none',
                  margin: '20px 0',
                }}
                />
                <DailyReport
                  fetching={false}
                  fetchErrorMessage=""
                  esaText={esaText}
                  esaHtml={esaHtml}
                  reloadDailyReport={() => {}}
                />
              </>
            );
          })()}
        </Container>
      </Box>
    </Box>
  );
};

export default TimesEsa;
