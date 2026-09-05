import React from 'react';
import emoteMap from '../data/emote-map.json';

export default function NPCSprite({ face, arms, bubble, bodyAnim, rageOverlay }) {
  const faceStyle = emoteMap.face[face] || emoteMap.face.neutral;
  const armStyle = emoteMap.arms[arms] || emoteMap.arms.relaxed;
  const bubbleStyle = emoteMap.bubble[bubble];

  return (
    <div className="npc-sprite-wrap">
      <div className={`npc-sprite anim-${bodyAnim || 'idle'}`}>
        <div className="npc-layer npc-hat" />
        <div className="npc-layer npc-body" />
        <div className="npc-layer npc-head" />
        <div className="npc-layer npc-face" style={{ backgroundColor: faceStyle.color }} title={faceStyle.label} />
        <div className="npc-layer npc-arm-left" style={{ backgroundColor: armStyle.color }} />
        <div className="npc-layer npc-arm-right" style={{ backgroundColor: armStyle.color }} />
        {bubbleStyle && (
          <div className="npc-bubble" style={{ color: bubbleStyle.color, borderColor: bubbleStyle.color }}>
            {bubbleStyle.icon}
          </div>
        )}
        {rageOverlay && <div className="npc-rage-overlay" />}
      </div>
    </div>
  );
}
