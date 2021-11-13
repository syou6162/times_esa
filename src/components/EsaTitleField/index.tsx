import React from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

type EsaTitleFieldProps = {
  sending: boolean;
  fetching: boolean;
  title: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    />
  );
};

export default EsaTitleField;
