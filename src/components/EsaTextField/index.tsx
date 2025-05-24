import React, { useRef, useCallback } from 'react';
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

const EsaTextField: React.FC<EsaTextFieldProps> = (props: EsaTextFieldProps) => {
  // テキストフィールドのDOM参照用ref
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  // カーソル位置保持用ref
  const caretRef = useRef<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  });

  // フォーカス状態を追跡するref
  const wasFocusedRef = useRef(false);

  // カーソル位置を記録する関数
  const handleSelectionChange = useCallback(() => {
    if (textInputRef.current) {
      caretRef.current.start = textInputRef.current.selectionStart;
      caretRef.current.end = textInputRef.current.selectionEnd;
    }
  }, []);

  // フォーカスが外れた時の処理
  const handleBlur = useCallback(() => {
    wasFocusedRef.current = true;
    handleSelectionChange(); // 最新のカーソル位置を記録
  }, [handleSelectionChange]);

  // フォーカスが戻った時の処理
  const handleFocus = useCallback(() => {
    // 以前フォーカスがあった場合のみカーソル位置を復元
    if (wasFocusedRef.current && textInputRef.current) {
      const { start, end } = caretRef.current;
      if (typeof start === 'number' && typeof end === 'number') {
        // 少し遅延を入れてカーソル位置を復元
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.setSelectionRange(start, end);
          }
        }, 0);
      }
    }
  }, []);

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
      inputRef={textInputRef}
      onChange={props.onChange}
      onSelect={handleSelectionChange}
      onKeyUp={handleSelectionChange}
      onClick={handleSelectionChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};

export default EsaTextField;
