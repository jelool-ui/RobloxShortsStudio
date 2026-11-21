"""Synthèse vocale par lots avec Piper (chaque voix n'est chargée qu'une fois).

Usage : python tts_piper.py jobs.json
jobs.json : [{"id", "text", "model", "speaker", "length_scale", "noise_scale", "out"}]
Affiche sur stdout un JSON : [{"id", "out", "sample_rate", "duration"}]
"""
import json
import sys
import wave

from piper import PiperVoice, SynthesisConfig


def main() -> None:
    with open(sys.argv[1], encoding="utf-8") as f:
        jobs = json.load(f)
    voices = {}
    results = []
    for job in jobs:
        model = job["model"]
        if model not in voices:
            voices[model] = PiperVoice.load(model)
        voice = voices[model]
        speaker = job.get("speaker")
        speaker_id = None
        if speaker is not None:
            id_map = voice.config.speaker_id_map or {}
            speaker_id = id_map.get(speaker, speaker if isinstance(speaker, int) else None)
            if speaker_id is None:
                raise SystemExit(f"Locuteur inconnu {speaker!r} pour {model}")
        cfg = SynthesisConfig(
            speaker_id=speaker_id,
            length_scale=job.get("length_scale"),
            noise_scale=job.get("noise_scale"),
        )
        with wave.open(job["out"], "wb") as wav:
            voice.synthesize_wav(job["text"], wav, syn_config=cfg)
        with wave.open(job["out"], "rb") as wav:
            rate = wav.getframerate()
            duration = wav.getnframes() / rate
        results.append({"id": job["id"], "out": job["out"], "sample_rate": rate, "duration": duration})
    json.dump(results, sys.stdout)


if __name__ == "__main__":
    main()
