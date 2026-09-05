import React from 'react';
import { moodToColor, moodToEdgeColor, clamp, lerp } from '../systems/mood.js';

export default function MoodBackground({ valence, arousal, patience, crashed }) {
  const center = moodToColor(valence, arousal);
  const edge = moodToEdgeColor(valence, arousal);
  const lowPatience = patience < 0.25;
  const vignetteStrength = lowPatience
    ? lerp(0.5, 0.2, clamp(patience / 0.25, 0, 1))
    : 0;

  return (
    <div
      className="mood-background"
      style={{ '--mood-center': crashed ? '#5a0e0e' : center, '--mood-edge': crashed ? '#1a0303' : edge }}
    >
      <div className="mood-noise" />
      <div
        className={`mood-vignette${lowPatience ? ' low-patience' : ''}${crashed ? ' crashed' : ''}`}
        style={{ '--vignette-strength': `rgba(200, 30, 30, ${vignetteStrength.toFixed(2)})` }}
      />
    </div>
  );
}
