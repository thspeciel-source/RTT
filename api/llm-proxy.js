const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
    return;
  }

  const { model, max_tokens, system, messages } = req.body || {};
  if (!model || !messages) {
    res.status(400).json({ error: 'Request must include model and messages.' });
    return;
  }

  try {
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
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Anthropic API.', detail: err.message });
  }
}
