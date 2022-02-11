import React, { useState, useEffect } from 'react';
import './App.css';

import {
  onAuthStateChanged,
} from 'firebase/auth';
import 'firebase/compat/auth';
import { firebaseAuth } from './firebase/index';
import TimesEsa from './components/TimesEsa';
import SignInDialog from './components/SignInDialog';
import WelcomeMessage from './components/WelcomeMessage';
import Footer from './components/Footer';
import SignOutButton from './components/SignOutButton';
import { GoogleUser, isValidEmail } from './util';

type BodyProps = {
  hasUserLanded: boolean;
  isSignedIn: boolean;
  user: GoogleUser;
}

const Body: React.FC<BodyProps> = (props: BodyProps) => {
  const isShowSignedInDialog = (): boolean => {
    return props.hasUserLanded && !props.isSignedIn;
  };

  if (isShowSignedInDialog()) {
    return (<SignInDialog />);
  }
  if (props.hasUserLanded && props.isSignedIn && !isValidEmail(props.user.email)) {
    return (
      <div>
        <WelcomeMessage
          email={props.user.email}
          displayName={props.user.displayName}
          photoURL={props.user.photoURL}
        />
        <div>
          Error: 有効なメールアドレスではありません。
        </div>
        <SignOutButton />
      </div>
    );
  }
  return (
    <TimesEsa
      key={`canFetchCloudFunctionEndpoints_${props.isSignedIn}`}
      canFetchCloudFunctionEndpoints={props.isSignedIn}
    />
  );
};

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
      />
      <Footer
        isSignedIn={isSignedIn}
        user={user}
      />
    </div>
  );
};

export default App;
