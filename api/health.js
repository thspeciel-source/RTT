export default function handler(req, res) {
  res.status(200).json({ ok: true, hasApiKey: !!(process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY) });
}
