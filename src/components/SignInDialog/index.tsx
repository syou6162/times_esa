import React from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { firebaseAuth } from '../../firebase/index';

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


export default SignInDialog;
