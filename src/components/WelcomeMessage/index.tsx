import React from 'react';
import { GoogleUser } from '../../types';

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

export default WelcomeMessage;
