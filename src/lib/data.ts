import type { Allergen, Language } from './types';
import languagesFile from '../../data/languages.yaml';

// Canonical display order: most common allergies first.
const ORDER = [
  'milk',
  'eggs',
  'peanuts',
  'tree-nuts',
  'gluten',
  'fish',
  'crustaceans',
  'molluscs',
  'soy',
  'sesame',
  'celery',
  'mustard',
  'sulphites',
  'lupin',
];

const modules = import.meta.glob<{ default: Allergen }>('../../data/allergens/*.yaml', {
  eager: true,
});

export const allergens: Allergen[] = Object.values(modules)
  .map((m) => m.default)
  .filter((a): a is Allergen => Boolean(a?.id && typeof a.id === 'string' && a.translations))
  .sort((a, b) => {
    const ia = ORDER.indexOf(a.id);
    const ib = ORDER.indexOf(b.id);
    if (ia === -1 && ib === -1) return a.id.localeCompare(b.id);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

export const languages: Language[] = (languagesFile as { languages: Language[] }).languages;

export function getAllergen(id: string): Allergen | undefined {
  return allergens.find((a) => a.id === id);
}

export function getLanguage(code: string): Language | undefined {
  return languages.find((l) => l.code === code);
}
