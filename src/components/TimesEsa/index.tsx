import React, { useState, useEffect } from 'react';
import { Container } from '@material-ui/core';
import { format } from 'date-fns';
import firebase from 'firebase';

import DailyReport from '../DailyReport';
import EsaSubmitForm from '../EsaSubmitForm';

const TimesEsa: React.FC<{}> = () => {
  const [fetching, setFetching] = useState(false);
  const [esaText, setEsaText] = useState<string>('');
  const [esaHtml, setEsaHtml] = useState<string>('');
  const [esaTagsText, setEsaTagsText] = useState<string>('');

  const loadDailyReport = () => {
    setFetching(true);
    const getDailyReport = firebase.functions().httpsCallable('dailyReport');
    // ローカルで試したいときはこれを使う
    // const functions = firebase.functions();
    // functions.useFunctionsEmulator('http://localhost:5001');
    // const getDailyReport = functions.httpsCallable('dailyReport');

    const data = getDailyReport({
      category: `日報/${format(new Date(), 'yyyy/MM/dd')}`,
      title: '日報',
    });
    data.then((res) => {
      setEsaText(res.data.body_md);
      setEsaHtml(res.data.body_html);
      setEsaTagsText(res.data.tags.join(', '));

      setFetching(false);
    });
  };

  useEffect(() => {
    loadDailyReport();
  }, []);

  return (
    <Container maxWidth="xl">
      #times_esa
      <EsaSubmitForm
        tagsText={esaTagsText}
        onSubmit={(md: string, html: string, tags: string[]) => {
          setEsaText(md);
          setEsaHtml(html);
          setEsaTagsText(tags.join(', '));
        }}
      />
      <hr style={{
        borderTop: '2px dashed #bbb', borderBottom: 'none',
      }}
      />
      <DailyReport
        fetching={fetching}
        esaText={esaText}
        esaHtml={esaHtml}
        reloadDailyReport={() => { loadDailyReport(); }}
      />
    </Container>
  );
};

export default TimesEsa;
