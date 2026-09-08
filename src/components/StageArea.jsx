import React from 'react';
import MoodBackground from './MoodBackground.jsx';
import AmbientParticles from './AmbientParticles.jsx';
import PatienceBar from './PatienceBar.jsx';
import NPCSprite from './NPCSprite.jsx';
import PlayerSprite from './PlayerSprite.jsx';

const WIND_STREAKS = [
  { top: '8%', duration: '7s', delay: '0s' },
  { top: '18%', duration: '9.5s', delay: '-4s' },
  { top: '27%', duration: '8s', delay: '-1s' },
  { top: '36%', duration: '10s', delay: '-6s' },
  { top: '45%', duration: '7.5s', delay: '-2.5s' },
  { top: '54%', duration: '9s', delay: '-5s' },
  { top: '63%', duration: '8.5s', delay: '-3.5s' },
  { top: '72%', duration: '10.5s', delay: '-7s' },
  { top: '81%', duration: '7.8s', delay: '-1.8s' },
  { top: '90%', duration: '9.2s', delay: '-4.5s' }
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
