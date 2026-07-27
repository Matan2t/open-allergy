# Project Log

## 2026-07-27 — Initial build (end to end)

Built the entire Open Allergy Cards platform from an empty directory in one session.

### Product decisions

- **Goal:** free, open-source allergy translation cards (competitors charge $90+ per card).
  Revenue only from optional physical plastic card orders.
- **Architecture:** mostly-static site. The "database" is versioned YAML files in this repo so
  the community can add/fix translations via pull requests. Orders live in Stripe (its
  dashboard is the fulfillment queue) — no database server anywhere.
- **Stack:** Astro 7 static site + React islands, deployed to Cloudflare Pages (free tier),
  with a single Cloudflare Pages Function for Stripe checkout.
- **Fulfillment (MVP):** manual — paid Stripe sessions carry the card configuration as
  metadata; the operator prints and ships plastic cards in batches.

### What was built

| Area | Details |
| --- | --- |
| Card data | 14 EU allergens × 12 languages = 168 card translations in `data/allergens/*.yaml`. English verified; other 154 machine-drafted and marked `verified: false` pending native-speaker review. |
| Languages | `data/languages.yaml`: en, es, fr, de, it, pt, el, tr, he, ar, ja, zh with per-language UI strings and text direction (Hebrew/Arabic are RTL). |
| Schema | `data/schema/allergen.schema.json` (JSON Schema draft-07) enforced by `scripts/validate-data.mjs` (`pnpm validate`). |
| Card renderer | `src/components/Card.tsx` — exact CR80 size (85.6 × 54 mm) using mm CSS units so browser printing is true to scale; full RTL support; Noto font stack for Greek/Hebrew/Arabic/CJK. |
| Card builder | `src/components/CardBuilder.tsx` — live double-sided preview (chosen language + English back), optional name, shareable URLs, and free outputs: print/save-as-PDF at card size, A4 sheet with 4 copies and cut/fold guides, high-resolution PNG (via html-to-image at 4× density). |
| Pages | Home (allergen grid, language chips, how-it-works), 168 static card pages (`/cards/[allergen]/[lang]`), `/order`, `/contribute`. |
| Payments | `functions/api/checkout.ts` — dependency-free Stripe Checkout Session creation with card config as metadata and shipping address collection. Site degrades gracefully when Stripe env vars are absent. |
| CI | `.github/workflows/ci.yml` — schema validation + full build on every push/PR. |
| Licensing | Code MIT (`LICENSE`); card content CC BY-SA 4.0 (`data/LICENSE.md`). |
| Docs | `README.md` (setup, deploy, env vars), `CONTRIBUTING.md` (non-coder translation guide). |

### Verification performed

- `pnpm validate`: 14 allergens, 12 languages, 168 translations — pass.
- `pnpm build`: 171 static pages — pass.
- Served `dist/` and smoke-tested home, Hebrew card page (confirmed `dir="rtl"` in HTML),
  Arabic card content, order, and contribute pages — all 200.
- Spot-checked translation quality (Turkish/Hebrew peanuts, Spanish gluten, Greek milk).

### Notes

- Translations for the 13 non-milk allergens were drafted by four parallel agents from the
  hand-written `milk.yaml` gold standard; all are flagged unverified until native review.
- Initial git commit created. GitHub connection attempt timed out — see REQUIRED_ACTIONS.md.
