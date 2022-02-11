import React from 'react';
import firebase from 'firebase/compat/app';
import WelcomeMessage from '../WelcomeMessage';
import SignOutButton from '../SignOutButton';
import { GoogleUser, isValidEmail } from '../../util';

export type FooterProps = {
  isSignedIn: boolean;
  user: GoogleUser;
  firebaseAuth: firebase.auth.Auth | null;
}

export const Footer: React.FC<FooterProps> = (props: FooterProps) => {
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
      <SignOutButton
        firebaseAuth={props.firebaseAuth}
      />
      {hr}
      {credit}
    </footer>
  );
};
