import React, { useState } from 'react';

// Squelette du tableau de bord mobile (phase 2).
// Les écrans seront branchés au pipeline réel en phase 8.
const TABS = [
  { id: 'generate', label: 'Générer', icon: '🎬' },
  { id: 'library', label: 'Épisodes', icon: '📚' },
  { id: 'history', label: 'Historique', icon: '🕘' },
];

export default function App() {
  const [tab, setTab] = useState('generate');

  return (
    <div className="app">
      <header className="top">
        <h1>Shorts Studio</h1>
        <span className="badge">v0.1</span>
      </header>

      <main className="content">
        {tab === 'generate' && (
          <section>
            <button className="primary" disabled>⚡ Génération automatique</button>
            <p className="hint">Disponible en phase 8 (lancement du rendu GitHub Actions).</p>
          </section>
        )}
        {tab === 'library' && <p className="hint">Aucun épisode pour l'instant.</p>}
        {tab === 'history' && <p className="hint">Aucune génération lancée.</p>}
      </main>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
