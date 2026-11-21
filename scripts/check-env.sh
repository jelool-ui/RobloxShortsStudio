#!/usr/bin/env bash
# Vérifie que tous les outils nécessaires au pipeline sont présents.
# Utilisé localement et dans GitHub Actions. Sort en erreur si un outil manque.
set -u
fail=0
ok()   { printf '  [OK]  %-12s %s\n' "$1" "$2"; }
ko()   { printf '  [KO]  %-12s %s\n' "$1" "$2"; fail=1; }

echo "== Vérification de l'environnement RobloxShortsStudio =="

command -v node    >/dev/null && ok node    "$(node -v)"                         || ko node    "absent (Node.js >= 20 requis)"
command -v npm     >/dev/null && ok npm     "$(npm -v)"                          || ko npm     "absent"
command -v python3 >/dev/null && ok python3 "$(python3 --version 2>&1)"          || ko python3 "absent (Python >= 3.9 requis)"
command -v ffmpeg  >/dev/null && ok ffmpeg  "$(ffmpeg -version | head -1 | cut -d' ' -f3)" || ko ffmpeg "absent"
command -v ffprobe >/dev/null && ok ffprobe "présent"                            || ko ffprobe "absent"

if node -e "require('playwright')" 2>/dev/null; then
  ok playwright "$(node -e "console.log(require('playwright/package.json').version)")"
else
  ko playwright "module introuvable (npm i playwright && npx playwright install chromium)"
fi

PIPER="${PIPER_BIN:-piper}"
if command -v "$PIPER" >/dev/null; then ok piper "présent ($PIPER)"; else ko piper "absent (pip install piper-tts)"; fi

echo
if [ "$fail" -ne 0 ]; then echo "Environnement INCOMPLET."; exit 1; fi
echo "Environnement complet."
