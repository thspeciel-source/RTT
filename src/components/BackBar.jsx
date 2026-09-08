import React, { useState } from 'react';

export default function BackBar({ direction, onClick, label }) {
  const [pressed, setPressed] = useState(false);

  function handleClick() {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    onClick();
  }

  return (
    <button
      type="button"
      className={`back-bar back-bar-${direction}${pressed ? ' pressed' : ''}`}
      onClick={handleClick}
      aria-label={label}
    >
      <span className="back-bar-chevrons" aria-hidden="true" />
    </button>
  );
}
