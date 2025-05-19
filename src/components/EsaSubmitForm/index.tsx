import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { format } from 'date-fns';
import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';

import EsaTitleField from '../EsaTitleField';
import EsaTextField from '../EsaTextField';
import { EsaTagsField } from '../EsaTagsField';
import { makeDefaultEsaCategory, functionsRegion } from '../../util';

export type EsaSubmitFormProps = {
  category: string;
  title: string;
  tags: string[];
  tagCandidates: string[];
  fetching: boolean;
  onSubmit: (
    /* eslint-disable no-unused-vars */
    category: string,
    title: string,
    markdown: string,
    html: string,
    tags: string[]
    /* eslint-enable no-unused-vars */
  ) => void;
};

export function getDay(date: Date): string {
  const day = date.getDay();
  switch (day) {
    case 0:
      return '日曜日';
    case 1:
      return '月曜日';
    case 2:
      return '火曜日';
    case 3:
      return '水曜日';
    case 4:
      return '木曜日';
    case 5:
      return '金曜日';
    case 6:
      return '土曜日';
    default:
      return ''; // ここにはこない
  }
}

const transformTitle = (title: string): string => {
  return title.split('\n').filter((w: string) => {
    return w !== '';
  }).join('、');
};

type submitTextToEsaRequestType = {
  category: string;
  tags: string[];
  title: string;
  text: string;
}

type submitTextToEsaResponseType = {
  updated_at: string;
  url: string;

  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
}

export const submitTextToEsa = (
  category: string,
  tags: string[],
  title: string,
  text: string,
): Promise<HttpsCallableResult<submitTextToEsaResponseType>> => {
  const functions = getFunctions();
  functions.region = functionsRegion;

  const submit = httpsCallable<submitTextToEsaRequestType, submitTextToEsaResponseType>(
    functions,
    'submitTextToEsa',
    {
      timeout: 10000, // 10秒
    },
  );
  return submit({
    category,
    tags,
    title,
    text,
  });
};

export const EsaSubmitForm: React.FC<EsaSubmitFormProps> = (props: EsaSubmitFormProps) => {
  const [sending, setSending] = useState(false);
  const [category, setCategory] = useState<string>(props.category);
  const [title, setTitle] = useState<string>(props.title);
  const [text, setText] = useState<string>('');
  const [tags, setTags] = useState<string[]>(props.tags);

  useEffect(() => {
    setCategory(props.category);
    setTitle(props.title);
    setTags(props.tags);
  }, [props.category, props.title, props.tags]);

  const isSameCategory = (): boolean => {
    if (category === '') { // 今日の日報がまだ作成されていない
      return true;
    }
    return category === makeDefaultEsaCategory(new Date());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // submit ボタンのデフォルトの振る舞い (GET や POST) を抑制する
    e.preventDefault();
    setSending(true);
    const date = new Date();
    try {
      const data = await submitTextToEsa(
        makeDefaultEsaCategory(date),
        tags.concat(getDay(date)),
        transformTitle(title),
        text !== '' ? `${format(date, 'HH:mm')} ${text}\n\n---\n` : '',
      );
      setCategory(data.data.category);
      setTitle(data.data.name);
      setTags(data.data.tags);
      setText('');
      props.onSubmit(
        data.data.category,
        data.data.name,
        data.data.body_md,
        data.data.body_html,
        data.data.tags,
      );
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert(`${err.name}: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <EsaTitleField
        fetching={props.fetching}
        sending={sending}
        title={title}
        onChange={(e) => { setTitle(e.target.value); }}
      />
      <EsaTagsField
        fetching={props.fetching}
        sending={sending}
        tags={tags}
        tagCandidates={props.tagCandidates}
        // eslint-disable-next-line no-unused-vars
        onChange={(event, value, reason, detail) => { setTags(value); }}
      />
      <EsaTextField
        sending={sending}
        text={text}
        onChange={(e) => { setText(e.target.value); }}
      />
      <Button
        title="esa_submit_form_button"
        disabled={sending || !isSameCategory()}
        variant="contained"
        color="primary"
        type="submit"
      >
        つぶやく
      </Button>
    </form>
  );
};
