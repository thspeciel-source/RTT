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

const OPTION_TEXT_LIMIT = 60;
const MEMORY_TEXT_LIMIT = 80;

// Backstop for the "max N chars" prompt rules — some of this fills a
// fixed-size button, some a small status strip, but either way an LLM that
// ignores the limit gets clipped here rather than pushing the layout around.
function truncateText(text, limit = OPTION_TEXT_LIMIT) {
  const str = String(text);
  if (str.length <= limit) return str;
  return `${str.slice(0, limit - 1).trimEnd()}…`;
}

// Player options always occupy the same position for the same approach —
// index 0 is always friendly, 1 shrewd, 2 aggressive, 3 deceptive — so the
// suit icon and button slot the player learns to recognize never shifts
// around. The system prompt asks the LLM to already return them this way;
// this order is enforced here regardless, since the game must never show
// them in a different order even if the LLM doesn't comply.
export const STRATEGY_ORDER = ['friendly', 'shrewd', 'aggressive', 'deceptive'];

export function getDefaultOptions() {
  return [
    { label: 'Be friendly', strategy: 'friendly', text: "Let's talk this through." },
    { label: 'Be clever', strategy: 'shrewd', text: 'I have an interesting proposition.' },
    { label: 'Be direct', strategy: 'aggressive', text: "Here's how it's going to be." },
    { label: 'Deflect', strategy: 'deceptive', text: "That's not quite what I meant..." }
  ];
}

// Returns the reordered options plus a permutation array: permutation[newIndex]
// is the ORIGINAL index that option came from (or null if a default filled an
// empty slot). The caller needs this to keep pre_responses — which are keyed
// to the LLM's original, pre-reorder positions — pointing at the right button.
function reorderByStrategy(options) {
  const defaults = getDefaultOptions();
  const byStrategy = {};
  options.forEach((opt, i) => {
    if (!(opt.strategy in byStrategy)) byStrategy[opt.strategy] = i;
  });
  const permutation = [];
  const reordered = STRATEGY_ORDER.map((strategy, i) => {
    const origIndex = byStrategy[strategy];
    if (origIndex !== undefined) {
      permutation.push(origIndex);
      return options[origIndex];
    }
    permutation.push(null);
    return defaults[i];
  });
  return { reordered, permutation };
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
    trade_result: { player_gives: [], player_receives: [] },
    memory: 'Just getting acquainted.',
    player_options: getDefaultOptions()
  };
}

function validateTradeResult(raw) {
  const isIdArray = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
  if (!raw || typeof raw !== 'object') {
    return { player_gives: [], player_receives: [] };
  }
  return {
    player_gives: isIdArray(raw.player_gives),
    player_receives: isIdArray(raw.player_receives)
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

  data.trade_result = data.trade_state === 'accepted' ? validateTradeResult(data.trade_result) : { player_gives: [], player_receives: [] };

  data.memory =
    typeof data.memory === 'string' && data.memory.trim()
      ? truncateText(data.memory.trim(), MEMORY_TEXT_LIMIT)
      : 'Just getting acquainted.';

  if (!data.npc_dialogue || typeof data.npc_dialogue !== 'string') {
    data.npc_dialogue = '...';
  }

  if (!Array.isArray(data.player_options) || data.player_options.length !== 4) {
    data.player_options = getDefaultOptions();
    data._optionPermutation = [0, 1, 2, 3];
  } else {
    const mapped = data.player_options.map((opt, i) => ({
      label: (opt && opt.label) || ['Friendly', 'Shrewd', 'Aggressive', 'Deceptive'][i],
      strategy: opt && VALID.strategy.includes(opt.strategy) ? opt.strategy : VALID.strategy[i],
      text: truncateText((opt && opt.text) || 'Continue the conversation.')
    }));
    const { reordered, permutation } = reorderByStrategy(mapped);
    data.player_options = reordered;
    data._optionPermutation = permutation;
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
  const optionPermutation = data._optionPermutation || [0, 1, 2, 3];
  delete data._optionPermutation;

  if (data.pre_responses && typeof data.pre_responses === 'object') {
    // pre_responses arrived keyed to the LLM's ORIGINAL (pre-reorder) option
    // positions — remap them through the same permutation used above so
    // pre_responses["<new button index>"] still matches the option now
    // showing in that slot.
    const rawPreResponses = data.pre_responses;
    const nextPreResponses = {};
    for (let newIndex = 0; newIndex < 4; newIndex++) {
      const origIndex = optionPermutation[newIndex];
      const source = origIndex !== null ? rawPreResponses[String(origIndex)] : null;
      if (source) {
        const validated = validateCore({ ...source });
        delete validated.pre_responses;
        delete validated._optionPermutation;
        nextPreResponses[String(newIndex)] = validated;
      } else {
        nextPreResponses[String(newIndex)] = getDefaultResponse();
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
