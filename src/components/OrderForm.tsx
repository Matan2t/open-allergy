import { useEffect, useState } from 'react';
import { allergens, languages } from '../lib/data';
import { ENGLISH } from '../lib/types';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'canceled' }
  | { kind: 'error'; message: string };

const NOT_CONFIGURED_MESSAGE =
  'Online ordering is not enabled on this deployment yet. You can still download and print ' +
  'your card for free - or take the PNG to any local print shop.';

export default function OrderForm() {
  const [allergenId, setAllergenId] = useState(allergens[0].id);
  const [langCode, setLangCode] = useState(languages[0].code);
  const [personalName, setPersonalName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  // Prefill from ?allergen=..&lang=.. and surface Stripe redirect results.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get('allergen');
    const l = params.get('lang');
    if (a && allergens.some((x) => x.id === a)) setAllergenId(a);
    if (l && languages.some((x) => x.code === l)) setLangCode(l);
    if (params.get('success')) setStatus({ kind: 'success' });
    if (params.get('canceled')) setStatus({ kind: 'canceled' });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'submitting' });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allergen: allergenId, lang: langCode, personalName, quantity }),
      });
      if (res.status === 503 || res.status === 404) {
        setStatus({ kind: 'error', message: NOT_CONFIGURED_MESSAGE });
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setStatus({
          kind: 'error',
          message: data.error ?? 'Something went wrong creating the checkout. Please try again.',
        });
        return;
      }
      window.location.href = data.url;
    } catch {
      setStatus({ kind: 'error', message: NOT_CONFIGURED_MESSAGE });
    }
  }

  const allergen = allergens.find((a) => a.id === allergenId) ?? allergens[0];
  const availableLanguages = languages
    .filter((l) => allergen.translations[l.code])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  const language =
    availableLanguages.find((l) => l.code === langCode) ?? availableLanguages[0] ?? languages[0];

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      {status.kind === 'success' && (
        <p className="alert alert-success">
          Thank you! Your order was received. Your card will be printed and shipped to the address
          you entered at checkout.
        </p>
      )}
      {status.kind === 'canceled' && (
        <p className="alert alert-error">Checkout was canceled - nothing was charged.</p>
      )}
      {status.kind === 'error' && <p className="alert alert-error">{status.message}</p>}

      <label className="field">
        Allergy
        <select value={allergenId} onChange={(e) => setAllergenId(e.target.value)}>
          {allergens.map((a) => (
            <option key={a.id} value={a.id}>
              {a.id === 'sesame' ? '◎' : a.emoji} {a.translations[ENGLISH].allergen}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Language (English is always on the back) - {availableLanguages.length} available
        <select value={language.code} onChange={(e) => setLangCode(e.target.value)}>
            {availableLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag ?? ''} {l.name} - {l.nativeName}
              </option>
            ))}
        </select>
      </label>

      <label className="field">
        Name printed on card (optional)
        <input
          type="text"
          maxLength={40}
          placeholder="e.g. Maria Cohen"
          value={personalName}
          onChange={(e) => setPersonalName(e.target.value)}
        />
      </label>

      <label className="field">
        Quantity
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
        />
      </label>

      <button type="submit" className="btn btn-primary" disabled={status.kind === 'submitting'}>
        {status.kind === 'submitting' ? 'Redirecting to checkout…' : 'Continue to checkout'}
      </button>
    </form>
  );
}
