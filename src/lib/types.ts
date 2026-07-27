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
  translations: Record<string, Translation>;
}

export interface LanguageStrings {
  cardTitle: string;
  cautionTitle: string;
  cautionText: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  strings: LanguageStrings;
}
