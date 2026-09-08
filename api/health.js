export default function handler(req, res) {
  res.status(200).json({ ok: true, hasApiKey: !!process.env.ANTHROPIC_API_KEY });
}
