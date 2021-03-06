import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { format } from 'date-fns';
import firebase from 'firebase';

import EsaTextField from '../EsaTextField';

type EsaSubmitFormProps = {
  // eslint-disable-next-line no-unused-vars
  onSubmit: (markdown: string, html: string) => void;
};

const EsaSubmitForm: React.FC<EsaSubmitFormProps> = (props: EsaSubmitFormProps) => {
  const [sending, setSending] = useState(false);
  const [text, setText] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    // submit ボタンのデフォルトの振る舞い (GET や POST) を抑制する
    e.preventDefault();
    setSending(true);
    const submit = firebase.functions().httpsCallable('submitTextToEsa');
    const data = await submit({
      category: `日報/${format(new Date(), 'yyyy/MM/dd')}`,
      title: '日報',
      text: `${format(new Date(), 'HH:mm')} ${text}\n\n---\n`,
    });
    setText('');
    props.onSubmit(data.data.body_md, data.data.body_html);
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <EsaTextField sending={sending} text={text} onChange={(e) => { setText(e.target.value); }} />
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
