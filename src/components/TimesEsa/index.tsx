import React, { useState, useEffect } from 'react';
import { Container, Button, Box, Typography, Chip } from '@mui/material';

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

  // 開発用: 過去の日報表示
  const [showPastReports, setShowPastReports] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateString | undefined>(undefined);

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

  return (
    <Container maxWidth={false}>
      {selectedDate && (
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={`${selectedDate}の日報を表示中`} 
            color="primary" 
            sx={{ mr: 1 }}
          />
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

      {/* 開発用: 過去の日報表示機能 */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setShowPastReports(!showPastReports)}
          sx={{ mb: 2 }}
        >
          {showPastReports ? '過去の日報を非表示' : '過去の日報を表示（開発用）'}
        </Button>

        {selectedDate && (
          <Button
            variant="contained"
            onClick={() => {
              setSelectedDate(undefined);
              loadDailyReport(); // 今日の日報を読み込む
            }}
            sx={{ mb: 2, ml: 2 }}
          >
            今日の日報に戻る
          </Button>
        )}

        {showPastReports && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <DailyReportsList
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                // 選択した日付の日報を読み込む
                const selectedDateObj = new Date(date);
                loadDailyReport(selectedDateObj);
              }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TimesEsa;
