import React, { useMemo } from 'react';
import { moodToColor } from '../systems/mood.js';

const PARTICLE_COUNT = 13;

export default function AmbientParticles({ valence, arousal }) {
  const color = moodToColor(valence, arousal);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        drift: Math.round((Math.random() - 0.5) * 40),
        duration: (14 + Math.random() * 8).toFixed(1),
        delay: (Math.random() * 12).toFixed(1)
      })),
    []
  );

  return (
    <div className="ambient-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            '--drift': `${p.drift}px`,
            '--particle-color': color,
            opacity: 0.2,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
}
