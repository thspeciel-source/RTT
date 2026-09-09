import bodyDustySal from '../assets/sprites/body_dusty_sal.png';
import shadowDustySal from '../assets/sprites/shadow_dusty_sal.png';
import faceScowl from '../assets/sprites/face_scowl.png';
import faceRage from '../assets/sprites/face_rage.png';
import faceShock from '../assets/sprites/face_shock.png';
import faceSad from '../assets/sprites/face_sad.png';
import faceGrin from '../assets/sprites/face_grin.png';
import playerBase from '../assets/sprites/player_base.png';
import bubbleExclamation from '../assets/bubbles/bubble_exclamation.png';
import bubbleQuestion from '../assets/bubbles/bubble_question.png';
import bubbleDoubleQuestion from '../assets/bubbles/bubble_double_question.png';
import bubbleAngerVein from '../assets/bubbles/bubble_anger_vein.png';
import bubbleHeart from '../assets/bubbles/bubble_heart.png';
import bubbleBrokenHeart from '../assets/bubbles/bubble_broken_heart.png';
import bubbleSweatDrop from '../assets/bubbles/bubble_sweat_drop.png';
import bubbleSkull from '../assets/bubbles/bubble_skull.png';
import bubbleZzz from '../assets/bubbles/bubble_zzz.png';
import bubbleSparkle from '../assets/bubbles/bubble_sparkle.png';
import bubbleEllipsis from '../assets/bubbles/bubble_ellipsis.png';
import suitSpade from '../assets/ui/suit_spade.png';
import suitDiamond from '../assets/ui/suit_diamond.png';
import suitClub from '../assets/ui/suit_club.png';
import suitHeart from '../assets/ui/suit_heart.png';
import pouchIcon from '../assets/ui/pouch_icon.png';
import strongboxIcon from '../assets/ui/strongbox_icon.png';
import swapIcon from '../assets/ui/swap_icon.png';
import inquiryIcon from '../assets/ui/inquiry_icon.png';
import prizeIcon from '../assets/ui/prize_icon.png';
import sunburstIcon from '../assets/ui/sunburst.png';

// Real pixellab.ai art for Dusty Sal. NPC_BODY is the full character at
// native resolution (128x253) with a neutral expression baked in — face
// overlays only cover the head region (everything below the neck is
// transparent) and are cropped from the exact same coordinate space as
// the body, so they land in perfect alignment with no per-layer scaling.
// A face key not listed here (most of the ~50-key emote bank still is)
// falls back to just showing the body's own neutral face — see
// NPCSprite.jsx. Arms aren't separate layers yet; they're baked into
// NPC_BODY until arm-pose art exists.
export const NPC_BODY = bodyDustySal;
// Ground shadow extracted out of the original generation (same pixels, same
// coordinate space as NPC_BODY) so it renders as its own layer underneath
// instead of being baked into the body — the baked-in version didn't line
// up with the game's own ground-line rendering.
export const NPC_SHADOW = shadowDustySal;
export const PLAYER_BODY = playerBase;

export const FACE_IMAGES = {
  scowl: faceScowl,
  rage: faceRage,
  shock: faceShock,
  sad: faceSad,
  grin: faceGrin
};

export const BUBBLE_IMAGES = {
  exclamation: bubbleExclamation,
  question: bubbleQuestion,
  double_question: bubbleDoubleQuestion,
  anger_vein: bubbleAngerVein,
  heart: bubbleHeart,
  broken_heart: bubbleBrokenHeart,
  sweat_drop: bubbleSweatDrop,
  skull: bubbleSkull,
  zzz: bubbleZzz,
  sparkle: bubbleSparkle,
  ellipsis: bubbleEllipsis
};

export const SUIT_IMAGES = {
  friendly: suitSpade,
  shrewd: suitDiamond,
  aggressive: suitClub,
  deceptive: suitHeart
};

export const POUCH_ICON = pouchIcon;
export const STRONGBOX_ICON = strongboxIcon;
export const SWAP_ICON = swapIcon;
export const INQUIRY_ICON = inquiryIcon;
export const PRIZE_ICON = prizeIcon;
export const SUNBURST_ICON = sunburstIcon;
