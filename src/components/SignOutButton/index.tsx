import React from 'react';
import { Button } from '@material-ui/core';
import firebase from 'firebase/compat/app';

type SignOutButtonProps = {
  firebaseAuth: firebase.auth.Auth | null;
}

const SignOutButton: React.FC<SignOutButtonProps> = (props: SignOutButtonProps) => {
  return (
    <Button
      type="button"
      variant="contained"
      color="primary"
      onClick={() => {
        props.firebaseAuth?.signOut();
        window.location.reload();
      }}
    >
      Sign-out
    </Button>
  );
};

export default SignOutButton;
