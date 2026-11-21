// Format d'écriture compact des histoires (comme un script de théâtre), converti en scénarios-types.
//
// === identifiant | Libellé dans l'interface | humeur (happy | mystery, facultatif)
// titres: Titre 1 / Titre 2                 ({A} {B} {C} = prénoms)
// # zone A:marque B:marque C:marque          changement de décor (hallway | classroom | yard)
// C.scared!scared mv:C=run>center r:A=surprise,B=surprise punch : Texte de la réplique || Variante
// ~1.2 sfx:buzz r:C=surprise cam:closeup:C punch     étape muette de 1,2 s
//
// Réplique : RÔLE[.animation][!expression] [options…] : texte [|| variante…]
// Options : mv:R=walk>marque (plusieurs possibles) · r:R=anim,R=anim · to:R · cam:type[:R]
//           punch · sfx:nom · opt · v:groupe · indep:mot,mot
const ROLES = new Set(['A', 'B', 'C']);

function parseOpts(tokens, step, ctx) {
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok === 'punch') step.punch = true;
    else if (tok === 'opt') step.opt = true;
    else if (tok.startsWith('mv:')) {
      const m = tok.slice(3).match(/^([ABC])=(walk|run)>(\w+)$/);
      if (!m) throw new Error(`${ctx} : déplacement invalide « ${tok} »`);
      step.mv = { ...(step.mv || {}), [m[1]]: [m[2], m[3]] };
    } else if (tok.startsWith('r:')) {
      step.r = {};
      for (const part of tok.slice(2).split(',')) {
        const [role, anim] = part.split('=');
        if (!ROLES.has(role) || !anim) throw new Error(`${ctx} : réaction invalide « ${tok} »`);
        step.r[role] = anim;
      }
    } else if (tok.startsWith('to:')) step.to = tok.slice(3);
    else if (tok.startsWith('cam:')) step.cam = tok.slice(4);
    else if (tok.startsWith('sfx:')) step.sfx = tok.slice(4);
    else if (tok.startsWith('v:')) step.v = tok.slice(2);
    else if (tok.startsWith('indep:')) step.indep = tok.slice(6).split(',');
    else throw new Error(`${ctx} : option inconnue « ${tok} »`);
  }
}

export function parseStories(text) {
  const out = [];
  let cur = null;
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    const ctx = `ligne ${i + 1}`;
    if (!line || line.startsWith('//')) return;
    if (line.startsWith('===')) {
      const [id, label, mood] = line.slice(3).split('|').map((s) => s.trim());
      if (!/^[a-z0-9-]+$/.test(id || '')) throw new Error(`${ctx} : identifiant invalide « ${id} »`);
      cur = { id, label: label || id, ...(mood ? { mood } : {}), titles: [], zones: [], steps: [] };
      out.push(cur);
      return;
    }
    if (!cur) throw new Error(`${ctx} : texte hors d'une histoire`);
    if (line.startsWith('titres:')) {
      cur.titles = line.slice(7).split(' / ').map((s) => s.trim()).filter(Boolean);
      return;
    }
    if (line.startsWith('#')) {
      const [zone, ...places] = line.slice(1).trim().split(/\s+/);
      const place = {};
      for (const p of places) {
        const [r, mark] = p.split(':');
        if (!ROLES.has(r) || !mark) throw new Error(`${ctx} : placement invalide « ${p} »`);
        place[r] = mark;
      }
      if (!cur.zones.includes(zone)) cur.zones.push(zone);
      cur.steps.push({ zone, place });
      return;
    }
    if (line.startsWith('~')) {
      const [dur, ...opts] = line.slice(1).trim().split(/\s+/);
      const step = { hold: Number(dur) };
      if (!(step.hold > 0)) throw new Error(`${ctx} : durée invalide`);
      parseOpts(opts, step, ctx);
      cur.steps.push(step);
      return;
    }
    const sep = line.indexOf(' : ');
    if (sep < 0) throw new Error(`${ctx} : « : » manquant dans « ${line} »`);
    const [head, ...opts] = line.slice(0, sep).trim().split(/\s+/);
    const m = head.match(/^([ABC])(?:\.(\w+))?(?:!(\w+))?$/);
    if (!m) throw new Error(`${ctx} : rôle invalide « ${head} »`);
    const step = { s: m[1], ...(m[2] ? { a: m[2] } : {}), ...(m[3] ? { e: m[3] } : {}) };
    parseOpts(opts, step, ctx);
    step.l = line.slice(sep + 3).split('||').map((s) => s.trim()).filter(Boolean);
    cur.steps.push(step);
  });
  for (const t of out) {
    if (!t.titles.length) throw new Error(`Histoire ${t.id} : titres manquants`);
    if (!t.steps[0]?.zone) throw new Error(`Histoire ${t.id} : doit commencer par un décor (#)`);
  }
  return out;
}
