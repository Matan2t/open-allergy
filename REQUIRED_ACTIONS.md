# Required Actions

Owner checklist to take the project from "built locally" to "live and earning".
Ordered by priority; the first three are enough to launch the free product.

## 1. Publish to GitHub (required for the open-source loop) - DONE 2026-07-27

- [x] Create a public GitHub repository: <https://github.com/Matan2t/open-allergy>.
- [x] Push this repo (`main` is the default branch; stale `master` deleted).
- [x] Update `GITHUB_URL` in [`src/lib/site.ts`](src/lib/site.ts) to the real repo URL -
      every "help review this translation" / "edit on GitHub" link on the site uses it.
- [x] Issue templates for "translation fix" and "new language or allergen" live in
      [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/).

## 2. Domain and deploy - DONE 2026-10-30

- [x] Register `openallergy.org` at Cloudflare Registrar (about $8 the first year, then about $11).
      Confirm it is still free at checkout. `openallergy.com` is already taken.
- [x] After the domain is Active, add it as a custom domain on the **open-allergy** Worker
      (Workers & Pages → open-allergy → Settings → Domains & Routes → Custom domain).
- [x] Cloudflare project connected to GitHub (`open-allergy`). Settings:
      **Build command:** `pnpm build` · **Deploy command:** `pnpm run deploy`
      (uses committed `wrangler.jsonc` - do **not** use bare `npx wrangler deploy`, which
      tries to auto-reconfigure Astro and fails in this pnpm workspace).
- [x] Public URL in [`astro.config.mjs`](astro.config.mjs) and `CARD_FOOTER_BRAND` in
      [`src/lib/site.ts`](src/lib/site.ts) is `openallergy.org`. Canonicals, the sitemap, and
      Open Graph tags use that host. Until DNS points at Cloudflare, `open-allergy.pages.dev`
      can still serve a build, but search engines will be told the canonical site is
      `https://openallergy.org`.

## 3. Verify translations (safety-critical)

- [ ] 816 of 833 translations are machine-drafted and marked `verified: false`
      (17 English entries are verified, one per allergen). Each needs a native-speaker review
      before it should be fully trusted.
- [ ] You can verify the Hebrew (`hebrew:`) sections yourself: fix wording if needed, flip
      `verified: false` → `verified: true` in `data/allergens/*.yaml`, run `pnpm validate`.
- [ ] Recruit native speakers (allergy communities, r/foodallergies, Facebook groups) for the
      other languages - CONTRIBUTING.md walks them through it with no coding.

## 4. Enable paid plastic card orders (revenue)

- [ ] Create a Stripe account and get the secret key.
- [ ] Set environment variables on the Cloudflare Worker project:
      `STRIPE_SECRET_KEY`, `CARD_PRICE_CENTS` (e.g. `900` = $9), `SITE_URL`
      (`https://openallergy.org` once the custom domain is live).
- [ ] Do a test-mode order end to end (test key + card `4242 4242 4242 4242`) and confirm the
      session metadata (allergen, lang, personal_name, quantity) and shipping address appear
      in the Stripe Dashboard.
- [ ] Find a plastic card printer (local print shop or online CR80 card printing service) and
      decide your fulfillment cadence (e.g. batch orders weekly).
- [ ] Review the allowed shipping countries list in
      [`worker/checkout.ts`](worker/checkout.ts) and trim it to where you can
      actually ship.
- [ ] Plastic checkout is still a single allergen. Free cards already support up to five
      allergens on one card.

## 5. Legal / operational (before real sales)

- [x] Terms of service and privacy pages: `/terms` and `/privacy`. The site does not store
      orders itself; Stripe holds payment and shipping data.
- [ ] Check VAT/tax obligations for selling physical goods from your country (Stripe Tax can
      automate this).
- [x] Medical disclaimer is in the footer and in `data/LICENSE.md`.

## Done in the product (no longer "later")

- [x] Free multi-allergen cards (up to five allergens). Plastic orders remain one allergen.
- [x] Almonds, peach, and mango, plus the EU allergen list (17 allergens).
- [x] 49 languages, including Vietnamese, Thai, Korean, and Hindi.
- [x] SEO: sitemap (`/sitemap-index.xml`), `robots.txt`, canonical links, Open Graph and
      Twitter tags, and WebSite/Organization JSON-LD. One shared image at `/og.png`
      (not a unique image per allergen).

## Later / nice to have

- [ ] Stripe webhook + order database if volume outgrows the dashboard-as-queue approach.
- [ ] Automated paper-card dropshipping (Gelato/Printful) as a cheaper physical option.
- [ ] Multi-allergen plastic orders; non-food allergy cards (penicillin etc. - just new YAML files).
