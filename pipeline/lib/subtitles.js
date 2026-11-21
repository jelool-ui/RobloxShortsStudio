// Sous-titres dynamiques (format ASS, incrustés par FFmpeg/libass en 1080×1920) :
//  - groupes de 1 à 3 mots qui apparaissent avec un effet « pop »
//  - le mot prononcé est surligné à la couleur du personnage
//  - nom du personnage au-dessus, titre d'accroche au début, appel à l'abonnement à la fin
// Placement dans la zone sûre des Shorts (le bas de l'écran est couvert par l'interface YouTube).
import { CHARACTERS } from '../../src/engine/characters.js';

export const FONT_NAME = 'Lilita One';
const W = 1080, H = 1920;
const SUB_Y = 1250; // centre vertical des sous-titres
const TITLE_Y = 360;

// Couleur d'accent de chaque personnage (#RRGGBB)
export const SPEAKER_COLORS = { nino: '#FF5A4E', zoe: '#3BE38A', max: '#FFD23F' };

const assColor = (hex) => {
  const h = hex.replace('#', '');
  return `&H00${h.slice(4, 6)}${h.slice(2, 4)}${h.slice(0, 2)}&`.toUpperCase();
};

export function assTime(t) {
  const cs = Math.max(0, Math.round(t * 100));
  const h = Math.floor(cs / 360000), m = Math.floor((cs % 360000) / 6000), s = Math.floor((cs % 6000) / 100), c = cs % 100;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}

const clean = (s) => s
  .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
  .replace(/[{}\\]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/** Découpe une réplique en groupes de mots courts, avec le minutage estimé de chaque mot. */
export function chunkLine(text, start, end, { maxWords = 3, maxChars = 16 } = {}) {
  const words = clean(text).toUpperCase().split(' ').filter(Boolean);
  // poids d'un mot = nombre de lettres (+ pause après la ponctuation)
  const weights = words.map((w) => Math.max(1, (w.match(/[\p{L}\p{N}]/gu) || []).length) + (/[.!?…,;:]$/.test(w) ? 3 : 0) + 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const dur = Math.max(0.1, end - start);
  let t = start;
  const timed = words.map((w, i) => {
    const d = (weights[i] / total) * dur;
    const r = { word: w, start: t, end: t + d };
    t += d;
    return r;
  });
  const chunks = [];
  let cur = [];
  const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  for (const w of timed) {
    const len = cur.map((x) => x.word).join(' ').length + w.word.length + 1;
    if (cur.length >= maxWords || (cur.length && len > maxChars)) flush();
    cur.push(w);
    if (/[.!?…]$/.test(w.word)) flush(); // fin de phrase → nouveau groupe
  }
  flush();
  return chunks.map((ws) => ({ words: ws, start: ws[0].start, end: ws[ws.length - 1].end }));
}

/**
 * @param storyboard storyboard définitif (avec dialogue horodaté)
 * @param story      histoire (titre)
 * @returns contenu du fichier .ass
 */
export function buildAss(storyboard, story) {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${W}
PlayResY: ${H}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,${FONT_NAME},104,&H00FFFFFF,&H00FFFFFF,&H00101010,&H96000000,0,0,0,0,100,100,1,0,1,8,4,5,60,60,0,1
Style: Name,${FONT_NAME},54,&H00FFFFFF,&H00FFFFFF,&H00101010,&H96000000,0,0,0,0,100,100,2,0,1,6,3,5,60,60,0,1
Style: Title,${FONT_NAME},104,&H003FD2FF,&H00FFFFFF,&H00101010,&H96000000,0,0,0,0,100,100,1,0,1,9,5,5,70,70,0,1
Style: Cta,${FONT_NAME},72,&H00FFFFFF,&H00FFFFFF,&H004E5AFF,&H96000000,0,0,0,0,100,100,1,0,1,7,4,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const ev = [];
  const push = (layer, s, e, style, text) => {
    if (e - s < 0.02) return;
    ev.push(`Dialogue: ${layer},${assTime(s)},${assTime(e)},${style},,0,0,0,,${text}`);
  };

  // Titre d'accroche (2,4 premières secondes)
  const title = clean(story.title).toUpperCase();
  if (title) {
    push(2, 0, 2.4, 'Title', `{\\pos(${W / 2},${TITLE_Y})\\fscx60\\fscy60\\t(0,140,\\fscx112\\fscy112)\\t(140,260,\\fscx100\\fscy100)\\fad(0,250)\\q0}${title}`);
  }

  const dialogue = storyboard.dialogue;
  dialogue.forEach((d, li) => {
    const color = assColor(SPEAKER_COLORS[d.charId] ?? '#FFD23F');
    const name = (CHARACTERS[d.charId]?.name ?? d.charId).toUpperCase();
    const nextStart = dialogue[li + 1]?.start ?? storyboard.duration;
    const chunks = chunkLine(d.text, d.start, d.end);
    // Nom du personnage pendant toute la réplique
    push(1, d.start, Math.min(d.end + 0.2, nextStart), 'Name', `{\\pos(${W / 2},${SUB_Y - 110})\\c${color}\\fad(80,80)}${name}`);
    chunks.forEach((c, ci) => {
      const chunkEnd = ci < chunks.length - 1 ? chunks[ci + 1].start : Math.min(d.end + 0.2, nextStart);
      c.words.forEach((w, wi) => {
        const s = wi === 0 ? c.start : w.start;
        const e = wi < c.words.length - 1 ? c.words[wi + 1].start : chunkEnd;
        const pop = wi === 0 ? '\\fscx75\\fscy75\\t(0,90,\\fscx108\\fscy108)\\t(90,170,\\fscx100\\fscy100)' : '';
        const text = c.words.map((x, xi) => (xi === wi ? `{\\c${color}}${x.word}{\\c&H00FFFFFF&}` : x.word)).join(' ');
        push(0, s, e, 'Sub', `{\\pos(${W / 2},${SUB_Y})\\q2${pop}}${text}`);
      });
    });
  });

  // Appel à l'abonnement pendant la fin
  const ctaStart = Math.max((dialogue.at(-1)?.end ?? 40) + 0.3, storyboard.duration - 3);
  push(2, ctaStart, storyboard.duration, 'Cta', `{\\pos(${W / 2},${TITLE_Y + 40})\\fscx70\\fscy70\\t(0,160,\\fscx105\\fscy105)\\t(160,280,\\fscx100\\fscy100)\\fad(150,0)}ABONNE-TOI POUR LA SUITE !`);

  return header + ev.join('\n') + '\n';
}
