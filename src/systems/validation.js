// validation.js — run on every LLM response before it touches game state.
// No matter what the LLM returns, the game must never crash: bad values get
// silently replaced with safe defaults.

export const VALID = {
  face: ['neutral', 'smile', 'grin', 'laugh', 'smirk', 'frown', 'scowl',
    'shock', 'worry', 'disgust', 'sad', 'sly', 'rage', 'blank',
    'nervous', 'pleading'],
  arms: ['relaxed', 'crossed_arms', 'hand_on_hip', 'palms_up', 'pointing',
    'fist_raised', 'fist_slam', 'hand_wave', 'hand_out',
    'scratching_head', 'rubbing_chin', 'hands_up', 'tipping_hat',
    'reaching_pocket', 'counting_money'],
  bubble: ['none', 'exclamation', 'question', 'double_question', 'heart',
    'broken_heart', 'anger_vein', 'sweat_drop', 'money_eyes',
    'skull', 'lightbulb', 'zzz', 'sparkle', 'ellipsis'],
  body_anim: ['idle', 'bounce', 'shake', 'recoil', 'lean_forward',
    'lean_back', 'slam', 'storm_off', 'jump', 'tremble'],
  strategy: ['friendly', 'shrewd', 'aggressive', 'deceptive'],
  trade_state: ['none', 'offered', 'accepted', 'rejected', 'hostile_end']
};

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, Number(val) || 0));
}

export function getDefaultOptions() {
  return [
    { label: 'Be friendly', strategy: 'friendly', text: "Let's talk this through." },
    { label: 'Be clever', strategy: 'shrewd', text: 'I have an interesting proposition.' },
    { label: 'Be direct', strategy: 'aggressive', text: "Here's how it's going to be." },
    { label: 'Deflect', strategy: 'deceptive', text: "That's not quite what I meant..." }
  ];
}

export function getDefaultResponse() {
  return {
    npc_dialogue: 'Hmm... let me think about that.',
    face: 'neutral',
    arms: 'relaxed',
    bubble: 'ellipsis',
    body_anim: 'idle',
    mood: { valence: 0, arousal: 0.2 },
    patience: 0.5,
    trade_state: 'none',
    revealed_item: null,
    player_options: getDefaultOptions()
  };
}

function validateCore(data) {
  data.face = VALID.face.includes(data.face) ? data.face : 'neutral';
  data.arms = VALID.arms.includes(data.arms) ? data.arms : 'relaxed';
  data.bubble = VALID.bubble.includes(data.bubble) ? data.bubble : 'none';
  data.body_anim = VALID.body_anim.includes(data.body_anim) ? data.body_anim : 'idle';
  data.trade_state = VALID.trade_state.includes(data.trade_state) ? data.trade_state : 'none';

  if (!data.mood || typeof data.mood !== 'object') data.mood = { valence: 0, arousal: 0.3 };
  data.mood = {
    valence: clamp(data.mood.valence, -1, 1),
    arousal: clamp(data.mood.arousal, 0, 1)
  };

  data.patience = clamp(data.patience ?? 0.5, 0, 1);

  data.revealed_item = typeof data.revealed_item === 'string' && data.revealed_item.trim() ? data.revealed_item : null;

  if (!data.npc_dialogue || typeof data.npc_dialogue !== 'string') {
    data.npc_dialogue = '...';
  }

  if (!Array.isArray(data.player_options) || data.player_options.length !== 4) {
    data.player_options = getDefaultOptions();
  } else {
    data.player_options = data.player_options.map((opt, i) => ({
      label: (opt && opt.label) || ['Friendly', 'Shrewd', 'Aggressive', 'Deceptive'][i],
      strategy: opt && VALID.strategy.includes(opt.strategy) ? opt.strategy : VALID.strategy[i],
      text: (opt && opt.text) || 'Continue the conversation.'
    }));
  }

  return data;
}

/**
 * Validates a full top-level LLM response (string or object). Handles
 * markdown-fenced JSON, missing fields, invalid enum values, and recurses
 * one level into pre_responses.
 */
export function validateResponse(raw) {
  let data;
  try {
    if (typeof raw === 'string') {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      data = JSON.parse(cleaned);
    } else if (raw && typeof raw === 'object') {
      data = raw;
    } else {
      return getDefaultResponse();
    }
  } catch (e) {
    return getDefaultResponse();
  }

  data = validateCore(data);

  if (data.pre_responses && typeof data.pre_responses === 'object') {
    const nextPreResponses = {};
    for (const key of ['0', '1', '2', '3']) {
      if (data.pre_responses[key]) {
        const validated = validateCore({ ...data.pre_responses[key] });
        delete validated.pre_responses;
        nextPreResponses[key] = validated;
      } else {
        nextPreResponses[key] = getDefaultResponse();
      }
    }
    data.pre_responses = nextPreResponses;
    data._needs_prefetch = false;
  } else {
    data.pre_responses = null;
    data._needs_prefetch = true;
  }

  return data;
}
