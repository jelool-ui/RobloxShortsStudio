// Comportements d'attente déterministes (dépendent uniquement du temps t et d'une graine).
// Les animations de marche/course/saut/surprise arrivent en phase 4.

// Hash simple et stable → nombre pseudo-aléatoire dans [0,1)
export function hash01(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function seedOf(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 1000;
}

/** Valeur de clignement (0 ouvert → 1 fermé) au temps t ; ~1 clignement / 3–5 s. */
export function blinkAt(t, seed = 0) {
  const period = 3 + hash01(seed) * 2;
  const local = (t + hash01(seed + 1) * period) % period;
  const d = 0.14; // durée du clignement
  if (local > d) return 0;
  return Math.sin((local / d) * Math.PI);
}

/** Pose d'attente : respiration, léger balancement des bras, regard. */
export function applyIdle(char, t, seed = 0) {
  const j = char.joints;
  const ph = hash01(seed) * 10;
  const breath = Math.sin((t + ph) * 2.2);
  j.torso.rotation.x = breath * 0.015;
  j.head.rotation.x = -breath * 0.02;
  j.head.rotation.y = Math.sin((t + ph) * 0.6) * 0.15;
  j.armL.rotation.z = -0.06 - breath * 0.025;
  j.armR.rotation.z = 0.06 + breath * 0.025;
  j.armL.rotation.x = Math.sin((t + ph) * 1.1) * 0.03;
  j.armR.rotation.x = -Math.sin((t + ph) * 1.1) * 0.03;
  char.setBlink(blinkAt(t, seed));
}
