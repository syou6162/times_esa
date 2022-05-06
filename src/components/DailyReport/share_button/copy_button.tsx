import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';

type CopyButtonProps = {
  text: string;
};

export const CopyButton: React.FC<CopyButtonProps> = (props: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <CopyToClipboard
      text={props.text}
      onCopy={() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      }}
    >
      <Button
        style={{
          margin: '5px',
          textTransform: 'none',
          float: 'right',
        }}
        variant="contained"
        color={isCopied ? 'secondary' : 'primary'}
      >
        {isCopied ? 'コピーしました!' : 'コピーする'}
      </Button>
    </CopyToClipboard>
  );
};
