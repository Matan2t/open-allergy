export interface Translation {
  verified: boolean;
  allergen: string;
  statement: string;
  description: string;
  foundInLabel: string;
  foundIn: string[];
  question: string;
}

export interface Allergen {
  id: string;
  emoji: string;
  /** Keys are full readable language codes, e.g. `english`, `hebrew`, `portuguese-brazil`. */
  translations: Record<string, Translation>;
}

export interface LanguageStrings {
  cardTitle: string;
  cautionTitle: string;
  cautionText: string;
}

export interface Language {
  /** Full readable slug used in URLs and YAML keys, e.g. `hebrew`. */
  code: string;
  /** BCP-47 tag for HTML `lang` attributes, e.g. `he`. */
  locale: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  strings: LanguageStrings;
}

/** Canonical English language code used in data files and URLs. */
export const ENGLISH = 'english';
