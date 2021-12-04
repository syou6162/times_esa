import React, { useState, useEffect } from 'react';
import { Container } from '@material-ui/core';
import { format } from 'date-fns';
import firebase from 'firebase';

import DailyReport from '../DailyReport';
import EsaSubmitForm from '../EsaSubmitForm';

export type Tag = {
  name: string;
  posts_count: number; // eslint-disable-line camelcase
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

  const loadDailyReport = () => {
    setFetching(true);
    setfetchErrorMessage('');

    const getDailyReport = firebase.functions().httpsCallable('dailyReport');
    // ローカルで試したいときはこれを使う
    // const functions = firebase.functions();
    // functions.useFunctionsEmulator('http://localhost:5001');
    // const getDailyReport = functions.httpsCallable('dailyReport');

    const data = getDailyReport({
      category: `日報/${format(new Date(), 'yyyy/MM/dd')}`,
    });
    data.then((res) => {
      setUpdatedAt(res.data.updated_at);
      setEsaUrl(res.data.url);

      setEsaText(res.data.body_md);
      setEsaHtml(res.data.body_html);
      setEsaTags(res.data.tags);
      setEsaTitle(res.data.name);

      setFetching(false);
    }).catch((error) => {
      setfetchErrorMessage(`${error.code}: ${error.message}`);
      setFetching(false);
    });
  };

  const loadTagList = () => {
    setFetching(true);
    setfetchErrorMessage('');

    const getTagList = firebase.functions().httpsCallable('tagList');
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
        style={{
          color: 'white',
        }}
        href={esaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        #times_esa
      </a>
      {`: 今日は${getPostsCount(esaText)}個つぶやいたよ`}
      <EsaSubmitForm
        key={`esa_form_${esaUpdatedAt}_${esaTitle}_${esaTags.join(',')}`}
        title={esaTitle}
        tags={esaTags}
        tagCandidates={esaTagCandidates}
        fetching={fetching}
        onSubmit={(title: string, md: string, html: string, tags: string[]) => {
          setfetchErrorMessage('');

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
