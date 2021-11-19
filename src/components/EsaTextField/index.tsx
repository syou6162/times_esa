import React from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

type EsaTextFieldProps = {
  sending: boolean;
  fetching: boolean;
  text: string;
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

const EsaTextField: React.FC<EsaTextFieldProps> = (props: EsaTextFieldProps) => {
  const classes = useStyles();
  return (
    <TextField
      fullWidth
      multiline
      placeholder="ここにつぶやいた内容がesa.ioに追記されていきます"
      variant="outlined"
      InputProps={{
        classes: {
          root: classes.multilineColor,
          notchedOutline: classes.notchedOutline,
        },
        disabled: props.sending || props.fetching,
      }}
      minRows={6}
      maxRows={30}
      value={props.text}
      onChange={props.onChange}
    />
  );
};

export default EsaTextField;
