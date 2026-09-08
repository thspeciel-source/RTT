import React from 'react';
import emoteMap from '../data/emote-map.json';
import { NPC_BODY, ARM_IMAGES, FACE_IMAGES, BUBBLE_IMAGES } from '../systems/sprite-assets.js';

export default function NPCSprite({ face, arms, bubble, bodyAnim, rageOverlay }) {
  const faceStyle = emoteMap.face[face] || emoteMap.face.neutral;
  const armStyle = emoteMap.arms[arms] || emoteMap.arms.relaxed;
  const bubbleStyle = emoteMap.bubble[bubble];

  const armImage = ARM_IMAGES[arms];
  const faceImage = FACE_IMAGES[face];
  const bubbleImage = bubble && BUBBLE_IMAGES[bubble];

  return (
    <div className="npc-sprite-wrap">
      <div className={`npc-sprite anim-${bodyAnim || 'idle'}`}>
        <img className="npc-layer-img" src={NPC_BODY} alt="" />

        {armImage ? (
          <img className="npc-layer-img" src={armImage} alt="" />
        ) : (
          <>
            <div className="npc-layer npc-arm-left" style={{ backgroundColor: armStyle.color }} />
            <div className="npc-layer npc-arm-right" style={{ backgroundColor: armStyle.color }} />
          </>
        )}

        {faceImage ? (
          <img className="npc-layer-img" src={faceImage} alt="" />
        ) : (
          <div className="npc-layer npc-face" style={{ backgroundColor: faceStyle.color }} title={faceStyle.label} />
        )}

        {bubbleStyle &&
          (bubbleImage ? (
            <img className="npc-bubble-img" src={bubbleImage} alt="" />
          ) : (
            <div className="npc-bubble" style={{ color: bubbleStyle.color, borderColor: bubbleStyle.color }}>
              {bubbleStyle.icon}
            </div>
          ))}

        {rageOverlay && <div className="npc-rage-overlay" />}
      </div>
    </div>
  );
}
