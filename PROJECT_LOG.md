# Project Log

## 2026-07-31 — Theme A Signal Red redesign + language expansion

- Redesigned site and cards to **Theme A — Signal Red** (black header chrome, white paper,
  vivid alert red for statements/questions, kitchen-readable CR80 cards with SVG prohibition mark).
- Card builder always shows **double-sided** cards: chosen language on the front, English on the
  back (including when English is selected). Print, A4 sheet, and PNG all export both sides.
- Expanded from 12 to **49 languages** (Equal Eats catalog parity), including Korean, Thai,
  Hindi, Vietnamese, Dutch, Polish, Russian, Portuguese (Brazil), Chinese Traditional/HK, etc.
- Language keys use **full readable names** (`hebrew`, `turkish`, `portuguese-brazil`) instead of
  short ISO codes; BCP-47 tags live in `locale` for HTML `lang` attributes.
- Seed pack: `data/seed/new-language-packs.json` + `scripts/apply-language-seed.mjs`.
- Validation: 14 allergens × 49 languages = **686 translations** (14 verified English, 672 awaiting
  native review). Production build: **689 pages**.

## 2026-07-27 — Initial build (end to end)

Built the entire Open Allergy Cards platform from an empty directory in one session.

### Product decisions

- **Goal:** free, open-source allergy translation cards (competitors charge $90+ per card).
  Revenue only from optional physical plastic card orders.
- **Architecture:** mostly-static site. The "database" is versioned YAML files in this repo so
  the community can add/fix translations via pull requests. Orders live in Stripe (its
  dashboard is the fulfillment queue) — no database server anywhere.
- **Stack:** Astro 7 static site + React islands, deployed to Cloudflare Pages / Workers (free
  tier), with a Worker entry for Stripe checkout.
- **Fulfillment (MVP):** manual — paid Stripe sessions carry the card configuration as
  metadata; the operator prints and ships plastic cards in batches.

### What was built

| Area | Details |
| --- | --- |
| Card data | 14 EU allergens × languages in `data/allergens/*.yaml`. English verified; others machine-drafted and marked `verified: false`. |
| Languages | `data/languages.yaml` with per-language UI strings and text direction (Hebrew/Arabic are RTL). |
| Schema | `data/schema/allergen.schema.json` enforced by `scripts/validate-data.mjs` (`pnpm validate`). |
| Card renderer | `src/components/Card.tsx` — exact CR80 size (85.6 × 54 mm), Theme A Signal Red. |
| Card builder | `src/components/CardBuilder.tsx` — always double-sided preview + print/PNG/A4. |
| Pages | Home, `/cards/[allergen]/[lang]`, `/order`, `/contribute`. |
| Payments | `worker/checkout.ts` via `wrangler.jsonc` static-assets Worker. |
| CI | `.github/workflows/ci.yml` — schema validation + full build on every push/PR. |

### Notes

- Initial translations drafted by parallel agents from a hand-written `milk.yaml` gold standard.
- Language expansion (2026-07-31) used a JSON seed pack applied by script.
