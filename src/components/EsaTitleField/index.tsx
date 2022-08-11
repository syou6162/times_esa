import React from 'react';
import { TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { moveCursorToEnd } from '../../util';

type EsaTitleFieldProps = {
  sending: boolean;
  fetching: boolean;
  title: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const useStyles = makeStyles(() => {
  return ({
    multilineColor: {
      color: 'white',
    },
    notchedOutline: {
      borderWidth: '1px',
      margin: '10px',
      borderColor: 'white',
    },
  });
});

const EsaTitleField: React.FC<EsaTitleFieldProps> = (props: EsaTitleFieldProps) => {
  const classes = useStyles();
  return (
    <TextField
      fullWidth
      multiline
      maxRows={3}
      required
      placeholder="日報のタイトルを記入しましょう"
      variant="outlined"
      InputProps={{
        classes: {
          root: classes.multilineColor,
          notchedOutline: classes.notchedOutline,
        },
        disabled: props.sending || props.fetching,
      }}
      value={props.title}
      onChange={props.onChange}
      onFocus={moveCursorToEnd}
    />
  );
};

export default EsaTitleField;
