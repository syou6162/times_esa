import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/system';
import Autocomplete, {
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { EsaTagsFieldProps } from '../../types/components';


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

export { EsaTagsFieldProps } from '../../types/components';

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
