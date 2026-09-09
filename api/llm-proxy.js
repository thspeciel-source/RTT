const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

// Gemini's REST shape is different enough from Anthropic's Messages API
// that we translate at the proxy boundary — the client (src/systems/llm.js)
// always speaks the Anthropic-flavored {model, max_tokens, system, messages}
// request and gets back {content: [{text}]}, regardless of which provider
// is actually configured server-side.
async function callGemini({ max_tokens, system, messages }, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: {
        // Gemini's "thinking" tokens come out of this same budget before
        // any visible text — our schema (a full response plus 4 detailed
        // pre_responses) needs real headroom on top of that, so this
        // ignores the client's smaller Anthropic-tuned default rather
        // than risk silently truncating mid-JSON.
        maxOutputTokens: Math.max(max_tokens || 0, 8000),
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 200 }
      }
    })
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    return { ok: false, status: upstream.status, body: data };
  }
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  return { ok: true, body: { content: [{ text }] } };
}

async function callAnthropic({ model, max_tokens, system, messages }, apiKey) {
  const upstream = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, max_tokens: max_tokens || 2000, system, messages })
  });
  const data = await upstream.json();
  if (!upstream.ok) {
    return { ok: false, status: upstream.status, body: data };
  }
  return { ok: true, body: data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!GEMINI_API_KEY && !ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'No LLM API key configured on the server (GEMINI_API_KEY, GEMINI_KEY, or ANTHROPIC_API_KEY).' });
    return;
  }

  const { model, max_tokens, system, messages } = req.body || {};
  if (!messages) {
    res.status(400).json({ error: 'Request must include messages.' });
    return;
  }

  try {
    const result = GEMINI_API_KEY
      ? await callGemini({ max_tokens, system, messages }, GEMINI_API_KEY)
      : await callAnthropic({ model, max_tokens, system, messages }, ANTHROPIC_API_KEY);

    res.status(result.ok ? 200 : result.status).json(result.body);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach LLM API.', detail: err.message });
  }
}
