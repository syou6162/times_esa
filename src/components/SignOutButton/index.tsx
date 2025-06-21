import React from 'react';
import { Button } from '@mui/material';
import { SignOutButtonProps } from '../../types/components';


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
