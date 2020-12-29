import React, { useState, useEffect } from 'react';
import {
  Button, Container,
} from '@material-ui/core';
import { format } from 'date-fns';
import firebase from 'firebase';

import EsaTextField from '../EsaTextField';
import DailyReport from '../DailyReport';

const TimesEsa: React.FC<{}> = () => {
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [text, setText] = useState<string>('');
  const [esaText, setEsaText] = useState<string>('');

  const submitTextToEsa = async () => {
    setSending(true);
    const submit = firebase.functions().httpsCallable('submitTextToEsa');
    const data = await submit({
      category: `日報/${format(new Date(), 'yyyy/MM/dd')}`,
      title: '日報',
      text: `${format(new Date(), 'HH:mm')} ${text}\n\n---\n`,
    });
    setText('');
    setEsaText(data.data.body_md);
    setSending(false);
  };

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
      <form>
        <EsaTextField sending={sending} text={text} setText={(t) => { setText(t); }} />
        <Button
          disabled={sending}
          variant="contained"
          color="primary"
          onClick={() => { submitTextToEsa(); }}
        >
          つぶやく
        </Button>
      </form>
      <hr style={{
        borderTop: '2px dashed #bbb', borderBottom: 'none',
      }}
      />
      <DailyReport fetching={fetching} esaText={esaText} />
    </Container>
  );
};

export default TimesEsa;
