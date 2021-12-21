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

const App: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
    ],
  };

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) return;
      if (user.email !== process.env.REACT_APP_VALID_MAIL_ADDRESSES) return;
      setIsSignedIn(true);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        { !isSignedIn ? (
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
