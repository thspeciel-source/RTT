import React from 'react';
import { useTypewriter } from '../systems/typewriter.js';

export default function DialogueBox({ speakerName, text, speed = 40, onFinished }) {
  const { displayedText, isPageComplete, tap } = useTypewriter(text, { speed });

  function handleTap() {
    const result = tap();
    if (result.action === 'finished' && onFinished) onFinished();
  }

  return (
    <div className="dialogue-box" onClick={handleTap} role="button" tabIndex={0}>
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
}
