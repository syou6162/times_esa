import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';

import DailyReport from '../DailyReport';
import { EsaSubmitForm } from '../EsaSubmitForm';
import { makeDefaultEsaCategory } from '../../util';
import { getDailyReport, getTagList } from '../../api';

export type Tag = {
  name: string;
  posts_count: number; // eslint-disable-line camelcase
}


const getPostsCount = (md: string): number => {
  return md.split('---').length - 1;
};

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

  const clearEsaFields = () => {
    setUpdatedAt('');
    setEsaUrl('');

    setEsaText('');
    setEsaHtml('');
    setEsaTags([]);
    setEsaTitle('日報');
    setEsaCategory('');
  };

  const loadDailyReport = async () => {
    setFetching(true);
    setfetchErrorMessage('');

    try {
      const res = await getDailyReport(makeDefaultEsaCategory(new Date()));
      setUpdatedAt(res.data.updated_at);
      setEsaUrl(res.data.url);

      setEsaText(res.data.body_md);
      setEsaHtml(res.data.body_html);
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
    </Container>
  );
};

export default TimesEsa;
