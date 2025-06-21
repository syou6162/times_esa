import React from 'react';
import WelcomeMessage from '../WelcomeMessage';
import SignOutButton from '../SignOutButton';
import { isValidEmail } from '../../util';
import { config } from '../../config';
import { GoogleUser } from '../../types';
import { FooterProps } from '../../types/components';

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
  // モックモードではメールアドレス検証をスキップ
  if (!config.useMockApi && !isValidEmail(props.user.email)) {
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
