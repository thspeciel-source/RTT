import React from 'react';
import MoodBackground from './MoodBackground.jsx';
import AmbientParticles from './AmbientParticles.jsx';
import PatienceBar from './PatienceBar.jsx';
import NPCSprite from './NPCSprite.jsx';
import PlayerSprite from './PlayerSprite.jsx';

const WIND_STREAKS = [
  { top: '38%', duration: '7s', delay: '0s' },
  { top: '48%', duration: '9s', delay: '-3s' },
  { top: '58%', duration: '8s', delay: '-6s' }
];

export default function StageArea({ mood, patience, npc, crashed, rageOverlay }) {
  return (
    <div className="stage-area">
      <MoodBackground valence={mood.valence} arousal={mood.arousal} patience={patience} crashed={crashed} />
      <AmbientParticles valence={mood.valence} arousal={mood.arousal} />
      <div className="wind-streaks">
        {WIND_STREAKS.map((s, i) => (
          <div
            key={i}
            className="wind-streak"
            style={{ top: s.top, animationDuration: s.duration, animationDelay: s.delay }}
          />
        ))}
      </div>
      <PatienceBar patience={patience} />
      <PlayerSprite />
      <NPCSprite
        face={npc.face}
        bubble={npc.bubble}
        bodyAnim={npc.body_anim}
        rageOverlay={rageOverlay}
      />
    </div>
  );
}
