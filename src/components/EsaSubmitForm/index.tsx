import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { format } from 'date-fns';
import firebase from 'firebase';

import EsaTextField from '../EsaTextField';
import EsaTagsField from '../EsaTagsField';

type EsaSubmitFormProps = {
  tagsText: string;
  fetching: boolean;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (markdown: string, html: string, tags: string[]) => void;
};

function getDay(): string {
  const day = (new Date()).getDay();
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

const EsaSubmitForm: React.FC<EsaSubmitFormProps> = (props: EsaSubmitFormProps) => {
  const [sending, setSending] = useState(false);
  const [text, setText] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>(props.tagsText);

  const handleSubmit = async (e: React.FormEvent) => {
    // submit ボタンのデフォルトの振る舞い (GET や POST) を抑制する
    e.preventDefault();
    setSending(true);
    const submit = firebase.functions().httpsCallable(
      'submitTextToEsa',
      {
        timeout: 10000, // 10秒
      },
    );
    await submit({
      category: `日報/${format(new Date(), 'yyyy/MM/dd')}`,
      tags: tagsText.split(', ').concat(getDay()),
      title: '日報',
      text: `${format(new Date(), 'HH:mm')} ${text}\n\n---\n`,
    }).then((data) => {
      setText('');
      setTagsText(data.data.tags.join(', '));
      props.onSubmit(data.data.body_md, data.data.body_html, data.data.tags);
    }).catch((err: Error) => {
      // eslint-disable-next-line no-alert
      alert(`${err.name}: ${err.message}`);
    }).finally(() => {
      setSending(false);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <EsaTextField
        fetching={props.fetching}
        sending={sending}
        text={text}
        onChange={(e) => { setText(e.target.value); }}
      />
      <EsaTagsField
        fetching={props.fetching}
        sending={sending}
        tagsText={tagsText}
        onChange={(e) => { setTagsText(e.target.value); }}
      />
      <Button
        disabled={sending}
        variant="contained"
        color="primary"
        type="submit"
      >
        つぶやく
      </Button>
    </form>
  );
};

export default EsaSubmitForm;
