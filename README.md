# Open Allergy Cards

**Free, open-source allergy translation cards - print at home, in any language, forever free.**

Commercial services charge up to $90 for a single allergy translation card. This project gives
everyone the same thing for free: pick your allergy, pick a language, and print a double-sided
credit-card-sized card (English on one side, your chosen language on the other) that you can hand
to restaurant staff anywhere in the world.

- **Free forever.** Download, print, and share cards at no cost. No account, no email, no tracking.
- **Open source.** All card text and translations live as YAML files in this repo. Anyone can add
  a language or fix a translation with a pull request.
- **Community-verified translations.** Machine-drafted translations are marked `verified: false`
  until a native speaker reviews them. Every card links directly to its source file on GitHub.
- **Optional physical cards.** If you want a durable plastic card mailed to you, you can order one
  for a small fee that covers printing, shipping, and keeps the project running. This is entirely
  optional - the free downloads are identical in content.

## Content

- **17 allergens** including the EU mandatory list plus almonds, peach, and mango: milk, eggs,
  peanuts, tree nuts, almonds, peach, mango, gluten/cereals, fish, crustaceans, molluscs, soybeans,
  sesame, celery, mustard, sulphites, lupin.
- **49 languages** (including Arabic, Bengali, Chinese Simplified/Traditional/HK, Hindi, Korean,
  Thai, Vietnamese, and many European languages) - with right-to-left support for Hebrew and
  Arabic. New translations are AI-drafted and marked `verified: false` until a native speaker
  reviews them.

Want another allergen or language? See [CONTRIBUTING.md](CONTRIBUTING.md) - adding one is just a
YAML edit.

## Development

Requirements: Node.js 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # start dev server at http://localhost:4321
pnpm validate   # validate all card data against the schema
pnpm build      # production build to dist/
```

### Project layout

```
data/
  allergens/*.yaml     # one file per allergen, translations keyed by full language name
  languages.yaml       # supported languages (name, direction, per-language UI strings)
  schema/              # JSON Schema used by `pnpm validate` and CI
src/
  components/          # Card renderer + interactive card builder (React)
  pages/               # Astro pages (home, /cards/[allergen]/[lang], /order, /contribute)
worker/                # Cloudflare Worker (serves /api/checkout for Stripe orders)
scripts/               # data validation
```

## Deployment

The site deploys to [Cloudflare Workers](https://workers.cloudflare.com) (free tier) as a
static-assets Worker - the Astro build in `dist/` is served as assets and the Worker in
`worker/` handles only `/api/*`:

1. Create a git-connected Workers project pointing at this repo
   (Workers & Pages → Create → import the repository).
2. Build command: `pnpm build` - deploy command: `npx wrangler deploy`
   (configuration is read from `wrangler.jsonc`).

### Enabling physical card orders (optional)

The site works fully without payment configuration; the order page shows "coming soon" until
Stripe is configured. To enable orders, set these variables on the Workers project under
Settings → Variables and Secrets (`STRIPE_SECRET_KEY` should be a Secret):

| Variable            | Description                                        |
| ------------------- | -------------------------------------------------- |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `CARD_PRICE_CENTS`  | Price per plastic card in cents (e.g. `900`)       |
| `SITE_URL`          | Public URL of the deployed site                    |

Paid orders appear in the Stripe Dashboard with the allergen, language, and personalization as
session metadata - that list is the fulfillment queue.

## Licenses

- Code: [MIT](LICENSE)
- Card content and translations (`data/`): [CC BY-SA 4.0](data/LICENSE.md)

## Medical disclaimer

These cards are a communication aid, not medical advice. Translations marked as unverified have
not yet been reviewed by a native speaker. Always carry prescribed emergency medication and
consult a medical professional about managing your allergy.
