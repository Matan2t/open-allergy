# Required Actions

Owner checklist to take the project from "built locally" to "live and earning".
Ordered by priority; the first three are enough to launch the free product.

## 1. Publish to GitHub (required for the open-source loop) — DONE 2026-07-27

- [x] Create a public GitHub repository: <https://github.com/Matan2t/open-allergy>.
- [x] Push this repo (`main` is the default branch; stale `master` deleted).
- [x] Update `GITHUB_URL` in [`src/lib/site.ts`](src/lib/site.ts) to the real repo URL —
      every "help review this translation" / "edit on GitHub" link on the site uses it.
- [ ] Optionally add issue templates for "translation fix" and "new language".

## 2. Deploy the site (free)

- [ ] Create a Cloudflare Pages project connected to the GitHub repo.
      Build command: `pnpm build` · Output directory: `dist` (the `functions/` directory is
      picked up automatically as Pages Functions).
- [ ] After the first deploy, set `site` in [`astro.config.mjs`](astro.config.mjs) and
      `CARD_FOOTER_BRAND` in [`src/lib/site.ts`](src/lib/site.ts) to the final domain
      (custom domain optional).

## 3. Verify translations (safety-critical)

- [ ] 154 of 168 translations are machine-drafted and marked `verified: false`.
      Each needs a native-speaker review before it should be fully trusted.
- [ ] You can verify the Hebrew (`he:`) sections yourself: fix wording if needed, flip
      `verified: false` → `verified: true` in `data/allergens/*.yaml`, run `pnpm validate`.
- [ ] Recruit native speakers (allergy communities, r/foodallergies, Facebook groups) for the
      other languages — CONTRIBUTING.md walks them through it with no coding.

## 4. Enable paid plastic card orders (revenue)

- [ ] Create a Stripe account and get the secret key.
- [ ] Set environment variables on the Cloudflare Pages project:
      `STRIPE_SECRET_KEY`, `CARD_PRICE_CENTS` (e.g. `900` = $9), `SITE_URL`.
- [ ] Do a test-mode order end to end (test key + card `4242 4242 4242 4242`) and confirm the
      session metadata (allergen, lang, personal_name, quantity) and shipping address appear
      in the Stripe Dashboard.
- [ ] Find a plastic card printer (local print shop or online CR80 card printing service) and
      decide your fulfillment cadence (e.g. batch orders weekly).
- [ ] Review the allowed shipping countries list in
      [`functions/api/checkout.ts`](functions/api/checkout.ts) and trim it to where you can
      actually ship.

## 5. Legal / operational (before real sales)

- [ ] Add a simple terms-of-sale + privacy page (no personal data is stored by the site
      itself; Stripe holds order data).
- [ ] Check VAT/tax obligations for selling physical goods from your country (Stripe Tax can
      automate this).
- [ ] Keep the medical disclaimer visible (already in the footer and data/LICENSE.md).

## Later / nice to have

- [ ] Stripe webhook + order database if volume outgrows the dashboard-as-queue approach.
- [ ] Automated paper-card dropshipping (Gelato/Printful) as a cheaper physical option.
- [ ] Custom multi-allergen cards; non-food allergy cards (penicillin etc. — just new YAML files).
- [ ] More languages (Vietnamese, Thai, Korean, Hindi are common travel gaps).
- [ ] SEO: sitemap, per-page structured data, and an OpenGraph card image per allergen.
