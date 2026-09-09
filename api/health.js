export default function handler(req, res) {
  const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.ANTHROPIC_API_KEY);
  res.status(200).json({ ok: true, hasApiKey });
}
