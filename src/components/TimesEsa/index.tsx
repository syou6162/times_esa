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

  useEffect(() => {
    setFetching(true);
    const getDailyReport = firebase.functions().httpsCallable('dailyReport');
    const data = getDailyReport({
      category: `日報/${format(new Date(), 'yyyy/MM/dd')}`,
      title: '日報',
    });
    data.then((tmp) => {
      setEsaText(tmp.data.body_md);
      setEsaHtml(tmp.data.body_html);
      setFetching(false);
    });
  }, []);

  return (
    <Container maxWidth="xl">
      #times_esa
      <EsaSubmitForm onSubmit={(md, html) => { setEsaText(md); setEsaHtml(html); }} />
      <hr style={{
        borderTop: '2px dashed #bbb', borderBottom: 'none',
      }}
      />
      <DailyReport fetching={fetching} esaText={esaText} esaHtml={esaHtml} />
    </Container>
  );
};

export default TimesEsa;
