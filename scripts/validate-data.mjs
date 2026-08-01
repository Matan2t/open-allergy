/**
 * Validates all card data against the JSON Schema and cross-checks it with
 * languages.yaml. Run with `pnpm validate`. Exits non-zero on any error, so
 * CI can block pull requests with malformed data.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';
import Ajv from 'ajv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const allergensDir = join(root, 'data', 'allergens');

const errors = [];

// --- languages.yaml ---------------------------------------------------------
const languagesDoc = loadYaml(readFileSync(join(root, 'data', 'languages.yaml'), 'utf8'));
const languages = languagesDoc?.languages ?? [];

if (!Array.isArray(languages) || languages.length === 0) {
  console.error('data/languages.yaml: missing or empty `languages` list');
  process.exit(1);
}

const languageCodes = new Set();
for (const lang of languages) {
  const where = `data/languages.yaml (${lang?.code ?? '?'})`;
  if (!lang.code || !/^[a-z][a-z0-9-]*$/.test(lang.code)) {
    errors.push(`${where}: invalid or missing code (use full readable slug, e.g. hebrew)`);
    continue;
  }
  if (!lang.locale || !/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/.test(lang.locale)) {
    errors.push(`${where}: invalid or missing locale (BCP-47 tag, e.g. he)`);
  }
  if (languageCodes.has(lang.code)) errors.push(`${where}: duplicate language code`);
  languageCodes.add(lang.code);
  if (!['ltr', 'rtl'].includes(lang.direction)) errors.push(`${where}: direction must be ltr or rtl`);
  for (const field of ['name', 'nativeName']) {
    if (!lang[field]) errors.push(`${where}: missing ${field}`);
  }
  for (const key of ['cardTitle', 'cautionTitle', 'cautionText']) {
    if (!lang.strings?.[key]) errors.push(`${where}: missing strings.${key}`);
  }
}

// --- allergen files ----------------------------------------------------------
const schema = JSON.parse(
  readFileSync(join(root, 'data', 'schema', 'allergen.schema.json'), 'utf8')
);
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const files = readdirSync(allergensDir).filter(
  (f) => f.endsWith('.yaml') && !f.startsWith('_') && !f.includes('_new')
);
if (files.length === 0) errors.push('data/allergens/: no allergen files found');

let translationCount = 0;
let verifiedCount = 0;

for (const file of files) {
  const path = `data/allergens/${file}`;
  let doc;
  try {
    doc = loadYaml(readFileSync(join(allergensDir, file), 'utf8'));
  } catch (e) {
    errors.push(`${path}: YAML parse error — ${e.message}`);
    continue;
  }

  if (!validate(doc)) {
    for (const err of validate.errors) {
      errors.push(`${path}: ${err.instancePath || '/'} ${err.message}`);
    }
    continue;
  }

  const expectedId = basename(file, '.yaml');
  if (doc.id !== expectedId) {
    errors.push(`${path}: id "${doc.id}" does not match file name "${expectedId}"`);
  }

  for (const [code, t] of Object.entries(doc.translations)) {
    if (!languageCodes.has(code)) {
      errors.push(`${path}: language "${code}" is not declared in data/languages.yaml`);
    }
    translationCount += 1;
    if (t.verified) verifiedCount += 1;
  }
}

// --- report ------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\n✗ Validation failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ ${files.length} allergens, ${languages.length} languages`);
console.log(
  `✓ ${translationCount} translations (${verifiedCount} verified, ${
    translationCount - verifiedCount
  } awaiting native-speaker review)`
);
