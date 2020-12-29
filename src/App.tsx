import React, { useState, useEffect } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import './App.css';

// firebase functions
import firebase from 'firebase';
import { firebaseAuth } from './firebase/index';
import TimesEsa from './components/TimesEsa';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [myAccount, setMyAccount] = useState<firebase.User>();

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
  };

  useEffect(() => {
    firebaseAuth.onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) return;
      if (user.email !== process.env.REACT_APP_VALID_MAIL_ADDRESSES) return;
      setMyAccount(user);
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
            <TimesEsa />
          )}
      </header>
    </div>
  );
};

export default App;
