# Contributing

Thank you for helping make allergy cards free and accurate for everyone. The most valuable
contribution is **translation review by native speakers** - no coding required.

## Verify or fix a translation (no coding required)

1. Open the allergen file in [`data/allergens/`](data/allergens/), e.g. `milk.yaml`.
2. Find your language's section (keyed by full readable name, e.g. `greek:` or `hebrew:`).
3. Click the pencil icon on GitHub to edit the file in your browser.
4. Fix any wording so it reads naturally to a native speaker. The text is shown to restaurant
   staff, so clarity matters more than literal translation.
5. If the translation is accurate and natural, change `verified: false` to `verified: true`.
6. Open a pull request. In the description, mention that you are a native/fluent speaker.

## Add a new allergen

1. Copy an existing file in `data/allergens/` (e.g. `milk.yaml`) to `<allergen-id>.yaml`.
   The id must be lowercase kebab-case (e.g. `tree-nuts`).
2. Fill in the English (`english:`) entry first - it is the source text for all translations.
3. Add translations for as many languages as you can. Machine-drafted translations are welcome
   as a starting point but must be marked `verified: false`.
4. Run `pnpm validate` to check the file against the schema.

Every translation entry has these fields:

```yaml
english:
  verified: true          # has a native speaker reviewed this?
  allergen: Milk          # allergen name, used in headings
  statement: I have a severe milk allergy.
  description: I cannot eat food containing milk or milk products, even in
    small amounts, or I will have a severe allergic reaction and require
    medical attention.
  foundInLabel: "Milk can be found in:"
  foundIn: [Casein, Whey, Cheese, Butter, Cream, Yogurt, Lactose, Baked goods]
  question: Does this food contain milk?
```

## Add a new language

1. Add the language to `data/languages.yaml` with:
   - `code`: full readable slug (e.g. `hebrew`, `portuguese-brazil`) - used in URLs and YAML keys
   - `locale`: BCP-47 tag (e.g. `he`, `pt-BR`) - used for HTML `lang` attributes
   - English name, native name, text direction (`ltr` or `rtl`), and shared UI strings
2. Add a translation section under that same `code` to each file in `data/allergens/` - partial
   coverage is fine; cards are only offered for languages that have a translation.
3. Run `pnpm validate`.

## Code contributions

The site is [Astro](https://astro.build) + React, deployed on Cloudflare Pages.

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm validate   # data validation (also runs in CI)
pnpm build
```

Please keep pull requests small and focused. For larger changes, open an issue first to discuss.

## Licensing of contributions

By contributing, you agree that code contributions are licensed under [MIT](LICENSE) and content
contributions (everything in `data/`) under [CC BY-SA 4.0](data/LICENSE.md).
