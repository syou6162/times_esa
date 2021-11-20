import React from 'react';

export const moveCursorToEnd = (
  event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
): void => {
  event.preventDefault();
  const { target } = event;
  const lastPos = target.value.length;
  setTimeout(() => { // 本来は不要な気がする...
    target.setSelectionRange(lastPos, lastPos);
  });
  target.scrollTop = target.scrollHeight;
  target.scrollLeft = target.scrollWidth;
};

export default moveCursorToEnd;
