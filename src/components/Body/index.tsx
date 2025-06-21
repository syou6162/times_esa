import React from 'react';
import { Auth } from 'firebase/auth';
import { isValidEmail } from '../../util';
import { GoogleUser } from '../../types';
import { BodyProps } from '../../types/components';
import { config } from '../../config';
import TimesEsa from '../TimesEsa';
import SignInDialog from '../SignInDialog';
import WelcomeMessage from '../WelcomeMessage';
import SignOutButton from '../SignOutButton';


export { BodyProps } from '../../types/components';

export const Body: React.FC<BodyProps> = (props: BodyProps) => {
  const isShowSignedInDialog = (): boolean => {
    return props.hasUserLanded && !props.isSignedIn;
  };

  if (isShowSignedInDialog()) {
    return (
      <SignInDialog
        firebaseAuth={props.firebaseAuth}
      />
    );
  }
  // モックモードではメールアドレス検証をスキップ
  if (!config.useMockApi && props.hasUserLanded && props.isSignedIn && !isValidEmail(props.user.email)) {
    return (
      <div>
        <WelcomeMessage
          email={props.user.email}
          displayName={props.user.displayName}
          photoURL={props.user.photoURL}
        />
        <div>
          Error: 有効なメールアドレスではありません。
        </div>
        <SignOutButton
          firebaseAuth={props.firebaseAuth}
        />
      </div>
    );
  }
  return (
    <TimesEsa
      key={`canFetchCloudFunctionEndpoints_${props.isSignedIn}`}
      canFetchCloudFunctionEndpoints={props.isSignedIn}
    />
  );
};
