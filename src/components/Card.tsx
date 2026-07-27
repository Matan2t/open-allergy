import type { Language, Translation } from '../lib/types';
import { CARD_FOOTER_BRAND } from '../lib/site';

export interface CardSideProps {
  language: Language;
  translation: Translation;
  emoji: string;
  personalName?: string;
}

/**
 * One side of the card at exact CR80 physical size (85.6mm x 54mm).
 * All dimensions use mm so the browser prints it at true scale.
 */
export default function Card({ language, translation, emoji, personalName }: CardSideProps) {
  return (
    <div
      className="allergy-card"
      dir={language.direction}
      lang={language.code}
      role="img"
      aria-label={`${translation.allergen} allergy card in ${language.name}`}
    >
      <header className="ac-header">
        <span className="ac-title">{language.strings.cardTitle}</span>
        <span className="ac-no-icon" aria-hidden="true">
          <span className="ac-emoji">{emoji}</span>
        </span>
      </header>

      <div className="ac-body">
        <p className="ac-statement">{translation.statement}</p>
        <p className="ac-description">{translation.description}</p>

        <div className="ac-columns">
          <div className="ac-found">
            <p className="ac-found-label">{translation.foundInLabel}</p>
            <ul className="ac-found-list">
              {translation.foundIn.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <aside className="ac-caution">
            <strong>{language.strings.cautionTitle}</strong>
            <p>{language.strings.cautionText}</p>
          </aside>
        </div>

        <p className="ac-question">{translation.question}</p>
      </div>

      <footer className="ac-footer">
        {personalName ? <span className="ac-name">{personalName}</span> : <span />}
        <span className="ac-brand">{CARD_FOOTER_BRAND}</span>
      </footer>
    </div>
  );
}
