process.env.REACT_APP_VALID_MAIL_ADDRESSES = 'valid@example.com';

import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Body, BodyProps } from '.'

describe('Bodyが正しく表示される', () => {
  it('firebaseの認証が表示されていない状態', () => {
    const props: BodyProps = {
      hasUserLanded: false,
      isSignedIn: false,
      user: {
        email: '',
        displayName: '',
        photoURL: '',
      },
      firebaseAuth: null
    }
    const renderResult = render(
      <Body {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });
  it('firebaseの認証を通過していない状態', () => {
    const props: BodyProps = {
      hasUserLanded: true,
      isSignedIn: false,
      user: {
        email: '',
        displayName: '',
        photoURL: '',
      },
      firebaseAuth: null
    }
    const renderResult = render(
      <Body {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });
  it('firebaseの認証が通ったが、invalidなユーザー', () => {
    const props: BodyProps = {
      hasUserLanded: true,
      isSignedIn: true,
      user: {
        email: 'invalid@example.com',
        displayName: 'invalid',
        photoURL: 'invalid',
      },
      firebaseAuth: null
    }
    const renderResult = render(
      <Body {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });
  // firebaseのモックがまだなので、ひとまずコメントアウト
  // it('firebaseの認証が通ったが、validなユーザー', () => {
  //   const props: BodyProps = {
  //     hasUserLanded: true,
  //     isSignedIn: true,
  //     user: {
  //       email: 'valid@example.com',
  //       displayName: 'valid',
  //       photoURL: 'valid',
  //     },
  //     firebaseAuth: null
  //   }
  //   const renderResult = render(
  //     <Body {...props} />
  //   );

  //   expect(renderResult.asFragment()).toMatchSnapshot();
  // });
})
