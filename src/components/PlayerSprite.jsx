import React from 'react';
import { PLAYER_BODY } from '../systems/sprite-assets.js';

export default function PlayerSprite() {
  return (
    <div className="player-sprite-wrap">
      <div className="player-sprite">
        <img className="player-layer-img" src={PLAYER_BODY} alt="" />
      </div>
    </div>
  );
}
