import React from 'react';
import { outlinedInputClasses, TextField } from '@mui/material';
import { styled } from '@mui/system';

import { moveCursorToEnd } from '../../util';

type EsaTitleFieldProps = {
  sending: boolean;
  fetching: boolean;
  title: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const TitleTextField = styled(TextField)({
  [`& .${outlinedInputClasses.input}`]: {
    color: 'white',
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderWidth: '1px',
    margin: '10px',
    borderColor: 'white',
  },
});

const EsaTitleField: React.FC<EsaTitleFieldProps> = (props: EsaTitleFieldProps) => {
  return (
    <TitleTextField
      fullWidth
      multiline
      maxRows={3}
      required
      placeholder="日報のタイトルを記入しましょう"
      variant="outlined"
      value={props.title}
      disabled={props.sending || props.fetching}
      inputProps={{ title: 'esa_submit_title_field' }}
      onChange={props.onChange}
      onFocus={moveCursorToEnd}
    />
  );
};

export default EsaTitleField;
