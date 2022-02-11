import React, { useState, useEffect } from 'react';
import './App.css';

import {
  onAuthStateChanged,
} from 'firebase/auth';
import 'firebase/compat/auth';
import { firebaseAuth } from './firebase/index';
import { Body } from './components/Body';
import { Footer } from './components/Footer';
import { GoogleUser } from './util';

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
  }, []);

  return (
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
  );
};

export default App;
