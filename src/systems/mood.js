export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Maps NPC mood (valence, arousal) to an HSL color.
 * Hue: hostile red (0deg) -> neutral blue (220deg) -> friendly warm gold (45deg).
 */
export function moodToColor(valence, arousal) {
  const v = clamp(valence, -1, 1);
  const a = clamp(arousal, 0, 1);

  let hue;
  if (v < 0) {
    hue = lerp(0, 220, v + 1);
  } else {
    hue = lerp(220, 45, v);
  }

  const saturation = lerp(25, 65, a);
  const lightness = lerp(18, 28, a);

  return `hsl(${hue.toFixed(1)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
}

export function moodToEdgeColor(valence, arousal) {
  const v = clamp(valence, -1, 1);
  const a = clamp(arousal, 0, 1);

  let hue;
  if (v < 0) {
    hue = lerp(0, 220, v + 1);
  } else {
    hue = lerp(220, 45, v);
  }

  const saturation = lerp(20, 55, a);
  const lightness = lerp(8, 14, a);

  return `hsl(${hue.toFixed(1)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
}

export function patienceToFillColor(patience) {
  const p = clamp(patience, 0, 1);
  let hue = lerp(0, 42, p);
  const saturation = 70;
  const lightness = lerp(45, 55, p);
  return `hsl(${hue.toFixed(1)}, ${saturation}%, ${lightness}%)`;
}
