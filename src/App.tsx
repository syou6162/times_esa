import React, { useState, useEffect } from 'react';
import './App.css';

import {
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import 'firebase/compat/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { Button } from '@material-ui/core';
import { firebaseAuth } from './firebase/index';
import TimesEsa from './components/TimesEsa';

type GoogleUser = {
  email: string;
  displayName: string;
  photoURL: string;
}

const isValidEmail = (email: string): boolean => {
  return email === process.env.REACT_APP_VALID_MAIL_ADDRESSES;
};

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

const signOutButton = (
  <Button
    type="button"
    variant="contained"
    color="primary"
    onClick={() => {
      firebaseAuth.signOut();
      window.location.reload();
    }}
  >
    Sign-out
  </Button>
);

const WelcomeMessage: React.FC<GoogleUser> = (props: GoogleUser) => {
  return (
    <div>
      {`ようこそ ${props.displayName} (`}
      <img
        title={props.email}
        alt={props.displayName}
        height="20px"
        src={props.photoURL}
      />
      {`${props.email}) さん!`}
    </div>
  );
};

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
        {signOutButton}
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

type FooterProps = {
  isSignedIn: boolean;
  user: GoogleUser;
}

const Footer: React.FC<FooterProps> = (props: FooterProps) => {
  const hr = (
    <hr style={{
      borderTop: '2px dashed #bbb',
      borderBottom: 'none',
      clear: 'both',
    }}
    />
  );
  const credit = (
    <div>
      <a
        href="https://github.com/syou6162/times_esa"
      >
        times_esa
      </a>
      &nbsp;made by&nbsp;
      <a
        href="https://twitter.com/syou6162"
      >
        Yasuhisa Yoshida
      </a>
      .
    </div>
  );
  if (!props.isSignedIn) {
    return (
      <footer>
        {hr}
        {credit}
      </footer>
    );
  }
  if (!isValidEmail(props.user.email)) {
    return (
      <footer>
        {hr}
        {credit}
      </footer>
    );
  }
  return (
    <footer>
      {hr}
      <WelcomeMessage
        email={props.user.email}
        displayName={props.user.displayName}
        photoURL={props.user.photoURL}
      />
      {signOutButton}
      {hr}
      {credit}
    </footer>
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
