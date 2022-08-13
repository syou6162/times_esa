import React from 'react';
import { Button } from '@mui/material';

export type TweetButtonProps = {
  text: string;
};

export const TweetButton: React.FC<TweetButtonProps> = (props: TweetButtonProps) => {
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.text)}`;
  return (
    <Button
      style={{
        margin: '5px',
        textTransform: 'none',
        float: 'right',
      }}
      variant="contained"
      color="primary"
      href={tweet}
    >
      Tweetする
    </Button>
  );
};
