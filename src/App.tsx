import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme, PaletteMode } from '@mui/material/styles';
import './App.css';

import {
  onAuthStateChanged,
} from 'firebase/auth';
import { firebaseAuth } from './firebase/index';
import { Body } from './components/Body';
import { Footer } from './components/Footer';
import { GoogleUser } from './types';
import { config } from './config';

const App: React.FC = () => {
  // テーマモードの状態管理
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'dark';
  });

  // firebaseのonAuthStateChangedを通過したか
  const [hasUserLanded, setHasUserLanded] = useState(false);
  // (validかどうにかに関わらず)ユーザーがサインインしたいか
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<GoogleUser>({
    email: '',
    displayName: '',
    photoURL: '',
  });

  // テーマ切り替え関数
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  useEffect(() => {
    // モックモードの場合は認証をスキップ
    if (config.useMockApi) {
      setUser({
        email: 'mock@example.com',
        displayName: 'モックユーザー',
        photoURL: 'https://avatars.githubusercontent.com/u/18356?s=96&v=4',
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

  // テーマを動的に生成
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
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
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Hiragino Sans"',
            '"Hiragino Kaku Gothic ProN"',
            '"Yu Gothic"',
            'Meiryo',
            'IPAGothic',
            'sans-serif'
          ].join(','),
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Body
          key={`times_esa_body_${hasUserLanded}_${isSignedIn}_${user}`}
          hasUserLanded={hasUserLanded}
          isSignedIn={isSignedIn}
          user={user}
          firebaseAuth={firebaseAuth}
          toggleColorMode={toggleColorMode}
          mode={mode}
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
