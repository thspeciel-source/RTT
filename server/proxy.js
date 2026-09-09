import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Gemini's REST shape is different enough from Anthropic's Messages API
// that we translate at the proxy boundary — the client (src/systems/llm.js)
// always speaks the Anthropic-flavored {model, max_tokens, system, messages}
// request and gets back {content: [{text}]}, regardless of which provider
// is actually configured server-side.
async function callGemini({ max_tokens, system, messages }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY
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

async function callAnthropic({ model, max_tokens, system, messages }) {
  const upstream = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
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

app.post('/api/llm-proxy', async (req, res) => {
  if (!GEMINI_API_KEY && !ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'No LLM API key configured on the server (GEMINI_API_KEY, GEMINI_KEY, or ANTHROPIC_API_KEY).' });
  }

  const { model, max_tokens, system, messages } = req.body || {};
  if (!messages) {
    return res.status(400).json({ error: 'Request must include messages.' });
  }

  try {
    const result = GEMINI_API_KEY
      ? await callGemini({ max_tokens, system, messages })
      : await callAnthropic({ model, max_tokens, system, messages });

    if (!result.ok) {
      return res.status(result.status).json(result.body);
    }
    return res.json(result.body);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach LLM API.', detail: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasApiKey: !!(GEMINI_API_KEY || ANTHROPIC_API_KEY) });
});

app.listen(PORT, () => {
  console.log(`LLM proxy listening on http://localhost:${PORT}`);
});
