import React from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete, { AutocompleteChangeReason, AutocompleteChangeDetails, AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';

export type EsaTagsFieldProps = {
  sending: boolean;
  fetching: boolean;
  tags: string[];
  tagCandidates: string[];
  onChange: (
    // eslint-disable-next-line no-unused-vars
    event: React.ChangeEvent<{}>,
    // eslint-disable-next-line no-unused-vars
    value: string[],
    // eslint-disable-next-line no-unused-vars
    reason: AutocompleteChangeReason,
    // eslint-disable-next-line no-unused-vars
    details?: AutocompleteChangeDetails<string> | undefined
  ) => void;
};

const useStyles = makeStyles(() => {
  return ({
    multilineColor: {
      color: 'white',
    },
    notchedOutline: {
      borderWidth: '1px',
      margin: '9px',
      borderColor: 'white',
    },
  });
});

export const EsaTagsField: React.FC<EsaTagsFieldProps> = (props: EsaTagsFieldProps) => {
  const classes = useStyles();
  return (
    <Autocomplete
      value={props.tags}
      multiple
      options={props.tagCandidates}
      freeSolo
      autoSelect
      /* eslint-disable no-unused-vars, react/jsx-props-no-spreading */
      renderInput={(params: AutocompleteRenderInputParams) => {
        return (
          <TextField
            {...params}
            variant="outlined"
            fullWidth
            placeholder="タグを記入しましょう"
            InputProps={{
              ref: params.InputProps.ref,
              className: params.InputProps.className,
              startAdornment: params.InputProps.startAdornment,
              endAdornment: params.InputProps.endAdornment,
              // 独自の設定
              classes: {
                root: classes.multilineColor,
                notchedOutline: classes.notchedOutline,
              },
            }}
          />
        );
      }}
      disabled={props.sending || props.fetching}
      onChange={props.onChange}
    />
  );
};
