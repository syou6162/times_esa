import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from 'firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {
  Button, TextField, Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { firebaseAuth } from './firebase/index';

const useStyles = makeStyles(() => ({
  multilineColor: {
    color: 'white',
  },
  notchedOutline: {
    borderWidth: '1px',
    margin: '10px',
    borderColor: 'white',
  },
}));

function App() {
  const classes = useStyles();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [text, setText] = useState<string>('');
  const [esaText, setEsaText] = useState<string>('');
  const [myAccount, setMyAccount] = useState<firebase.User>();

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
  };

  const submitTextToEsa = async () => {
    setSending(true);
    const helloWorld = firebase.functions().httpsCallable('helloWorld');
    const data = await helloWorld({ text: `${format(new Date(), 'hh:mm')} ${text}\n\n---\n` });
    setText('');
    setEsaText(data.data.body_md);
    console.log(data);
    setSending(false);
  };

  useEffect(() => {
    firebaseAuth.onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) return;
      if (user.email !== process.env.REACT_APP_VALID_MAIL_ADDRESSES) return;
      setMyAccount(user);
      setFetching(true);

      const getDailyReport = firebase.functions().httpsCallable('dailyReport');
      const data = getDailyReport({});
      data.then((result) => {
        setEsaText(result.data.body_md);
        setFetching(false);
      });
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        { /* eslint no-nested-ternary: 0 */ }
        {loading ? (
          <p>
            LOADING.....
          </p>
        ) : !myAccount ? (
          <div>
            ログインが必要です
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
          </div>
        )
          : (
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
                  onClick={() => submitTextToEsa()}
                >
                  つぶやく
                </Button>

              </form>
              <div style={{
                whiteSpace: 'pre-wrap', textAlign: 'left', justifyContent: 'left', alignItems: 'left',
              }}
              >
                {fetching ? ('今日の日報を取得中です...') : esaText}
              </div>
            </Container>

          )}
      </header>
    </div>
  );
}

export default App;
