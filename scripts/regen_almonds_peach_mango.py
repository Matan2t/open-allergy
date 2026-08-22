#!/usr/bin/env python3
"""Regenerate almonds / peach / mango allergen YAML from sesame + extras + found-in JSON."""
from __future__ import annotations

import json
import re
import textwrap
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
SESAME_PATH = ROOT / "data" / "allergens" / "sesame.yaml"
FOUND_IN_PATH = Path(__file__).with_name("_found_in_almonds_peach_mango.json")
EXTRAS_PATH = Path("/tmp/allergen_extras.json")

ALLERGENS = {
    "almonds": {"emoji": "🌰", "comment": "Almond allergy card."},
    "peach": {"emoji": "🍑", "comment": "Peach allergy card."},
    "mango": {"emoji": "🥭", "comment": "Mango allergy card."},
}

HEADER_NOTE = (
    "# `verified: false` means the translation was machine-drafted and awaits review\n"
    "# by a native speaker. See CONTRIBUTING.md for how to verify a translation.\n"
)


def language_order_from_sesame(text: str) -> list[str]:
    """Preserve language key order as written in sesame.yaml (english first, then file order)."""
    body = text.split("\ntranslations:\n", 1)[1]
    return re.findall(r"^  ([a-z][a-z0-9-]+):$", body, re.M)


def load_sesame(path: Path) -> tuple[list[str], dict[str, dict]]:
    text = path.read_text(encoding="utf-8")
    order = language_order_from_sesame(text)
    doc = yaml.safe_load(text)
    translations = doc["translations"]
    missing = [lang for lang in order if lang not in translations]
    if missing:
        raise SystemExit(f"sesame.yaml missing translations for: {missing}")
    return order, translations


def apply_extras(text: str, replacements: list[list[str]]) -> str:
    pairs = sorted(replacements, key=lambda p: len(p[0]), reverse=True)
    for old, new in pairs:
        text = text.replace(old, new)
    return text


def yaml_quote(s: str) -> str:
    """Single-quote a scalar, escaping embedded single quotes."""
    return "'" + s.replace("'", "''") + "'"


def fold_description(text: str, width: int = 100) -> str:
    wrapped = textwrap.fill(
        text,
        width=width,
        break_long_words=False,
        break_on_hyphens=False,
    )
    return "\n".join(f"      {line}" for line in wrapped.splitlines())


def write_allergen_yaml(
    allergen_id: str,
    emoji: str,
    comment: str,
    lang_order: list[str],
    translations: dict[str, dict[str, object]],
) -> str:
    lines: list[str] = [
        f"# {comment}",
        HEADER_NOTE.rstrip("\n"),
        f"id: {allergen_id}",
        f"emoji: {emoji}",
        "translations:",
    ]
    for lang in lang_order:
        t = translations[lang]
        verified = "true" if t["verified"] else "false"
        lines.append(f"  {lang}:")
        lines.append(f"    verified: {verified}")
        lines.append(f"    allergen: {t['allergen']}")
        lines.append(f"    statement: {t['statement']}")
        lines.append("    description: >-")
        lines.append(fold_description(str(t["description"])))
        lines.append(f"    foundInLabel: {yaml_quote(str(t['foundInLabel']))}")
        lines.append("    foundIn:")
        for item in t["foundIn"]:  # type: ignore[union-attr]
            lines.append(f"    - {item}")
        lines.append(f"    question: {t['question']}")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    extras_doc = json.loads(EXTRAS_PATH.read_text(encoding="utf-8"))
    extras = extras_doc["EXTRAS"]
    names = extras_doc["NAMES"]
    found_in = json.loads(FOUND_IN_PATH.read_text(encoding="utf-8"))

    lang_order, sesame = load_sesame(SESAME_PATH)

    for allergen_id, meta in ALLERGENS.items():
        translations: dict[str, dict[str, object]] = {}
        for lang in lang_order:
            src = sesame[lang]
            reps = extras[lang][allergen_id]
            desc = src["description"]
            if isinstance(desc, str):
                desc = " ".join(desc.split())
            fields = {
                "verified": lang == "english",
                "allergen": names[allergen_id][lang],
                "statement": apply_extras(str(src["statement"]), reps),
                "description": apply_extras(str(desc), reps),
                "foundInLabel": apply_extras(str(src["foundInLabel"]), reps),
                "foundIn": found_in[allergen_id][lang],
                "question": apply_extras(str(src["question"]), reps),
            }
            if len(fields["foundIn"]) != 10:  # type: ignore[arg-type]
                raise SystemExit(
                    f"{allergen_id}/{lang}: expected 10 foundIn items, "
                    f"got {len(fields['foundIn'])}"  # type: ignore[arg-type]
                )
            translations[lang] = fields

        out_path = ROOT / "data" / "allergens" / f"{allergen_id}.yaml"
        out_path.write_text(
            write_allergen_yaml(
                allergen_id, meta["emoji"], meta["comment"], lang_order, translations
            ),
            encoding="utf-8",
        )
        print(f"Wrote {out_path.relative_to(ROOT)} ({len(lang_order)} languages)")


if __name__ == "__main__":
    main()
