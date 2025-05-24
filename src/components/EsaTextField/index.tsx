import React, { useRef, useEffect } from 'react';
import { outlinedInputClasses, TextField } from '@mui/material';
import { styled } from '@mui/system';

type EsaTextFieldProps = {
  sending: boolean;
  text: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  fetching?: boolean;
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

  // フェッチ状態の変化を監視
  useEffect(() => {
    if (props.fetching) {
      // フェッチ中になった時、カーソル位置を記録
      if (textInputRef.current && document.activeElement === textInputRef.current) {
        caretRef.current.start = textInputRef.current.selectionStart;
        caretRef.current.end = textInputRef.current.selectionEnd;
      }
    } else {
      // フェッチが終了した時、記録したカーソル位置があれば復元
      const { start, end } = caretRef.current;
      if (textInputRef.current && typeof start === 'number' && typeof end === 'number') {
        textInputRef.current.focus();
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.setSelectionRange(start, end);
          }
        }, 0);

        // 使用後はカーソル位置をリセット
        caretRef.current.start = null;
        caretRef.current.end = null;
      }
    }
  }, [props.fetching]);

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
    />
  );
};

// デフォルトプロップス
EsaTextField.defaultProps = {
  fetching: false
};

export default EsaTextField;
