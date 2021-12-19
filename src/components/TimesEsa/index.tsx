import React, { useState, useEffect } from 'react';
import { Container } from '@material-ui/core';
import { getFunctions, httpsCallable } from 'firebase/functions';

import DailyReport from '../DailyReport';
import EsaSubmitForm from '../EsaSubmitForm';
import { makeDefaultEsaCategory } from '../../util';

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

const TimesEsa: React.FC<{}> = () => {
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

  const loadDailyReport = () => {
    setFetching(true);
    setfetchErrorMessage('');

    const functions = getFunctions();
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
    loadDailyReport();
    loadTagList();
  }, []);

  return (
    <Container maxWidth="xl">
      <a
        href={esaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        #times_esa
      </a>
      {`: 今日は${getPostsCount(esaText)}個つぶやいたよ`}
      <EsaSubmitForm
        key={`esa_form_${esaUpdatedAt}_${esaTitle}_${esaCategory}_${esaTags.join(',')}`}
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
