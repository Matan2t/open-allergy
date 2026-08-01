import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import Card from './Card';
import type { Allergen, Language } from '../lib/types';
import { ENGLISH } from '../lib/types';
import { GITHUB_URL } from '../lib/site';

type PrintMode = 'single' | 'sheet';

export interface CardBuilderProps {
  allergens: Allergen[];
  languages: Language[];
  initialAllergen: string;
  initialLang: string;
}

export default function CardBuilder({
  allergens,
  languages,
  initialAllergen,
  initialLang,
}: CardBuilderProps) {
  const [allergenId, setAllergenId] = useState(initialAllergen);
  const [langCode, setLangCode] = useState(initialLang);
  const [personalName, setPersonalName] = useState('');
  const [printMode, setPrintMode] = useState<PrintMode>('single');
  const [pendingPrint, setPendingPrint] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pngRef = useRef<HTMLDivElement>(null);

  const allergen = allergens.find((a) => a.id === allergenId) ?? allergens[0];
  const language = languages.find((l) => l.code === langCode) ?? languages[0];
  const english = languages.find((l) => l.code === ENGLISH) ?? languages[0];

  const translation = allergen.translations[language.code];
  const enTranslation = allergen.translations[ENGLISH];

  useEffect(() => {
    const path = `/cards/${allergen.id}/${language.code}`;
    if (window.location.pathname !== path) {
      window.history.replaceState(null, '', path);
    }
    document.title = `${enTranslation.allergen} allergy card in ${language.name} — Open Allergy Cards`;
  }, [allergen.id, language.code, language.name, enTranslation.allergen]);

  useEffect(() => {
    if (pendingPrint) {
      setPendingPrint(false);
      window.print();
    }
  }, [pendingPrint]);

  function handlePrint(mode: PrintMode) {
    setPrintMode(mode);
    setPendingPrint(true);
  }

  async function handleDownloadPng() {
    if (!pngRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(pngRef.current, {
        pixelRatio: 4,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `allergy-card-${allergen.id}-${language.code}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  // Fall back to English if a language lacks this allergen translation.
  const front = translation ?? enTranslation;
  const frontLanguage = translation ? language : english;
  const backTranslation = enTranslation;
  const backLanguage = english;

  const editUrl = `${GITHUB_URL}/edit/main/data/allergens/${allergen.id}.yaml`;
  const orderUrl = `/order?allergen=${allergen.id}&lang=${language.code}`;

  const frontLabel =
    frontLanguage.code === ENGLISH ? 'Front — English' : `Front — ${frontLanguage.name}`;
  const backLabel = 'Back — English';

  const cardPair = (
    <>
      <Card
        language={frontLanguage}
        translation={front}
        emoji={allergen.emoji}
        personalName={personalName || undefined}
      />
      <Card
        language={backLanguage}
        translation={backTranslation}
        emoji={allergen.emoji}
        personalName={personalName || undefined}
      />
    </>
  );

  return (
    <div className="card-builder">
      <div className="builder-controls no-print">
        <label className="field">
          Allergy
          <select value={allergen.id} onChange={(e) => setAllergenId(e.target.value)}>
            {allergens.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.translations[ENGLISH].allergen}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Language (front)
          <select value={language.code} onChange={(e) => setLangCode(e.target.value)}>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} — {l.nativeName}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Name on card (optional)
          <input
            type="text"
            maxLength={40}
            placeholder="e.g. Maria Cohen"
            value={personalName}
            onChange={(e) => setPersonalName(e.target.value)}
          />
        </label>
      </div>

      <div className="builder-status no-print">
        {front.verified ? (
          <span className="badge badge-verified">✓ Translation verified by a native speaker</span>
        ) : (
          <span className="badge badge-unverified">
            ⚠ Community translation, not yet verified —{' '}
            <a href={editUrl} target="_blank" rel="noopener noreferrer">
              help review it
            </a>
          </span>
        )}
      </div>

      <div className="card-preview screen-only">
        <figure>
          <figcaption className="no-print">{frontLabel}</figcaption>
          <Card
            language={frontLanguage}
            translation={front}
            emoji={allergen.emoji}
            personalName={personalName || undefined}
          />
        </figure>
        <figure>
          <figcaption className="no-print">{backLabel}</figcaption>
          <Card
            language={backLanguage}
            translation={backTranslation}
            emoji={allergen.emoji}
            personalName={personalName || undefined}
          />
        </figure>
      </div>

      <div className="builder-actions no-print">
        <button type="button" className="btn btn-primary" onClick={() => handlePrint('single')}>
          Print card (or save as PDF)
        </button>
        <button type="button" className="btn" onClick={() => handlePrint('sheet')}>
          Print A4 sheet (4 copies)
        </button>
        <button type="button" className="btn" onClick={handleDownloadPng} disabled={exporting}>
          {exporting ? 'Preparing…' : 'Download PNG'}
        </button>
        <a className="btn" href={orderUrl}>
          Order a plastic card
        </a>
      </div>

      <p className="builder-hint no-print">
        Free forever. Every card is double-sided: your chosen language on the front, English on
        the back. Print at home on thick paper, laminate it, or take the PNG to any print shop.
        Standard credit-card size (85.6 × 54 mm).
      </p>

      <div className={`print-area ${printMode === 'single' ? 'print-single' : 'print-sheet'}`}>
        {printMode === 'single' ? (
          <>
            <div className="print-card-page">
              <Card
                language={frontLanguage}
                translation={front}
                emoji={allergen.emoji}
                personalName={personalName || undefined}
              />
            </div>
            <div className="print-card-page">
              <Card
                language={backLanguage}
                translation={backTranslation}
                emoji={allergen.emoji}
                personalName={personalName || undefined}
              />
            </div>
          </>
        ) : (
          <>
            <p className="sheet-note">
              Cut along the dashed lines, then fold each pair in half (or glue back-to-back) for a
              double-sided card. Front = chosen language, back = English. Size: 85.6 × 54 mm.
            </p>
            <div className="sheet-grid">
              {[0, 1, 2, 3].map((i) => (
                <div className="sheet-pair" key={i}>
                  {cardPair}
                </div>
              ))}
            </div>
          </>
        )}
        <style>{`@page { size: ${printMode === 'single' ? '85.6mm 54mm' : 'A4 portrait'}; margin: ${printMode === 'single' ? '0' : '8mm'}; }`}</style>
      </div>

      <div
        ref={pngRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '-300%',
          display: 'flex',
          flexDirection: 'column',
          gap: '4mm',
          padding: '4mm',
          background: '#ffffff',
          width: 'fit-content',
        }}
      >
        {cardPair}
      </div>
    </div>
  );
}
