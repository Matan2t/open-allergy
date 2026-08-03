/**
 * Cloudflare Worker entry point. Static site assets (the Astro build in
 * ./dist) are served by the assets layer; this Worker only receives /api/*
 * requests (see `run_worker_first` in wrangler.jsonc).
 */
import { handleCheckout, type CheckoutEnv } from './checkout';

interface Env extends CheckoutEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/checkout') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', Allow: 'POST' },
        });
      }
      return handleCheckout(request, env);
    }

    // Anything else routed here falls through to the static assets.
    return env.ASSETS.fetch(request);
  },
};
