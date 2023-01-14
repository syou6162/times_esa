import React from 'react';
import { format } from 'date-fns';

export const moveCursorToEnd = (
  event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
): void => {
  event.preventDefault();
  const { target } = event;
  const lastPos = target.value.length;
  setTimeout(() => { // 本来は不要な気がする...
    target.setSelectionRange(lastPos, lastPos);
  });
  target.scrollTop = target.scrollHeight;
  target.scrollLeft = target.scrollWidth;
};

export const makeDefaultEsaCategory = (date: Date): string => {
  return `日報/${format(date, 'yyyy/MM/dd')}`;
};

export const functionsRegion = 'asia-northeast1';

export type GoogleUser = {
  email: string;
  displayName: string;
  photoURL: string;
}

export const isValidEmail = (email: string): boolean => {
  return email === import.meta.env.VITE_VALID_MAIL_ADDRESSES;
};
