import React, { useState, useEffect } from 'react';
import { Container } from '@material-ui/core';
import { format } from 'date-fns';
import firebase from 'firebase';

import DailyReport from '../DailyReport';
import EsaSubmitForm from '../EsaSubmitForm';

const TimesEsa: React.FC<{}> = () => {
  const [fetching, setFetching] = useState(false);
  const [esaText, setEsaText] = useState<string>('');

  useEffect(() => {
    setFetching(true);
    const getDailyReport = firebase.functions().httpsCallable('dailyReport');
    const data = getDailyReport({
      category: `日報/${format(new Date(), 'yyyy/MM/dd')}`,
      title: '日報',
    });
    data.then((result) => {
      setEsaText(result.data.body_md);
      setFetching(false);
    });
  }, []);

  return (
    <Container maxWidth="xl">
      #times_esa
      <EsaSubmitForm onSubmit={(text) => { setEsaText(text); }} />
      <hr style={{
        borderTop: '2px dashed #bbb', borderBottom: 'none',
      }}
      />
      <DailyReport fetching={fetching} esaText={esaText} />
    </Container>
  );
};

export default TimesEsa;
