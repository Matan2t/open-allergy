/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for a plastic card order. The card
 * configuration (allergen, language, personalization) is attached as session
 * metadata, so the Stripe Dashboard's list of paid sessions doubles as the
 * fulfillment queue - no database needed.
 *
 * Required environment variables (set on the Cloudflare Workers project under
 * Settings -> Variables and Secrets):
 *   STRIPE_SECRET_KEY  Stripe secret key
 *   CARD_PRICE_CENTS   price per card in cents, e.g. "900"
 *   SITE_URL           public site URL, e.g. "https://open-allergy.example.workers.dev"
 */

export interface CheckoutEnv {
  STRIPE_SECRET_KEY?: string;
  CARD_PRICE_CENTS?: string;
  SITE_URL?: string;
}

interface OrderRequest {
  allergen?: string;
  lang?: string;
  personalName?: string;
  quantity?: number;
}

const ID_PATTERN = /^[a-z][a-z0-9-]{0,30}$/;
const LANG_PATTERN = /^[a-z][a-z0-9-]{1,40}$/;

// Countries we can realistically ship to from the manual fulfillment queue.
const SHIPPING_COUNTRIES = [
  'US', 'CA', 'GB', 'IE', 'AU', 'NZ',
  'IL', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
  'GR', 'HU', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'CH', 'NO', 'JP', 'SG',
];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleCheckout(request: Request, env: CheckoutEnv): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY || !env.CARD_PRICE_CENTS) {
    return json({ error: 'orders_not_configured' }, 503);
  }

  let order: OrderRequest;
  try {
    order = (await request.json()) as OrderRequest;
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const allergen = order.allergen ?? '';
  const lang = order.lang ?? '';
  const personalName = (order.personalName ?? '').trim().slice(0, 40);
  const quantity = Math.floor(Number(order.quantity ?? 1));

  if (!ID_PATTERN.test(allergen)) return json({ error: 'Invalid allergen.' }, 400);
  if (!LANG_PATTERN.test(lang)) return json({ error: 'Invalid language.' }, 400);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10) {
    return json({ error: 'Quantity must be between 1 and 10.' }, 400);
  }

  const priceCents = Number(env.CARD_PRICE_CENTS);
  if (!Number.isInteger(priceCents) || priceCents < 50) {
    return json({ error: 'orders_not_configured' }, 503);
  }

  const siteUrl = (env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, '');
  const productName = `Plastic allergy card - ${allergen} (${lang.toUpperCase()} + EN)`;

  // Stripe's API takes form-encoded bodies; calling it directly via fetch
  // keeps the function dependency-free.
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', `${siteUrl}/order?success=true`);
  params.set('cancel_url', `${siteUrl}/order?canceled=true`);
  params.set('line_items[0][quantity]', String(quantity));
  params.set('line_items[0][price_data][currency]', 'usd');
  params.set('line_items[0][price_data][unit_amount]', String(priceCents));
  params.set('line_items[0][price_data][product_data][name]', productName);
  params.set(
    'line_items[0][price_data][product_data][description]',
    'Durable double-sided plastic card, credit-card size (85.6 x 54 mm).'
  );
  params.set('metadata[allergen]', allergen);
  params.set('metadata[lang]', lang);
  params.set('metadata[personal_name]', personalName);
  params.set('metadata[quantity]', String(quantity));
  SHIPPING_COUNTRIES.forEach((country, i) => {
    params.set(`shipping_address_collection[allowed_countries][${i}]`, country);
  });

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const session = (await stripeRes.json()) as { url?: string; error?: { message?: string } };

  if (!stripeRes.ok || !session.url) {
    console.error('Stripe error:', session.error?.message);
    return json({ error: 'Payment provider error. Please try again later.' }, 502);
  }

  return json({ url: session.url });
}
