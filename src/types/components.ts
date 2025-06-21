// コンポーネントのProps型定義をまとめたファイル

import { Auth } from 'firebase/auth';
import { AutocompleteChangeReason, AutocompleteChangeDetails } from '@mui/material';
import { GoogleUser, InputChangeHandler, TextAreaChangeHandler } from './index';

// Body Component Props
export type BodyProps = {
  hasUserLanded: boolean;
  isSignedIn: boolean;
  user: GoogleUser;
  firebaseAuth: Auth | null;
}

// DailyReport Component Props
export type DailyReportProps = {
  fetching: boolean;
  fetchErrorMessage: string;
  esaText: string;
  esaHtml: string;
  reloadDailyReport: () => void;
}

// DailyReport内部のコンポーネントProps
export type DailyReportHtmlProps = {
  esaHtml: string;
}

export type DailyReportTextProps = {
  esaText: string;
}

export type DailyReportShareProps = {
  esaText: string;
}

// ShareButton Props
export type TweetButtonProps = {
  text: string;
}

export type CopyButtonProps = {
  text: string;
}

// EsaSubmitForm Props
export type EsaSubmitFormProps = {
  category: string;
  title: string;
  tags: string[];
  tagCandidates: string[];
  fetching: boolean;
  onSubmit: (
    category: string,
    title: string,
    markdown: string,
    html: string,
    tags: string[]
  ) => void;
}

// EsaTitleField Props
export type EsaTitleFieldProps = {
  fetching: boolean;
  sending: boolean;
  title: string;
  onChange: InputChangeHandler;
}

// EsaTextField Props
export type EsaTextFieldProps = {
  sending: boolean;
  text: string;
  onChange: TextAreaChangeHandler;
}

// EsaTagsField Props
export type EsaTagsFieldProps = {
  fetching: boolean;
  sending: boolean;
  tags: string[];
  tagCandidates: string[];
  onChange: (
    event: React.SyntheticEvent,
    value: string[],
    reason: AutocompleteChangeReason,
    detail?: AutocompleteChangeDetails<string>
  ) => void;
}

// TimesEsa Props
export type TimesEsaProps = {
  canFetchCloudFunctionEndpoints: boolean;
}

// SignInDialog Props
export type SignInDialogProps = {
  firebaseAuth: Auth | null;
}

// SignOutButton Props
export type SignOutButtonProps = {
  firebaseAuth: Auth | null;
}

// StyledFirebaseAuth Props
export type StyledFirebaseAuthProps = {
  firebaseAuth: Auth | null;
}

// Footer Props
export type FooterProps = {
  isSignedIn: boolean;
  user: GoogleUser;
  firebaseAuth: Auth | null;
}