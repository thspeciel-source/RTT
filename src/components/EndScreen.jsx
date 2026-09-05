import React, { useEffect, useMemo, useState } from 'react';

export default function EndScreen({ outcome, summary, onRestart }) {
  const [canRestart, setCanRestart] = useState(false);

  useEffect(() => {
    setCanRestart(false);
    const t = setTimeout(() => setCanRestart(true), 2000);
    return () => clearTimeout(t);
  }, [outcome]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        top: Math.round(Math.random() * 100),
        delay: (Math.random() * 1.2).toFixed(2)
      })),
    [outcome]
  );

  if (!outcome) return null;
  const isFailure = outcome === 'hostile_end';

  return (
    <div className="end-screen">
      {!isFailure && (
        <div className="sparkle-field">
          {sparkles.map((s) => (
            <span
              key={s.id}
              className="sparkle-dot"
              style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}
            >
              ✱
            </span>
          ))}
        </div>
      )}
      <div className={`end-screen-title ${isFailure ? 'failed' : 'success'}`}>
        {isFailure ? 'DEAL FAILED' : 'DEAL MADE'}
      </div>
      <div className="end-screen-subtitle">
        {isFailure ? "They won't be coming back." : summary}
      </div>
      <button
        type="button"
        className="end-screen-button"
        style={{ animationPlayState: canRestart ? 'running' : 'paused', pointerEvents: canRestart ? 'auto' : 'none' }}
        onClick={onRestart}
      >
        {isFailure ? 'Try Again' : 'Play Again'}
      </button>
    </div>
  );
}
