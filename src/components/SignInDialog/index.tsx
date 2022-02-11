import React from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

export type SignInDialogProps = {
  firebaseAuth: firebase.auth.Auth | null;
}

const SignInDialog: React.FC<SignInDialogProps> = (props: SignInDialogProps) => {
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
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={props.firebaseAuth} />
    </div>
  );
};

export default SignInDialog;
