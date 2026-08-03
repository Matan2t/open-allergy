/**
 * Migrate language keys from short ISO codes to full readable slugs.
 * Updates languages.yaml, allergen YAMLs, and the seed JSON pack.
 *
 * Run: node scripts/rename-language-codes.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml, dump as dumpYaml } from 'js-yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** short / BCP-47 → readable kebab-case slug */
const CODE_MAP = {
  en: 'english',
  ar: 'arabic',
  bn: 'bengali',
  bg: 'bulgarian',
  ca: 'catalan',
  zh: 'chinese-simplified',
  'zh-HK': 'chinese-hong-kong',
  'zh-Hant': 'chinese-traditional',
  hr: 'croatian',
  cs: 'czech',
  da: 'danish',
  nl: 'dutch',
  et: 'estonian',
  fi: 'finnish',
  fr: 'french',
  de: 'german',
  el: 'greek',
  he: 'hebrew',
  hi: 'hindi',
  hu: 'hungarian',
  is: 'icelandic',
  id: 'indonesian',
  it: 'italian',
  ja: 'japanese',
  km: 'khmer',
  ko: 'korean',
  lo: 'lao',
  lv: 'latvian',
  lt: 'lithuanian',
  mk: 'macedonian',
  ms: 'malay',
  mt: 'maltese',
  no: 'norwegian',
  pl: 'polish',
  pt: 'portuguese',
  'pt-BR': 'portuguese-brazil',
  ro: 'romanian',
  ru: 'russian',
  sr: 'serbian',
  sk: 'slovak',
  sl: 'slovenian',
  es: 'spanish',
  sw: 'swahili',
  sv: 'swedish',
  tl: 'tagalog',
  th: 'thai',
  tr: 'turkish',
  uk: 'ukrainian',
  vi: 'vietnamese',
};

function remapKeys(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const next = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = CODE_MAP[key] ?? key;
    if (CODE_MAP[key] === undefined && /^[a-z]{2}(-[A-Za-z]+)?$/.test(key)) {
      console.warn(`Unmapped language key: ${key}`);
    }
    next[newKey] = value;
  }
  return next;
}

function extractHeader(raw) {
  const lines = raw.split('\n');
  const header = [];
  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') header.push(line);
    else break;
  }
  while (header.length && header[header.length - 1].trim() === '') header.pop();
  return header.length ? header.join('\n') + '\n' : '';
}

// --- languages.yaml ---------------------------------------------------------
const languagesPath = join(root, 'data', 'languages.yaml');
const languagesRaw = readFileSync(languagesPath, 'utf8');
const languagesDoc = loadYaml(languagesRaw);
for (const lang of languagesDoc.languages) {
  const old = lang.code;
  if (!CODE_MAP[old]) {
    // Already migrated or unknown
    if (!Object.values(CODE_MAP).includes(old)) {
      console.warn(`languages.yaml: unknown code ${old}`);
    }
    continue;
  }
  lang.locale = old; // BCP-47 for HTML lang=
  lang.code = CODE_MAP[old];
}
writeFileSync(
  languagesPath,
  `# Supported languages (~50).
# \`code\` is the full readable slug used in URLs and YAML keys (e.g. hebrew).
# \`locale\` is the BCP-47 tag used for HTML lang= attributes (e.g. he).
# \`strings\` are shared card texts that do not vary per allergen.
# To add a language: add an entry here, then add translations to files in data/allergens/.
` + dumpYaml(languagesDoc, { lineWidth: 100, noRefs: true, quotingType: "'", forceQuotes: false })
);
console.log(`✓ languages.yaml → ${languagesDoc.languages.length} languages with full codes`);

// --- allergen YAMLs ---------------------------------------------------------
const allergensDir = join(root, 'data', 'allergens');
for (const file of readdirSync(allergensDir).filter((f) => f.endsWith('.yaml') && !f.startsWith('_'))) {
  const path = join(allergensDir, file);
  const raw = readFileSync(path, 'utf8');
  const header = extractHeader(raw);
  const doc = loadYaml(raw);
  doc.translations = remapKeys(doc.translations);
  const body = dumpYaml(doc, { lineWidth: 100, noRefs: true, quotingType: "'", forceQuotes: false });
  writeFileSync(path, header + body);
  console.log(`✓ ${file} (${Object.keys(doc.translations).length} langs)`);
}

// --- seed pack --------------------------------------------------------------
const seedPath = join(root, 'data', 'seed', 'new-language-packs.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
const newSeed = {};
for (const [allergen, langs] of Object.entries(seed)) {
  newSeed[allergen] = remapKeys(langs);
}
writeFileSync(seedPath, JSON.stringify(newSeed, null, 2) + '\n');
console.log('✓ data/seed/new-language-packs.json');

console.log('\nDone. Update schema/code that still expect ISO codes.');
