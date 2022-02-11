import React, { useState, useEffect } from 'react';
import './App.css';

import {
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import 'firebase/compat/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { firebaseAuth } from './firebase/index';
import TimesEsa from './components/TimesEsa';

const SignInDialog: React.FC = () => {
  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
    ],
  };

  return (
    <div>
      ログインが必要です
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseAuth} />
    </div>
  );
};

const App: React.FC = () => {
  const [hasUserLanded, setHasUserLanded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const isShowSignedInDialog = (): boolean => {
    return hasUserLanded && !isSignedIn;
  };

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (!user || (user.email !== process.env.REACT_APP_VALID_MAIL_ADDRESSES)) {
        setHasUserLanded(true);
        return;
      }
      setHasUserLanded(true);
      setIsSignedIn(true);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        { isShowSignedInDialog() ? <SignInDialog /> : <TimesEsa /> }
      </header>
    </div>
  );
};

export default App;
