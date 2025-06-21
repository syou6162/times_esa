// @vitest-environment jsdom
import.meta.env.VITE_VALID_MAIL_ADDRESSES = 'valid@example.com';

import { render } from '@testing-library/react'
import { describe, it, expect } from "vitest"
import { Footer } from '.'
import { FooterProps } from '../../types/components'

describe('Footerが正しく表示される', () => {
  it('サインインしていない状態', () => {
    const props: FooterProps = {
      isSignedIn: false,
      user: {
        email: '',
        displayName: '',
        photoURL: '',
      },
      firebaseAuth: null
    }
    const renderResult = render(
      <Footer {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });
  it('invalidなユーザーでログインしている状態', () => {
    const props: FooterProps = {
      isSignedIn: true,
      user: {
        email: 'invalid@example.com',
        displayName: 'invalid',
        photoURL: 'invalid',
      },
      firebaseAuth: null
    }
    const renderResult = render(
      <Footer {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });
  it('validなユーザーでログインしている状態', () => {
    const props: FooterProps = {
      isSignedIn: true,
      user: {
        email: 'valid@example.com',
        displayName: 'valid',
        photoURL: 'valid',
      },
      firebaseAuth: null
    }
    const renderResult = render(
      <Footer {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });
})
