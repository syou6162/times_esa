import React from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
import StyledFirebaseAuth from '../StyledFirebaseAuth';
import { SignInDialogProps } from '../../types/components';


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
