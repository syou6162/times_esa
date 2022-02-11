import React from 'react';
import WelcomeMessage from '../WelcomeMessage';
import SignOutButton from '../SignOutButton';
import { GoogleUser, isValidEmail } from '../../util';

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
      <SignOutButton />
      {hr}
      {credit}
    </footer>
  );
};

export default Footer;
