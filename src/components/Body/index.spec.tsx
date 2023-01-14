process.env.VITE_VALID_MAIL_ADDRESSES = 'valid@example.com';

import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Body, BodyProps } from '.'
import { getAuth } from 'firebase/auth';

// 認証の画面をmock
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));
const mockecdGetAuth = getAuth;
jest.mock('../StyledFirebaseAuth', () => jest.fn());

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
      firebaseAuth: mockecdGetAuth(), 
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
      firebaseAuth: mockecdGetAuth(), 
    };
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
      firebaseAuth: mockecdGetAuth(), 
    }
    const renderResult = render(
      <Body {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.findAllByText("Error: 有効なメールアドレスではありません")).toBeTruthy();
  });

  // firebaseのモックがまだなので、ひとまずコメントアウト
  // it('firebaseの認証が通って、validなユーザー', () => {
  //   const props: BodyProps = {
  //     hasUserLanded: true,
  //     isSignedIn: true,
  //     user: {
  //       email: 'valid@example.com',
  //       displayName: 'valid',
  //       photoURL: 'valid',
  //     },
  //     firebaseAuth: mockecdGetAuth(), 
  //   }
  //   const renderResult = render(
  //     <Body {...props} />
  //   );

  //   expect(renderResult.asFragment()).toMatchSnapshot();
  // });
})
