import type { Language, Translation } from '../lib/types';
import { CARD_FOOTER_BRAND } from '../lib/site';
import { multiStringsFor } from '../lib/multi';

export interface MultiAllergenItem {
  emoji: string;
  name: string;
}

export interface CardSideProps {
  language: Language;
  personalName?: string;
  /** Single-allergy mode (default). */
  translation?: Translation;
  emoji?: string;
  /** Multi-allergy mode: localized names + emojis. */
  multiItems?: MultiAllergenItem[];
}

/**
 * One side of the card at exact CR80 physical size (85.6mm × 54mm).
 * Theme A - Signal Red. Supports single or multi-allergen layouts.
 */
export default function Card({
  language,
  translation,
  emoji,
  personalName,
  multiItems,
}: CardSideProps) {
  const isMulti = Boolean(multiItems && multiItems.length > 1);
  const multi = multiStringsFor(language.code);
  const names = multiItems?.map((i) => i.name).join(', ') ?? '';
  const label =
    isMulti
      ? `Multi allergy card in ${language.name}`
      : `${translation?.allergen ?? 'Allergy'} allergy card in ${language.name}`;

  return (
    <div
      className={`allergy-card${isMulti ? ' allergy-card--multi' : ''}`}
      dir={language.direction}
      lang={language.locale || language.code}
      role="img"
      aria-label={label}
    >
      <header className="ac-header">
        <span className="ac-title">{language.strings.cardTitle}</span>
        <span className="ac-no-icon" aria-hidden="true">
          {isMulti ? (
            <span className="ac-emoji-stack">
              {multiItems!.slice(0, 3).map((item) => (
                <span key={item.name}>{item.emoji}</span>
              ))}
            </span>
          ) : (
            <span className="ac-emoji">{emoji}</span>
          )}
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#fff" stroke="#d90429" strokeWidth="5" />
            <line
              x1="14"
              y1="50"
              x2="50"
              y2="14"
              stroke="#d90429"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </header>

      <div className="ac-body">
        {isMulti ? (
          <>
            <p className="ac-statement">
              {multi.lead} {names}
            </p>
            <p className="ac-description">{multi.body}</p>
            <div className="ac-columns">
              <div className="ac-found">
                <p className="ac-found-label">{multi.label}</p>
                <ul className="ac-found-list ac-multi-list">
                  {multiItems!.map((item) => (
                    <li key={item.name}>
                      <span aria-hidden="true">{item.emoji}</span> {item.name}
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="ac-caution">
                <strong>{language.strings.cautionTitle}</strong>
                <p>{language.strings.cautionText}</p>
              </aside>
            </div>
            <p className="ac-question">{multi.question}</p>
          </>
        ) : (
          <>
            <p className="ac-statement">{translation!.statement}</p>
            <p className="ac-description">{translation!.description}</p>
            <div className="ac-columns">
              <div className="ac-found">
                <p className="ac-found-label">{translation!.foundInLabel}</p>
                <ul className="ac-found-list">
                  {translation!.foundIn.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <aside className="ac-caution">
                <strong>{language.strings.cautionTitle}</strong>
                <p>{language.strings.cautionText}</p>
              </aside>
            </div>
            <p className="ac-question">{translation!.question}</p>
          </>
        )}
      </div>

      <footer className="ac-footer">
        {personalName ? <span className="ac-name">{personalName}</span> : <span />}
        <span className="ac-brand">{CARD_FOOTER_BRAND}</span>
      </footer>
    </div>
  );
}
