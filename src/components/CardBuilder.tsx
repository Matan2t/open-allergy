import { useEffect, useMemo, useRef, useState } from 'react';
import { getFontEmbedCSS, toBlob } from 'html-to-image';
import Card from './Card';
import type { MultiAllergenItem } from './Card';
import AllergenIcon from './AllergenIcon';
import { allergens, languages } from '../lib/data';
import { ENGLISH } from '../lib/types';
import { GITHUB_URL } from '../lib/site';
import { MAX_MULTI_ALLERGENS } from '../lib/multi';

type PrintMode = 'single' | 'sheet';

interface SaveFilePickerWindow {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: Array<{ accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandle>;
}

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
  /** Comma-separated allergen ids for multi cards (from ?a=). */
  initialAllergens?: string[];
}

function buildMultiItems(
  selected: typeof allergens,
  langCode: string,
): MultiAllergenItem[] {
  return selected.map((a) => ({
    id: a.id,
    emoji: a.emoji,
    name:
      a.translations[langCode]?.allergen ??
      a.translations[ENGLISH]?.allergen ??
      a.id,
  }));
}

export default function CardBuilder({
  initialAllergen,
  initialLang,
  initialAllergens,
}: CardBuilderProps) {
  const startIds =
    initialAllergens && initialAllergens.length > 0
      ? initialAllergens.filter((id) => allergens.some((a) => a.id === id)).slice(0, MAX_MULTI_ALLERGENS)
      : [initialAllergen];

  const [selectedIds, setSelectedIds] = useState<string[]>(
    startIds.length > 0 ? startIds : [allergens[0].id],
  );
  const [langCode, setLangCode] = useState(initialLang);
  const [personalName, setPersonalName] = useState('');
  const [printMode, setPrintMode] = useState<PrintMode>('single');
  const [pendingPrint, setPendingPrint] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [readyDownload, setReadyDownload] = useState<{ url: string; filename: string } | null>(
    null,
  );
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenSide, setFullscreenSide] = useState<'front' | 'back'>('front');
  const [fullscreenScale, setFullscreenScale] = useState(1);
  const pngRef = useRef<HTMLDivElement>(null);
  const fullscreenFitRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const selectedAllergens = useMemo(
    () =>
      selectedIds
        .map((id) => allergens.find((a) => a.id === id))
        .filter((a): a is (typeof allergens)[number] => Boolean(a)),
    [selectedIds],
  );

  const isMulti = selectedAllergens.length > 1;
  const primary = selectedAllergens[0] ?? allergens[0];
  const english = languages.find((l) => l.code === ENGLISH) ?? languages[0];

  const availableLanguages = languages
    .filter((l) => selectedAllergens.every((a) => a.translations[l.code]))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const language =
    availableLanguages.find((l) => l.code === langCode) ??
    availableLanguages.find((l) => l.code === ENGLISH) ??
    availableLanguages[0] ??
    english;

  const frontItems = buildMultiItems(selectedAllergens, language.code);
  const backItems = buildMultiItems(selectedAllergens, ENGLISH);

  const singleFront = primary.translations[language.code];
  const singleBack = primary.translations[ENGLISH];
  const allVerified = selectedAllergens.every(
    (a) => a.translations[language.code]?.verified === true,
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('a');
    if (!fromQuery) return;
    const ids = fromQuery
      .split(',')
      .map((s) => s.trim())
      .filter((id) => allergens.some((a) => a.id === id))
      .slice(0, MAX_MULTI_ALLERGENS);
    if (ids.length > 0) setSelectedIds(ids);
  }, []);

  useEffect(() => {
    if (!availableLanguages.some((l) => l.code === langCode) && language.code !== langCode) {
      setLangCode(language.code);
    }
  }, [availableLanguages, langCode, language.code]);

  useEffect(() => {
    const path = isMulti
      ? `/cards/multi/${language.code}?a=${selectedIds.join(',')}`
      : `/cards/${primary.id}/${language.code}`;
    const next = `${window.location.origin}${path}`;
    if (window.location.href !== next) {
      window.history.replaceState(null, '', path);
    }
    const titleAllergen = isMulti
      ? selectedAllergens.map((a) => a.translations[ENGLISH].allergen).join(', ')
      : singleBack.allergen;
    document.title = `${titleAllergen} allergy card in ${language.name} - Open Allergy Cards`;
  }, [
    isMulti,
    language.code,
    language.name,
    primary.id,
    selectedIds,
    selectedAllergens,
    singleBack.allergen,
  ]);

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

  useEffect(() => {
    if (!fullscreenOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setFullscreenOpen(false);
      if (event.key === 'f' || event.key === 'F') {
        setFullscreenSide((side) => (side === 'front' ? 'back' : 'front'));
      }
    }
    window.addEventListener('keydown', onKeyDown);

    const fit = fullscreenFitRef.current;
    const syncScale = () => {
      if (!fit) return;
      const cardWidthPx = (85.6 * 96) / 25.4;
      setFullscreenScale(fit.clientWidth / cardWidthPx);
    };
    syncScale();
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncScale) : null;
    if (fit && resizeObserver) resizeObserver.observe(fit);
    window.addEventListener('resize', syncScale);

    let cancelled = false;
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {
        // optional
      }
    }
    void requestWakeLock();

    async function onVisibilityChange() {
      if (document.visibilityState === 'visible' && !cancelled) {
        await requestWakeLock();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', syncScale);
      resizeObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [fullscreenOpen]);

  function openFullscreen() {
    setFullscreenSide('front');
    setFullscreenOpen(true);
  }

  function closeFullscreen() {
    setFullscreenOpen(false);
  }

  function toggleAllergen(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_MULTI_ALLERGENS) return prev;
      return [...prev, id];
    });
  }

  async function handleDownloadPng() {
    if (!pngRef.current) return;

    if (readyDownload) {
      URL.revokeObjectURL(readyDownload.url);
      setReadyDownload(null);
    }
    setExportError(null);
    setExporting(true);

    const slug = isMulti ? `multi-${selectedIds.join('-')}` : primary.id;
    const filename = `allergy-card-${slug}-${language.code}.png`;
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

  const frontLanguage = isMulti || singleFront ? language : english;
  const backLanguage = english;
  const editUrl = `${GITHUB_URL}/edit/main/data/allergens/${primary.id}.yaml`;
  const orderUrl = isMulti
    ? `/order?allergen=${primary.id}&lang=${language.code}`
    : `/order?allergen=${primary.id}&lang=${language.code}`;

  const frontLabel =
    frontLanguage.code === ENGLISH
      ? `Front - English${isMulti ? ' (multi)' : ''}`
      : `Front - ${frontLanguage.name}${isMulti ? ' (multi)' : ''}`;
  const backLabel = `Back - English${isMulti ? ' (multi)' : ''}`;

  function renderCard(side: 'front' | 'back') {
    const lang = side === 'front' ? frontLanguage : backLanguage;
    if (isMulti) {
      return (
        <Card
          language={lang}
          multiItems={side === 'front' ? frontItems : backItems}
          personalName={personalName || undefined}
        />
      );
    }
    const tr = side === 'front' ? (singleFront ?? singleBack) : singleBack;
    return (
      <Card
        language={lang}
        translation={tr}
        emoji={primary.emoji}
        allergenId={primary.id}
        personalName={personalName || undefined}
      />
    );
  }

  const fullscreenCard = renderCard(fullscreenSide);
  const cardPair = (
    <>
      {renderCard('front')}
      {renderCard('back')}
    </>
  );

  return (
    <div className="card-builder">
      <div className="builder-controls no-print">
        <fieldset className="field allergen-multi-field">
          <legend>
            Allergies (select up to {MAX_MULTI_ALLERGENS})
            {isMulti ? ` - ${selectedIds.length} selected` : ''}
          </legend>
          <div className="allergen-checkboxes">
            {allergens.map((a) => {
              const checked = selectedIds.includes(a.id);
              const disabled = !checked && selectedIds.length >= MAX_MULTI_ALLERGENS;
              return (
                <label key={a.id} className={`allergen-check${disabled ? ' is-disabled' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleAllergen(a.id)}
                  />
                  <span className="allergen-check-label">
                    <AllergenIcon id={a.id} emoji={a.emoji} className="allergen-check-icon" />{' '}
                    {a.translations[ENGLISH].allergen}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="field">
          Language - {availableLanguages.length} available
          <select value={language.code} onChange={(e) => setLangCode(e.target.value)}>
            {availableLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag ?? ''} {l.name} - {l.nativeName}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Name on card (optional)
          <input
            type="text"
            maxLength={40}
            placeholder="e.g. Matan Touti"
            value={personalName}
            onChange={(e) => setPersonalName(e.target.value)}
          />
        </label>
      </div>

      <div className="builder-status no-print">
        {allVerified ? (
          <span className="badge badge-verified">✓ Translation verified by a native speaker</span>
        ) : (
          <span className="badge badge-unverified">
            ⚠ Community translation, not yet verified -{' '}
            <a href={editUrl} target="_blank" rel="noopener noreferrer">
              help review it
            </a>
          </span>
        )}
        {isMulti && (
          <span className="badge badge-multi">
            Multi-allergy card - plastic orders currently print the first allergen; download/print
            include all selected.
          </span>
        )}
      </div>

      <div className="card-preview screen-only">
        <figure>
          <figcaption className="no-print">{frontLabel}</figcaption>
          {renderCard('front')}
        </figure>
        <figure>
          <figcaption className="no-print">{backLabel}</figcaption>
          {renderCard('back')}
        </figure>
      </div>

      <div className="builder-actions no-print">
        <button type="button" className="btn btn-primary" onClick={openFullscreen}>
          View online (fullscreen)
        </button>
        <button type="button" className="btn" onClick={() => handlePrint('single')}>
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
        Free forever. Select one or more allergies (up to {MAX_MULTI_ALLERGENS}) to build a single
        clear card. Show it fullscreen, print it, or download a PNG. Double-sided: your language on
        the front, English on the back.
      </p>

      {fullscreenOpen && (
        <div
          className="card-fullscreen no-print"
          role="dialog"
          aria-modal="true"
          aria-label={`Allergy card - ${frontLanguage.name}`}
        >
          <div className="card-fullscreen-bar">
            <p className="card-fullscreen-title">
              {fullscreenSide === 'front' ? frontLabel : backLabel}
            </p>
            <div className="card-fullscreen-actions">
              {frontLanguage.code !== ENGLISH && (
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setFullscreenSide((side) => (side === 'front' ? 'back' : 'front'))
                  }
                >
                  {fullscreenSide === 'front' ? 'Show English' : `Show ${frontLanguage.name}`}
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={closeFullscreen}>
                Close
              </button>
            </div>
          </div>

          <button
            type="button"
            className="card-fullscreen-stage"
            onClick={() =>
              frontLanguage.code !== ENGLISH &&
              setFullscreenSide((side) => (side === 'front' ? 'back' : 'front'))
            }
            aria-label={
              frontLanguage.code === ENGLISH
                ? 'Allergy card'
                : 'Tap to flip between languages'
            }
          >
            <div className="card-fullscreen-fit" ref={fullscreenFitRef}>
              <div
                className="card-fullscreen-scale"
                style={{ transform: `scale(${fullscreenScale})` }}
              >
                {fullscreenCard}
              </div>
            </div>
          </button>

          <p className="card-fullscreen-hint">
            {frontLanguage.code === ENGLISH
              ? 'Hand your phone to staff. Press Close or Escape when done.'
              : 'Tap the card to flip. Hand your phone to staff. Press Close or Escape when done.'}
          </p>
        </div>
      )}

      <div className={`print-area ${printMode === 'single' ? 'print-single' : 'print-sheet'}`}>
        {printMode === 'single' ? (
          <>
            <div className="print-card-page">{renderCard('front')}</div>
            <div className="print-card-page">{renderCard('back')}</div>
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
