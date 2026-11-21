import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient, loadConfig, saveConfig } from './github.js';
import { ZONES, STORIES, ROLES, CAST, DEFAULTS, labelZone, labelStory } from './catalog.js';

const TABS = [
  { id: 'generate', label: 'Générer', icon: '🎬' },
  { id: 'library', label: 'Épisodes', icon: '📚' },
  { id: 'history', label: 'Historique', icon: '🕘' },
  { id: 'settings', label: 'Réglages', icon: '⚙️' },
];
const EST_MINUTES = { fast: 12, high: 28 };

const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const minutesSince = (d) => Math.max(0, (Date.now() - new Date(d).getTime()) / 60000);

function Avatar({ c, size = 44 }) {
  // Petit personnage cubique en CSS (tête + corps aux couleurs du personnage)
  return (
    <span className="avatar" style={{ width: size, height: size * 1.3 }} aria-hidden="true">
      <span className="av-hair" style={{ background: c.hair }} />
      <span className="av-head" style={{ background: c.skin }}><i /><i /></span>
      <span className="av-body" style={{ background: c.shirt }} />
    </span>
  );
}

function Chips({ items, value, onChange, label }) {
  return (
    <div className="chips" role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} role="radio" aria-checked={value === it.id} className={value === it.id ? 'chip on' : 'chip'} onClick={() => onChange(it.id)}>
          {it.icon && <span>{it.icon}</span>}{it.label}
        </button>
      ))}
    </div>
  );
}

function GenerateTab({ client, onLaunched, notify, goSettings }) {
  const [opts, setOpts] = useState(DEFAULTS);
  const [custom, setCustom] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setOpts((o) => ({ ...o, [k]: v }));

  const setRole = (roleIdx, charId) => {
    setOpts((o) => {
      const cast = [...o.cast];
      const other = cast.indexOf(charId);
      [cast[roleIdx], cast[other]] = [charId, cast[roleIdx]]; // échange : chaque personnage garde un seul rôle
      return { ...o, cast };
    });
  };

  async function launch(useCustom) {
    if (!client?.token) { notify('Ajoutez d\'abord votre jeton GitHub dans Réglages', 'error'); goSettings(); return; }
    const o = useCustom ? opts : DEFAULTS;
    if (o.seed && !/^\d{1,9}$/.test(o.seed)) { notify('La graine doit être un nombre (9 chiffres max.)', 'error'); return; }
    setBusy(true);
    try {
      const requestId = await client.api.dispatch({ zone: o.zone, template: o.template, cast: o.cast.join(','), quality: o.quality, seed: o.seed });
      notify('Génération lancée ! Suivez-la dans Historique (≈ ' + EST_MINUTES[o.quality] + ' min).', 'ok');
      onLaunched(requestId);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const story = STORIES.find((s) => s.id === opts.template);
  const zoneHint = story?.zones && opts.zone !== 'auto' && !story.zones.includes(opts.zone)
    ? `« ${story.label} » sera adaptée à ce décor.` : null;

  return (
    <section className="stack">
      <button className="primary big" disabled={busy} onClick={() => launch(false)}>
        {busy ? 'Lancement…' : '⚡ Génération automatique'}
      </button>
      <p className="hint center">Histoire, décor et graine au hasard · 45 s · vertical · ≈ {EST_MINUTES.fast} min</p>

      <button className="ghost" aria-expanded={custom} onClick={() => setCustom((c) => !c)}>
        {custom ? '▾' : '▸'} Personnaliser l'épisode
      </button>

      {custom && (
        <div className="card stack">
          <h3>Décor</h3>
          <Chips items={ZONES} value={opts.zone} onChange={(v) => set('zone', v)} label="Décor" />

          <h3>Histoire</h3>
          <select value={opts.template} onChange={(e) => set('template', e.target.value)} aria-label="Histoire">
            {STORIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          {zoneHint && <p className="hint">{zoneHint}</p>}

          <h3>Personnages</h3>
          <div className="roles">
            {ROLES.map((r, i) => (
              <div key={r.id} className="role">
                <span className="role-label">{r.label}</span>
                <div className="role-pick">
                  {CAST.map((c) => (
                    <button key={c.id} className={opts.cast[i] === c.id ? 'pick on' : 'pick'} aria-pressed={opts.cast[i] === c.id} onClick={() => setRole(i, c.id)} aria-label={`${c.name} : ${r.label}`}>
                      <Avatar c={c} size={30} /><span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h3>Qualité</h3>
          <Chips items={[{ id: 'fast', label: `Rapide (≈ ${EST_MINUTES.fast} min)` }, { id: 'high', label: `Haute (≈ ${EST_MINUTES.high} min)` }]} value={opts.quality} onChange={(v) => set('quality', v)} label="Qualité" />

          <h3>Graine <small>(facultatif)</small></h3>
          <input inputMode="numeric" placeholder="Vide = au hasard · même graine = même épisode" value={opts.seed} onChange={(e) => set('seed', e.target.value.replace(/\D/g, '').slice(0, 9))} aria-label="Graine" />

          <button className="primary" disabled={busy} onClick={() => launch(true)}>{busy ? 'Lancement…' : '🎬 Générer cet épisode'}</button>
        </div>
      )}

      <div className="cast-strip" aria-label="La bande">
        {CAST.map((c) => <div key={c.id} className="cast-item"><Avatar c={c} /><span>{c.name}</span></div>)}
      </div>
    </section>
  );
}

function EpisodeSheet({ ep, onClose, notify }) {
  const copy = async (text, what) => {
    try { await navigator.clipboard.writeText(text); notify(`${what} copié`, 'ok'); } catch { notify('Copie impossible sur cet appareil', 'error'); }
  };
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={ep.title} onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Fermer">✕</button>
        <h2>{ep.title}</h2>
        <video className="player" src={ep.mp4} poster={ep.thumbnail ?? undefined} controls playsInline preload="none" />
        <a className="primary as-btn" href={ep.mp4} download={`${ep.tag}.mp4`}>⬇️ Exporter le MP4 ({ep.sizeMB} Mo)</a>
        <div className="row">
          {ep.youtubeTitle && <button className="secondary" onClick={() => copy(ep.youtubeTitle, 'Titre')}>Copier le titre</button>}
          {ep.youtubeDescription && <button className="secondary" onClick={() => copy(ep.youtubeDescription, 'Description')}>Copier la description</button>}
        </div>
        <p className="hint">{fmtDate(ep.date)} · <a href={ep.url} target="_blank" rel="noreferrer">voir sur GitHub</a></p>
      </div>
    </div>
  );
}

function LibraryTab({ episodes, loading, error, onRefresh, notify }) {
  const [open, setOpen] = useState(null);
  if (error) return <Empty icon="⚠️" text={error} action={<button className="secondary" onClick={onRefresh}>Réessayer</button>} />;
  if (loading && !episodes) return <Empty icon="⏳" text="Chargement des épisodes…" />;
  if (!episodes?.length) return <Empty icon="📭" text="Aucun épisode pour l'instant. Lancez une génération !" />;
  return (
    <section>
      <div className="grid">
        {episodes.map((ep) => (
          <button key={ep.id} className="ep" onClick={() => setOpen(ep)}>
            {ep.thumbnail ? <img src={ep.thumbnail} alt="" loading="lazy" /> : <div className="ep-ph">🎬</div>}
            <span className="ep-title">{ep.title}</span>
            <span className="ep-date">{fmtDate(ep.date)}</span>
          </button>
        ))}
      </div>
      {open && <EpisodeSheet ep={open} onClose={() => setOpen(null)} notify={notify} />}
    </section>
  );
}

function RunItem({ run, client, episode, onOpenEpisode }) {
  const [errors, setErrors] = useState(null);
  const running = run.status !== 'completed';
  const elapsed = minutesSince(run.startedAt);
  const pct = Math.min(95, (elapsed / EST_MINUTES.fast) * 100);
  const failed = run.status === 'completed' && run.conclusion !== 'success';
  useEffect(() => {
    if (failed && run.conclusion === 'failure' && client?.token) client.api.runErrors(run.id).then(setErrors).catch(() => setErrors([]));
  }, [failed, run.id, run.conclusion, client]);

  const badge = running
    ? { cls: 'run', text: run.status === 'queued' ? 'En file d\'attente' : 'En cours' }
    : run.conclusion === 'success' ? { cls: 'ok', text: 'Réussi' } : run.conclusion === 'cancelled' ? { cls: 'muted', text: 'Annulé' } : { cls: 'ko', text: 'Échec' };

  return (
    <li className="run-item">
      <div className="run-head">
        <span className={`badge ${badge.cls}`}>{badge.text}</span>
        <span className="run-title">{labelStory(run.template)} · {labelZone(run.zone)}</span>
      </div>
      <div className="hint">#{run.number} · {fmtDate(run.createdAt)}{running && ` · ${Math.floor(elapsed)} min`}</div>
      {running && <div className="progress" aria-label="Progression estimée"><span style={{ width: `${pct}%` }} /></div>}
      {failed && errors?.length > 0 && <ul className="errors">{errors.slice(0, 3).map((e) => <li key={e}>{e}</li>)}</ul>}
      <div className="row">
        {episode && <button className="secondary" onClick={() => onOpenEpisode(episode)}>▶️ Voir l'épisode</button>}
        <a className="link" href={run.url} target="_blank" rel="noreferrer">Détails sur GitHub</a>
      </div>
    </li>
  );
}

function HistoryTab({ runs, episodes, loading, error, client, onRefresh, notify }) {
  const [open, setOpen] = useState(null);
  if (error) return <Empty icon="⚠️" text={error} action={<button className="secondary" onClick={onRefresh}>Réessayer</button>} />;
  if (loading && !runs) return <Empty icon="⏳" text="Chargement de l'historique…" />;
  if (!runs?.length) return <Empty icon="🕘" text="Aucune génération lancée." />;
  const byRun = new Map((episodes || []).filter((e) => e.runUrl).map((e) => [e.runUrl.split('/').pop(), e]));
  return (
    <section>
      <ul className="runs">
        {runs.map((r) => <RunItem key={r.id} run={r} client={client} episode={byRun.get(String(r.id))} onOpenEpisode={setOpen} />)}
      </ul>
      {open && <EpisodeSheet ep={open} onClose={() => setOpen(null)} notify={notify} />}
    </section>
  );
}

function SettingsTab({ config, onSave, notify }) {
  const [token, setToken] = useState(config.token);
  const [repo, setRepo] = useState(config.repo);
  const [status, setStatus] = useState(null);
  async function test() {
    setStatus('…');
    try {
      const info = await createClient({ token, repo }).check();
      setStatus(`✅ Connecté à ${info.name}${info.private ? ' (privé)' : ''}`);
      onSave({ token, repo });
      notify('Réglages enregistrés', 'ok');
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    }
  }
  return (
    <section className="stack">
      <div className="card stack">
        <h3>Connexion à GitHub</h3>
        <label>Dépôt<input value={repo} onChange={(e) => setRepo(e.target.value.trim())} placeholder="propriétaire/nom" autoCapitalize="off" autoCorrect="off" /></label>
        <label>Jeton personnel<input type="password" value={token} onChange={(e) => setToken(e.target.value.trim())} placeholder="github_pat_…" autoCapitalize="off" autoCorrect="off" /></label>
        <button className="primary" onClick={test}>Tester et enregistrer</button>
        {status && <p className="hint" role="status">{status}</p>}
        <button className="ghost danger" onClick={() => { setToken(''); onSave({ token: '' }); notify('Jeton effacé de cet appareil', 'ok'); }}>Effacer le jeton de cet appareil</button>
      </div>
      <div className="card">
        <h3>Créer le jeton (une seule fois)</h3>
        <ol className="steps">
          <li>GitHub → photo de profil → <b>Settings</b> → <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b>.</li>
          <li><b>Repository access</b> : <i>Only select repositories</i> → ce dépôt uniquement.</li>
          <li><b>Permissions</b> → <b>Actions</b> : <i>Read and write</i>. Rien d'autre.</li>
          <li>Copiez le jeton et collez-le ci-dessus.</li>
        </ol>
        <p className="hint">Le jeton reste uniquement dans ce navigateur. Il ne permet que de lancer et lire les générations de ce dépôt.</p>
      </div>
    </section>
  );
}

function Empty({ icon, text, action }) {
  return <div className="empty"><div className="empty-icon">{icon}</div><p>{text}</p>{action}</div>;
}

export default function App() {
  const [tab, setTab] = useState('generate');
  const [config, setConfig] = useState(loadConfig);
  const [runs, setRuns] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const client = useMemo(() => {
    try { return config.repo ? { api: createClient(config), token: config.token } : null; } catch { return null; }
  }, [config]);

  const notify = useCallback((text, kind = 'ok') => {
    setToast({ text, kind, at: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const refresh = useCallback(async () => {
    if (!client) { setError('Indiquez le dépôt et votre jeton dans Réglages.'); return; }
    setLoading(true);
    try {
      const [eps, rs] = await Promise.all([client.api.episodes(), client.token ? client.api.runs() : Promise.resolve([])]);
      setEpisodes(eps);
      setRuns(rs);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { refresh(); }, [refresh]);

  // Rafraîchissement automatique tant qu'une génération est en cours
  const anyRunning = runs?.some((r) => r.status !== 'completed');
  useEffect(() => {
    if (!anyRunning) return undefined;
    const t = setInterval(refresh, 20000);
    return () => clearInterval(t);
  }, [anyRunning, refresh]);

  const onLaunched = () => {
    setTab('history');
    setTimeout(refresh, 4000); // laisser GitHub créer l'exécution
  };
  const onSave = (patch) => {
    saveConfig(patch);
    setConfig((c) => ({ ...c, ...patch }));
  };

  return (
    <div className="app">
      <header className="top">
        <h1>Shorts Studio</h1>
        <button className="icon-btn" onClick={refresh} aria-label="Actualiser" disabled={loading}>{loading ? '⏳' : '🔄'}</button>
      </header>
      <main className="content">
        {tab === 'generate' && <GenerateTab client={client} onLaunched={onLaunched} notify={notify} goSettings={() => setTab('settings')} />}
        {tab === 'library' && <LibraryTab episodes={episodes} loading={loading} error={error} onRefresh={refresh} notify={notify} />}
        {tab === 'history' && <HistoryTab runs={runs} episodes={episodes} loading={loading} error={error} client={client} onRefresh={refresh} notify={notify} />}
        {tab === 'settings' && <SettingsTab config={config} onSave={onSave} notify={notify} />}
      </main>
      {toast && <div className={`toast ${toast.kind}`} role="status">{toast.text}</div>}
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
