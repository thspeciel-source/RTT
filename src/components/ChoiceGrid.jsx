import React, { useState } from 'react';

const STRATEGY_ICON = {
  friendly: '♠',
  shrewd: '♦',
  aggressive: '♣',
  deceptive: '♥'
};

export default function ChoiceGrid({ options, disabled, onSelect }) {
  const [pressedIndex, setPressedIndex] = useState(null);
  const [ripple, setRipple] = useState(null);

  function handleClick(e, index) {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ index, x: e.clientX - rect.left, y: e.clientY - rect.top, key: Date.now() });
    setPressedIndex(index);
    setTimeout(() => setPressedIndex(null), 100);
    onSelect(index);
  }

  return (
    <div className="choice-grid">
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          className={`choice-button${disabled ? ' disabled' : ''}${pressedIndex === i ? ' pressed' : ''}`}
          onClick={(e) => handleClick(e, i)}
          disabled={disabled}
        >
          <span className="choice-button-label shiny-text">
            {STRATEGY_ICON[opt.strategy] || '•'} {opt.label}
          </span>
          <span className="choice-button-text">{opt.text}</span>
          {ripple && ripple.index === i && (
            <span
              key={ripple.key}
              className="choice-ripple"
              style={{ left: ripple.x, top: ripple.y, width: 120, height: 120 }}
              onAnimationEnd={() => setRipple(null)}
            />
          )}
        </button>
      ))}
    </div>
  );
}
