import React from 'react';
import { Button } from '@material-ui/core';
import { firebaseAuth } from '../../firebase/index';

const SignOutButton: React.FC = () => {
  return (
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
};

export default SignOutButton;
