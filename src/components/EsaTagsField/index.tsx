import React from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

type EsaTagsFieldProps = {
  sending: boolean;
  fetching: boolean;
  tagsText: string;
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

const EsaTagsField: React.FC<EsaTagsFieldProps> = (props: EsaTagsFieldProps) => {
  const classes = useStyles();
  return (
    <TextField
      fullWidth
      placeholder="タグを記入しましょう"
      variant="outlined"
      InputProps={{
        classes: {
          root: classes.multilineColor,
          notchedOutline: classes.notchedOutline,
        },
        disabled: props.sending || props.fetching,
      }}
      value={props.tagsText}
      onChange={props.onChange}
    />
  );
};

export default EsaTagsField;
