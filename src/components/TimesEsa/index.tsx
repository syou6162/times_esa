import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import firebase from 'firebase';

import DailyReport from '../DailyReport';

const useStyles = makeStyles(() => {
  return ({
    multilineColor: {
      color: 'white',
    },
    notchedOutline: {
      borderWidth: '1px',
      margin: '10px',
      borderColor: 'white',
    },
  });
});

const TimesEsa: React.FC<{}> = () => {
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [text, setText] = useState<string>('');
  const [esaText, setEsaText] = useState<string>('');

  const classes = useStyles();

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
        <TextField
          fullWidth
          multiline
          placeholder="ここにつぶやいた内容がesa.ioに追記されていきます"
          variant="outlined"
          InputProps={{
            classes: {
              root: classes.multilineColor,
              notchedOutline: classes.notchedOutline,
            },
            disabled: sending,
          }}
          rows={10}
          value={text}
          onChange={(event) => { setText(event.target.value); }}
        />
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
