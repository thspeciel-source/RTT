import { validateResponse } from './validation.js';

export const MODEL = 'claude-haiku-4-5-20251001';

export function buildSystemPrompt(npc, playerInventory) {
  return `You are ${npc.name}, ${npc.personality}.
${npc.backstory}
You own: ${npc.inventory.join(', ')}.
Your goal: ${npc.goal}. You will try to get the best deal possible.
Your patience starts at: 1.0 (fully patient). It decreases when the player wastes your time, is rude, makes bad offers, or stalls. It can recover slightly if the player says something interesting or makes a good offer. When patience hits 0, you lose your temper and end the conversation angrily.
Your mood starts at: valence ${npc.initialMood.valence}, arousal ${npc.initialMood.arousal}.

The player has approached you to negotiate. They have: ${playerInventory.join(', ')}.

You MUST respond with ONLY a JSON object. No text before it, no text after it, no markdown fences. Just the raw JSON. Output raw JSON only. Do not wrap in backticks or markdown.

The JSON MUST use this exact schema. Every field is required:
{
  "npc_dialogue": "(string) What you say to the player. Keep it under 200 characters. Write in character.",
  "face": "(string) MUST be one of: neutral, smile, grin, laugh, smirk, frown, scowl, shock, worry, disgust, sad, sly, rage, blank, nervous, pleading",
  "arms": "(string) MUST be one of: relaxed, crossed_arms, hand_on_hip, palms_up, pointing, fist_raised, fist_slam, hand_wave, hand_out, scratching_head, rubbing_chin, hands_up, tipping_hat, reaching_pocket, counting_money",
  "bubble": "(string) MUST be one of: none, exclamation, question, double_question, heart, broken_heart, anger_vein, sweat_drop, money_eyes, skull, lightbulb, zzz, sparkle, ellipsis",
  "body_anim": "(string) MUST be one of: idle, bounce, shake, recoil, lean_forward, lean_back, slam, jump, tremble",
  "mood": {
    "valence": "(number) -1.0 to 1.0. Negative = hostile, positive = friendly.",
    "arousal": "(number) 0.0 to 1.0. Low = calm, high = agitated."
  },
  "patience": "(number) 0.0 to 1.0. Starts at 1.0. Decrease when frustrated, increase slightly when engaged. Never increase more than 0.05 per turn. Decrease by 0.05-0.15 depending on severity. At 0, you MUST set trade_state to hostile_end.",
  "trade_state": "(string) MUST be one of: none, offered, accepted, rejected, hostile_end",
  "player_options": [
    {
      "label": "(string) Short label, max 15 chars",
      "strategy": "(string) MUST be one of: friendly, shrewd, aggressive, deceptive",
      "text": "(string) What the player would say, max 80 chars"
    }
  ],
  "pre_responses": {
    "0": { "SAME SCHEMA AS THE TOP-LEVEL RESPONSE": "minus pre_responses" },
    "1": {},
    "2": {},
    "3": {}
  }
}

RULES:
- player_options MUST contain exactly 4 items.
- Each option MUST use a different strategy value.
- pre_responses MUST contain exactly 4 items keyed "0" through "3", one per player_option in the SAME response, in order.
- Each pre_response uses the same schema as the top-level (npc_dialogue, face, arms, bubble, body_anim, mood, patience, trade_state, player_options) but does NOT include its own pre_responses.
- face, arms, bubble, body_anim MUST be from the provided lists. Do not invent new values.
- Mood should shift gradually — no more than 0.3 on either axis per turn unless something dramatic happens.
- The 4 player options should represent genuinely different approaches. Do not generate 4 variations of the same idea.
- Your body language should match and reinforce your words. If you're suspicious, your face should show it and your arms should reflect it — don't just say suspicious things with a neutral pose.
- Stay in character. Let your personality drive your emote and body language choices.`;
}

/**
 * Calls the server-side proxy with the running conversation history and the
 * player's chosen line, then validates the raw text before returning it.
 */
export async function getNPCResponse(systemPrompt, conversationHistory, playerChoiceText) {
  const messages = [
    ...conversationHistory.slice(-16),
    { role: 'user', content: playerChoiceText }
  ];

  const response = await fetch('/api/llm-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`LLM proxy error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const rawText = (data.content || []).map((c) => c.text || '').join('');
  return validateResponse(rawText);
}
