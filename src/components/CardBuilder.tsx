import { useEffect, useRef, useState } from 'react';
import { getFontEmbedCSS, toBlob } from 'html-to-image';
import Card from './Card';
import { allergens, languages } from '../lib/data';
import { ENGLISH } from '../lib/types';
import { GITHUB_URL } from '../lib/site';

type PrintMode = 'single' | 'sheet';

interface SaveFilePickerWindow {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: Array<{ accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandle>;
}

/** Convert millimeters to CSS pixels at 96 dpi. */
const MM_TO_PX = 96 / 25.4;
const mmToPx = (mm: number) => Math.round(mm * MM_TO_PX);

const CARD_WIDTH_PX = mmToPx(85.6);
const CARD_HEIGHT_PX = mmToPx(54);
const EXPORT_PAD_PX = mmToPx(4);
const EXPORT_GAP_PX = mmToPx(4);
const EXPORT_WIDTH_PX = CARD_WIDTH_PX + EXPORT_PAD_PX * 2;
const EXPORT_HEIGHT_PX = CARD_HEIGHT_PX * 2 + EXPORT_GAP_PX + EXPORT_PAD_PX * 2;

export interface CardBuilderProps {
  initialAllergen: string;
  initialLang: string;
}

export default function CardBuilder({ initialAllergen, initialLang }: CardBuilderProps) {
  const [allergenId, setAllergenId] = useState(initialAllergen);
  const [langCode, setLangCode] = useState(initialLang);
  const [personalName, setPersonalName] = useState('');
  const [printMode, setPrintMode] = useState<PrintMode>('single');
  const [pendingPrint, setPendingPrint] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [readyDownload, setReadyDownload] = useState<{ url: string; filename: string } | null>(
    null,
  );
  const pngRef = useRef<HTMLDivElement>(null);

  const allergen = allergens.find((a) => a.id === allergenId) ?? allergens[0];
  const english = languages.find((l) => l.code === ENGLISH) ?? languages[0];

  // Only list languages that have a translation for the selected allergen.
  const availableLanguages = languages
    .filter((l) => allergen.translations[l.code])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const language =
    availableLanguages.find((l) => l.code === langCode) ??
    availableLanguages.find((l) => l.code === ENGLISH) ??
    availableLanguages[0] ??
    english;

  const translation = allergen.translations[language.code];
  const enTranslation = allergen.translations[ENGLISH];

  useEffect(() => {
    if (!allergen.translations[langCode] && language.code !== langCode) {
      setLangCode(language.code);
    }
  }, [allergen, langCode, language.code]);

  useEffect(() => {
    const path = `/cards/${allergen.id}/${language.code}`;
    if (window.location.pathname !== path) {
      window.history.replaceState(null, '', path);
    }
    document.title = `${enTranslation.allergen} allergy card in ${language.name} - Open Allergy Cards`;
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

  useEffect(() => {
    return () => {
      if (readyDownload) URL.revokeObjectURL(readyDownload.url);
    };
  }, [readyDownload]);

  async function handleDownloadPng() {
    if (!pngRef.current) return;

    if (readyDownload) {
      URL.revokeObjectURL(readyDownload.url);
      setReadyDownload(null);
    }
    setExportError(null);
    setExporting(true);

    const filename = `allergy-card-${allergen.id}-${language.code}.png`;
    let fileHandle: FileSystemFileHandle | null = null;

    try {
      const savePicker = (window as Window & SaveFilePickerWindow).showSaveFilePicker;
      if (savePicker) {
        try {
          fileHandle = await savePicker({
            suggestedName: filename,
            types: [{ accept: { 'image/png': ['.png'] } }],
          });
        } catch (error) {
          if ((error as DOMException).name === 'AbortError') return;
        }
      }

      await document.fonts.ready;

      const fontEmbedCSS = await getFontEmbedCSS(pngRef.current, { cacheBust: true }).catch(
        () => undefined,
      );

      const blob = await toBlob(pngRef.current, {
        width: EXPORT_WIDTH_PX,
        height: EXPORT_HEIGHT_PX,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: !fontEmbedCSS,
        fontEmbedCSS: fontEmbedCSS ?? undefined,
      });

      if (!blob) throw new Error('PNG export returned an empty image');

      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Browsers often block programmatic downloads after async work; keep a manual fallback.
      setReadyDownload({ url, filename });
    } catch (error) {
      console.error('PNG export failed:', error);
      setExportError(
        'Could not create the PNG. Try Print card (or save as PDF), or click the link below if it appears.',
      );
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
    frontLanguage.code === ENGLISH ? 'Front - English' : `Front - ${frontLanguage.name}`;
  const backLabel = 'Back - English';

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
          Language (front) - {availableLanguages.length} available
          <select value={language.code} onChange={(e) => setLangCode(e.target.value)}>
            {availableLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} - {l.nativeName}
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
            ⚠ Community translation, not yet verified -{' '}
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
        {readyDownload && (
          <a className="btn btn-primary" href={readyDownload.url} download={readyDownload.filename}>
            Save PNG file
          </a>
        )}
        <a className="btn" href={orderUrl}>
          Order a plastic card
        </a>
      </div>

      {exportError && (
        <p className="builder-error no-print" role="alert">
          {exportError}
        </p>
      )}

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

      <div ref={pngRef} className="png-export" aria-hidden="true">
        {cardPair}
      </div>
    </div>
  );
}
