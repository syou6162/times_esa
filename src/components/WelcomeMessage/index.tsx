import React from 'react';
import { GoogleUser } from '../../util';

const WelcomeMessage: React.FC<GoogleUser> = (props: GoogleUser) => {
  return (
    <div>
      {`ようこそ ${props.displayName} (`}
      <img
        title={props.email}
        alt={props.displayName}
        height="20px"
        src={props.photoURL}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== 'https://avatars.githubusercontent.com/u/18356?s=96&v=4') {
            target.src = 'https://avatars.githubusercontent.com/u/18356?s=96&v=4';
          }
        }}
      />
      {`${props.email}) さん!`}
    </div>
  );
};

export default WelcomeMessage;
