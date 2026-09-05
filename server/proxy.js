import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/api/llm-proxy', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  const { model, max_tokens, system, messages } = req.body || {};
  if (!model || !messages) {
    return res.status(400).json({ error: 'Request must include model and messages.' });
  }

  try {
    const upstream = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: max_tokens || 2000,
        system,
        messages
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }
    return res.json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Anthropic API.', detail: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasApiKey: !!ANTHROPIC_API_KEY });
});

app.listen(PORT, () => {
  console.log(`LLM proxy listening on http://localhost:${PORT}`);
});
