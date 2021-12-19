import React, { useState, useEffect } from 'react';
import './App.css';

import {
  onAuthStateChanged,
  GoogleAuthProvider,
  UserInfo,
} from 'firebase/auth';
import 'firebase/compat/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { firebaseAuth } from './firebase/index';
import TimesEsa from './components/TimesEsa';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [myAccount, setMyAccount] = useState<UserInfo>();

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
    ],
  };

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
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
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseAuth} />
          </div>
        )
          : <TimesEsa />}
      </header>
    </div>
  );
};

export default App;
