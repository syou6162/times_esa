import React, { useState, useEffect } from 'react';
import { Container, Button, Box, Typography, Chip, Drawer, IconButton, useMediaQuery, useTheme, Divider, Fade } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import DailyReport from '../DailyReport';
import { EsaSubmitForm } from '../EsaSubmitForm';
import { DailyReportsList } from '../DailyReportsList';
import { makeDefaultEsaCategory } from '../../util';
import { getDailyReport, getTagList } from '../../api';
import { Tag } from '../../types';
import { TimesEsaProps } from '../../types/components';
import type { DateString } from '../../../types/domain';
import { format } from 'date-fns';



const getPostsCount = (md: string): number => {
  return md.split('---').length - 1;
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

  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState<DateString | undefined>(undefined);
  // 選択中の日報の詳細情報
  const [selectedReportInfo, setSelectedReportInfo] = useState<{ title: string; tags: string[] } | undefined>(undefined);

  // モバイル用Drawerの開閉状態
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const loadDailyReport = async (date?: Date) => {
    setFetching(true);
    setfetchErrorMessage('');

    try {
      const targetDate = date || new Date();
      const res = await getDailyReport(makeDefaultEsaCategory(targetDate));
      setUpdatedAt(res.data.updatedAt);
      setEsaUrl(res.data.url);

      setEsaText(res.data.bodyMd);
      setEsaHtml(res.data.bodyHtml);
      setEsaTags(res.data.tags);
      setEsaTitle(res.data.name);
      setEsaCategory(res.data.category);

      setFetching(false);
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        clearEsaFields();
      }
      setfetchErrorMessage(`${error.code}: ${error.message}`);
      setFetching(false);
    }
  };

  const loadTagList = async () => {
    setFetching(true);
    setfetchErrorMessage('');

    try {
      const res = await getTagList();
      setEsaTagCandidates(res.data.tags.map((esaTag: Tag) => {
        return esaTag.name;
      }));

      setFetching(false);
    } catch (error: any) {
      setfetchErrorMessage(`${error.code}: ${error.message}`);
      setFetching(false);
    }
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
      <Box sx={{ p: 2, pt: isMobile ? 2 : 2, pl: isMobile ? 8 : 2 }}>
        <Typography variant="h6" gutterBottom>
          過去の日報一覧
        </Typography>
      </Box>
      {selectedDate && (
        <Fade in={true}>
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setSelectedDate(undefined);
                setSelectedReportInfo(undefined);
                loadDailyReport();
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ 
                mb: 1,
              }}
            >
              今日の日報に戻る
            </Button>
          </Box>
        </Fade>
      )}
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DailyReportsList
          selectedDate={selectedDate}
          onDateSelect={(date, reportInfo) => {
            setSelectedDate(date);
            setSelectedReportInfo(reportInfo);
            const selectedDateObj = new Date(date);
            loadDailyReport(selectedDateObj);
            if (isMobile) setMobileOpen(false);
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* モバイル用メニューボタン */}
      {isMobile && (
        <IconButton
          color="primary"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: 'action.hover',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'background.paper',
              transform: 'scale(1.05)',
              boxShadow: 2,
            },
            transition: 'all 0.2s',
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* サイドバー/ドロワー */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              bgcolor: '#1a1a1a',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto',
            bgcolor: '#1a1a1a',
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* メインコンテンツ */}
      <Container maxWidth={false} sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 3,
        pt: 1,
      }}>
      {selectedDate && selectedReportInfo && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            {selectedReportInfo.title}
          </Typography>
          {selectedReportInfo.tags && selectedReportInfo.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {selectedReportInfo.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
      <a
        href={esaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        #times_esa
      </a>
      {`: ${selectedDate ? selectedDate : '今日'}は${getPostsCount(esaText)}個つぶやいたよ`}
      {!selectedDate && (
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
      )}
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
    </Container>
    </Box>
  );
};

export default TimesEsa;
