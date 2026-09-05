import React from 'react';
import MoodBackground from './MoodBackground.jsx';
import AmbientParticles from './AmbientParticles.jsx';
import PatienceBar from './PatienceBar.jsx';
import NPCSprite from './NPCSprite.jsx';
import PlayerSprite from './PlayerSprite.jsx';

export default function StageArea({ mood, patience, npc, crashed, rageOverlay }) {
  return (
    <div className="stage-area">
      <MoodBackground valence={mood.valence} arousal={mood.arousal} patience={patience} crashed={crashed} />
      <AmbientParticles valence={mood.valence} arousal={mood.arousal} />
      <div className="ground-line" />
      <PatienceBar patience={patience} />
      <PlayerSprite />
      <NPCSprite
        face={npc.face}
        arms={npc.arms}
        bubble={npc.bubble}
        bodyAnim={npc.body_anim}
        rageOverlay={rageOverlay}
      />
    </div>
  );
}
