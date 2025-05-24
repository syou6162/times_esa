import React from 'react';
import { outlinedInputClasses, TextField } from '@mui/material';
import { styled } from '@mui/system';

type EsaTextFieldProps = {
  sending: boolean;
  text: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const ContentTextField = styled(TextField)({
  [`& .${outlinedInputClasses.input}`]: {
    color: 'white',
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderWidth: '1px',
    margin: '10px',
    borderColor: 'white',
  },
});

const EsaTextField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  EsaTextFieldProps
>((props: EsaTextFieldProps, ref) => {
  return (
    <ContentTextField
      fullWidth
      multiline
      placeholder="ここにつぶやいた内容がesa.ioに追記されていきます"
      variant="outlined"
      minRows={6}
      maxRows={30}
      value={props.text}
      disabled={props.sending}
      inputProps={{ title: 'esa_submit_text_field' }}
      inputRef={ref}
      onChange={props.onChange}
    />
  );
});

EsaTextField.displayName = 'EsaTextField';

export default EsaTextField;
