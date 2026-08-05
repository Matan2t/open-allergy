/**
 * Merge missing language translations from data/seed/new-language-packs.json
 * into data/allergens/*.yaml without overwriting existing language keys.
 *
 * Usage: node scripts/apply-language-seed.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml, dump as dumpYaml } from 'js-yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packPath = join(root, 'data', 'seed', 'new-language-packs.json');
const allergensDir = join(root, 'data', 'allergens');

const pack = JSON.parse(readFileSync(packPath, 'utf8'));

const files = readdirSync(allergensDir).filter(
  (f) => f.endsWith('.yaml') && !f.startsWith('_')
);

const counts = {};

for (const file of files) {
  const allergenId = file.replace(/\.yaml$/, '');
  const path = join(allergensDir, file);
  const raw = readFileSync(path, 'utf8');

  const idIdx = raw.search(/^id:/m);
  const header = idIdx > 0 ? raw.slice(0, idIdx) : '';

  const doc = loadYaml(raw);
  if (!doc?.translations) {
    console.warn(`skip ${file}: no translations`);
    continue;
  }

  const seed = pack[allergenId];
  let added = 0;
  if (seed) {
    for (const [lang, translation] of Object.entries(seed)) {
      if (!doc.translations[lang]) {
        doc.translations[lang] = translation;
        added++;
      }
    }
  }

  const dumped = dumpYaml(doc, {
    lineWidth: 100,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });

  writeFileSync(path, header + dumped, 'utf8');
  counts[allergenId] = Object.keys(doc.translations).length;
  console.log(
    `${allergenId}: ${counts[allergenId]} languages (+${added} from seed)`
  );
}

console.log('\nFinal language counts:');
for (const [id, n] of Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`  ${id}: ${n}`);
}
