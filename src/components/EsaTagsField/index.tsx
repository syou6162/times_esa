import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/system';
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

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

const TagTextField = styled(TextField)({
  '& .MuiOutlinedInput-input': {
    color: 'white',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px',
    margin: '9px',
    borderColor: 'white',
  },
});

export const EsaTagsField: React.FC<EsaTagsFieldProps> = (props: EsaTagsFieldProps) => {
  return (
    <Autocomplete
      id="esa_tags_field"
      value={props.tags}
      multiple
      options={props.tagCandidates}
      freeSolo
      autoSelect
      /* eslint-disable no-unused-vars, react/jsx-props-no-spreading */
      renderInput={(params: AutocompleteRenderInputParams) => {
        return (
          <TagTextField
            {...params}
            variant="outlined"
            fullWidth
            placeholder="タグを記入しましょう"
            InputProps={{
              ref: params.InputProps.ref,
              className: params.InputProps.className,
              startAdornment: params.InputProps.startAdornment,
              endAdornment: params.InputProps.endAdornment,
            }}
          />
        );
      }}
      renderTags={(tagValue, getTagProps) => {
        return tagValue.map((tag, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              label={tag}
              color="secondary"
              {...tagProps}
            />
          );
        });
      }}
      disabled={props.sending || props.fetching}
      onChange={props.onChange}
    />
  );
};
