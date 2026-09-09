import React from 'react';
import emoteMap from '../data/emote-map.json';
import { NPC_BODY, FACE_IMAGES, BUBBLE_IMAGES } from '../systems/sprite-assets.js';

export default function NPCSprite({ face, bubble, bodyAnim }) {
  const bubbleStyle = emoteMap.bubble[bubble];
  const faceImage = FACE_IMAGES[face];
  const bubbleImage = bubble && BUBBLE_IMAGES[bubble];

  return (
    <div className="npc-sprite-wrap">
      <div className={`npc-sprite anim-${bodyAnim || 'idle'}`}>
        <img className="npc-layer-img" src={NPC_BODY} alt="" />

        {/* No art for this face key yet (or it's "neutral") -> body's own baked-in
            neutral expression shows through untouched. No colored-box fallback
            here anymore; that would clash badly against real illustrated art. */}
        {faceImage && <img className="npc-layer-img" src={faceImage} alt="" />}

        {bubbleStyle &&
          (bubbleImage ? (
            <img className="npc-bubble-img" src={bubbleImage} alt="" />
          ) : (
            <div className="npc-bubble" style={{ color: bubbleStyle.color, borderColor: bubbleStyle.color }}>
              {bubbleStyle.icon}
            </div>
          ))}
      </div>
    </div>
  );
}
