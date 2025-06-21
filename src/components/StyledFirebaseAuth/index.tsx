// ref: https://github.com/firebase/firebaseui-web-react/pull/173#issuecomment-1151532176
import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { StyledFirebaseAuthProps } from '../../types/components';

type Props = StyledFirebaseAuthProps & {
  // The Firebase UI Web UI Config object.
  // See: https://github.com/firebase/firebaseui-web#configuration
  uiConfig: firebaseui.auth.Config;
}

const StyledFirebaseAuth = (props: Props) => {
  const [userSignedIn, setUserSignedIn] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // Get or Create a firebaseUI instance.
    const firebaseUiWidget = firebaseui.auth.AuthUI.getInstance()
      || new firebaseui.auth.AuthUI(props.firebaseAuth);
    if (props.uiConfig.signInFlow === 'popup') {
      firebaseUiWidget.reset();
    }

    // We track the auth state to reset firebaseUi if the user signs out.
    const unregisterAuthObserver = onAuthStateChanged(props.firebaseAuth, (user) => {
      if (!user && userSignedIn) {
        firebaseUiWidget.reset();
      }
      setUserSignedIn(!!user);
    });

    // Render the firebaseUi Widget.
    // @ts-ignore
    firebaseUiWidget.start(elementRef.current, props.uiConfig);

    return () => {
      unregisterAuthObserver();
      firebaseUiWidget.reset();
    };
  }, [firebaseui, props.uiConfig]);

  return <div ref={elementRef} />;
};

export default StyledFirebaseAuth;
