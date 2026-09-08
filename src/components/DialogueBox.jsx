import React, { forwardRef, useImperativeHandle } from 'react';
import { useTypewriter } from '../systems/typewriter.js';

const DialogueBox = forwardRef(function DialogueBox({ speakerName, text, speed = 40, onFinished }, ref) {
  const { displayedText, isPageComplete, isLastPage, tap } = useTypewriter(text, { speed });

  function advance() {
    const result = tap();
    if (result.action === 'finished' && onFinished) onFinished();
  }

  useImperativeHandle(ref, () => ({
    advance,
    isFullyRevealed: () => isPageComplete && isLastPage
  }));

  return (
    <div className="dialogue-box" onClick={advance} role="button" tabIndex={0}>
      {speakerName && <div className="dialogue-speaker shiny-text-dark">{speakerName.toUpperCase()}:</div>}
      <div className="dialogue-text">
        {displayedText}
        {isPageComplete ? (
          <span className="dialogue-advance">▼</span>
        ) : (
          <span className="dialogue-cursor">▌</span>
        )}
      </div>
    </div>
  );
});

export default DialogueBox;
