import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';

import {
  onAuthStateChanged,
} from 'firebase/auth';
import { firebaseAuth } from './firebase/index';
import { Body } from './components/Body';
import { Footer } from './components/Footer';
import { GoogleUser } from './util';
import { config } from './config';

const App: React.FC = () => {
  
  // firebaseのonAuthStateChangedを通過したか
  const [hasUserLanded, setHasUserLanded] = useState(false);
  // (validかどうにかに関わらず)ユーザーがサインインしたいか
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<GoogleUser>({
    email: '',
    displayName: '',
    photoURL: '',
  });

  useEffect(() => {
    // モックモードの場合は認証をスキップ
    if (config.useMockApi) {
      setUser({
        email: 'mock@example.com',
        displayName: 'モックユーザー',
        photoURL: '',
      });
      setIsSignedIn(true);
      setHasUserLanded(true);
      return;
    }

    // 本番モードの場合は通常の認証フロー
    if (firebaseAuth) {
      onAuthStateChanged(firebaseAuth, (user_) => {
        if (!user_) {
          setHasUserLanded(true);
          return;
        }
        const u: GoogleUser = {
          email: user_.email || '',
          displayName: user_.displayName || '',
          photoURL: user_.photoURL || '',
        };
        setUser(u);
        setIsSignedIn(true);
        setHasUserLanded(true);
      });
    }
  }, []);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#e0e0e0',
      },
      success: {
        main: '#c51162',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Body
          key={`times_esa_body_${hasUserLanded}_${isSignedIn}_${user}`}
          hasUserLanded={hasUserLanded}
          isSignedIn={isSignedIn}
          user={user}
          firebaseAuth={firebaseAuth}
        />
        <Footer
          isSignedIn={isSignedIn}
          user={user}
          firebaseAuth={firebaseAuth}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
