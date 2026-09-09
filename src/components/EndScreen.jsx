import React, { useEffect, useState } from 'react';
import { PRIZE_ICON, SUNBURST_ICON } from '../systems/sprite-assets.js';

export default function EndScreen({ outcome, summary, wonItemName, onRestart }) {
  const [canRestart, setCanRestart] = useState(false);

  useEffect(() => {
    setCanRestart(false);
    const t = setTimeout(() => setCanRestart(true), 2000);
    return () => clearTimeout(t);
  }, [outcome]);

  if (!outcome) return null;
  const isFailure = outcome === 'hostile_end';

  return (
    <div className="end-screen">
      <div className={`end-screen-title ${isFailure ? 'failed' : 'success shiny-text'}`}>
        {isFailure ? 'DEAL FAILED' : 'DEAL MADE'}
      </div>
      {!isFailure && (
        <div className="prize-reveal">
          <img className="prize-sunburst" src={SUNBURST_ICON} alt="" />
          <img className="prize-icon" src={PRIZE_ICON} alt="" />
        </div>
      )}
      {!isFailure && wonItemName && <div className="prize-name">{wonItemName}</div>}
      <div className="end-screen-subtitle">
        {isFailure ? "They won't be coming back." : summary}
      </div>
      <button
        type="button"
        className="end-screen-button"
        style={{ pointerEvents: canRestart ? 'auto' : 'none' }}
        onClick={onRestart}
      >
        {isFailure ? 'Try Again' : 'Continue'}
      </button>
    </div>
  );
}
