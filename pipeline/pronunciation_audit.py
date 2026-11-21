"""Audit de prononciation : transcrit en phonèmes (espeak, via Piper) chaque réplique possible
et signale celles où un mot risque d'être épelé ou lu dans une autre langue.

Usage : python pronunciation_audit.py lignes.json modele1.onnx [modele2.onnx ...]
Sortie : JSON [{"model", "text", "phonemes", "reason"}] (liste vide = tout va bien)
"""
import json
import sys

from piper import PiperVoice

# Motifs suspects dans les phonèmes (accents toniques retirés)
SUSPECTS = {
    "iɡʁɛk": "lettre « y » épelée (i grec)",
    "(": "changement de langue (mot lu en anglais ?)",
}


def main() -> None:
    with open(sys.argv[1], encoding="utf-8") as f:
        lines = json.load(f)
    problems = []
    for model in sys.argv[2:]:
        voice = PiperVoice.load(model)
        for text in lines:
            ph = "".join("".join(p) for p in voice.phonemize(text))
            flat = ph.replace("ˈ", "").replace("ˌ", "")
            for pattern, reason in SUSPECTS.items():
                if pattern in flat:
                    problems.append({"model": model, "text": text, "phonemes": ph, "reason": reason})
    json.dump(problems, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
