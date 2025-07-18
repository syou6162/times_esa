import React from 'react';
import { Button } from '@mui/material';
import { TweetButtonProps } from '../../../types/components';


export const TweetButton: React.FC<TweetButtonProps> = (props: TweetButtonProps) => {
  const tweet = `https://x.com/intent/post?text=${encodeURIComponent(props.text)}`;
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
