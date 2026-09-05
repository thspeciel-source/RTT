import React from 'react';
import { patienceToFillColor } from '../systems/mood.js';

export default function PatienceBar({ patience }) {
  const pct = Math.round(Math.max(0, Math.min(1, patience)) * 100);
  const pulsing = patience < 0.25;

  return (
    <div className="patience-bar-wrap">
      <div className={`patience-bar-track${pulsing ? ' pulsing' : ''}`}>
        <div
          className="patience-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: patienceToFillColor(patience) }}
        />
        <div className="patience-bar-ticks">
          <div className="patience-bar-tick" style={{ left: '25%' }} />
          <div className="patience-bar-tick" style={{ left: '50%' }} />
          <div className="patience-bar-tick" style={{ left: '75%' }} />
        </div>
      </div>
    </div>
  );
}
