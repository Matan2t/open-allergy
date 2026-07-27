import { useEffect, useState } from 'react';
import type { Allergen, Language } from '../lib/types';

export interface OrderFormProps {
  allergens: Allergen[];
  languages: Language[];
}

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'canceled' }
  | { kind: 'error'; message: string };

const NOT_CONFIGURED_MESSAGE =
  'Online ordering is not enabled on this deployment yet. You can still download and print ' +
  'your card for free — or take the PNG to any local print shop.';

export default function OrderForm({ allergens, languages }: OrderFormProps) {
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
  }, [allergens, languages]);

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
  const language = languages.find((l) => l.code === langCode) ?? languages[0];

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      {status.kind === 'success' && (
        <p className="alert alert-success">
          Thank you! Your order was received. Your card will be printed and shipped to the address
          you entered at checkout.
        </p>
      )}
      {status.kind === 'canceled' && (
        <p className="alert alert-error">Checkout was canceled — nothing was charged.</p>
      )}
      {status.kind === 'error' && <p className="alert alert-error">{status.message}</p>}

      <label className="field">
        Allergy
        <select value={allergenId} onChange={(e) => setAllergenId(e.target.value)}>
          {allergens.map((a) => (
            <option key={a.id} value={a.id}>
              {a.emoji} {a.translations['en'].allergen}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Language (English is always on the back)
        <select value={langCode} onChange={(e) => setLangCode(e.target.value)}>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name} — {l.nativeName}
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
          onChange={(e) => setQuantity(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
        />
      </label>

      <p className="price-note">
        You're ordering: <strong>{allergen.translations['en'].allergen}</strong> card in{' '}
        <strong>{language.name}</strong> × {quantity}. Price and shipping are shown on the secure
        Stripe checkout page. Preview your exact card design on the{' '}
        <a href={`/cards/${allergenId}/${langCode}`}>card page</a> first.
      </p>

      <button type="submit" className="btn btn-primary" disabled={status.kind === 'submitting'}>
        {status.kind === 'submitting' ? 'Redirecting to checkout…' : 'Continue to secure checkout'}
      </button>
    </form>
  );
}
