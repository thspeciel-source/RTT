import bodyDustySal from '../assets/sprites/body_dusty_sal.png';
import armRelaxed from '../assets/sprites/arm_relaxed.png';
import armCrossedArms from '../assets/sprites/arm_crossed_arms.png';
import armHandOnHip from '../assets/sprites/arm_hand_on_hip.png';
import armFistSlam from '../assets/sprites/arm_fist_slam.png';
import armHandsUp from '../assets/sprites/arm_hands_up.png';
import armPointing from '../assets/sprites/arm_pointing.png';
import faceNeutral from '../assets/sprites/face_neutral.png';
import faceSmile from '../assets/sprites/face_smile.png';
import faceScowl from '../assets/sprites/face_scowl.png';
import faceRage from '../assets/sprites/face_rage.png';
import faceShock from '../assets/sprites/face_shock.png';
import faceNervous from '../assets/sprites/face_nervous.png';
import playerBase from '../assets/sprites/player_base.png';
import bubbleExclamation from '../assets/bubbles/bubble_exclamation.png';
import bubbleQuestion from '../assets/bubbles/bubble_question.png';
import bubbleAngerVein from '../assets/bubbles/bubble_anger_vein.png';
import bubbleHeart from '../assets/bubbles/bubble_heart.png';
import bubbleSparkle from '../assets/bubbles/bubble_sparkle.png';
import bubbleEllipsis from '../assets/bubbles/bubble_ellipsis.png';

// Hand-authored pixel art for a first pass of key emotes. Any face/arm/bubble
// key not listed here falls back to the colored-placeholder rendering in
// NPCSprite.jsx — nothing crashes or goes blank as the art set grows.
export const NPC_BODY = bodyDustySal;
export const PLAYER_BODY = playerBase;

export const ARM_IMAGES = {
  relaxed: armRelaxed,
  crossed_arms: armCrossedArms,
  hand_on_hip: armHandOnHip,
  fist_slam: armFistSlam,
  hands_up: armHandsUp,
  pointing: armPointing
};

export const FACE_IMAGES = {
  neutral: faceNeutral,
  smile: faceSmile,
  scowl: faceScowl,
  rage: faceRage,
  shock: faceShock,
  nervous: faceNervous
};

export const BUBBLE_IMAGES = {
  exclamation: bubbleExclamation,
  question: bubbleQuestion,
  anger_vein: bubbleAngerVein,
  heart: bubbleHeart,
  sparkle: bubbleSparkle,
  ellipsis: bubbleEllipsis
};
