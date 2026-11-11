/**
 * The only thing that knows the Gemini key for the Claims Tracker.
 *
 * The browser used to call Google directly with a key hardcoded in index.html,
 * which is public. Now the key is a Supabase secret (CLAIMS_GEMINI_API_KEY) and
 * this function is the only path to it.
 *
 * Every request must carry a valid Supabase session AND pass
 * has_app_access('claims-tracker'), the same grant the database checks on the
 * claims table. The model is fixed here, not chosen by the caller.
 *
 * Deploy: Actions -> "Deploy Supabase function" in this repo.
 * Secret: Supabase Dashboard -> Edge Functions -> Secrets -> CLAIMS_GEMINI_API_KEY
 */

const MODEL = 'gemini-3.5-flash-lite';
const GOOGLE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const APP = 'claims-tracker';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const GEMINI_KEY = Deno.env.get('CLAIMS_GEMINI_API_KEY') ?? '';

const MAX_BASE64 = 10_000_000; // ~7.5 MB image
const MAX_PROMPT = 8_000;
const MIME_OK = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']);

const CORS = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

// Shaped like Google's errors so the page reports both the same way.
const fail = (status: number, message: string) => reply(status, { error: { message } });

async function whoIs(token: string): Promise<boolean> {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return false;
  const u = await r.json();
  return !!u?.id;
}

async function hasAccess(token: string): Promise<boolean> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_app_access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ app_name: APP }),
  });
  if (!r.ok) throw new Error(`has_app_access failed (${r.status})`);
  return (await r.json()) === true;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (request.method !== 'POST') return fail(405, 'Method not allowed.');
  if (!GEMINI_KEY) return fail(500, 'The scanning key is not configured on the server.');

  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return fail(401, 'Sign in again. This request carried no session.');
  if (!(await whoIs(token))) return fail(401, 'Your session has expired. Sign in again.');

  try {
    if (!(await hasAccess(token))) return fail(403, 'This account does not have access to this app.');
  } catch {
    return fail(503, 'Could not check your access. Try again in a moment.');
  }

  let body: { prompt?: string; mime_type?: string; data?: string };
  try {
    body = await request.json();
  } catch {
    return fail(400, 'Request body must be JSON.');
  }
  const { prompt, mime_type, data } = body;
  if (typeof prompt !== 'string' || !prompt || prompt.length > MAX_PROMPT) return fail(400, 'Bad prompt.');
  if (typeof mime_type !== 'string' || !MIME_OK.has(mime_type)) return fail(400, 'Unsupported image type.');
  if (typeof data !== 'string' || !data || data.length > MAX_BASE64) return fail(413, 'Image is too large.');

  const upstream = await fetch(GOOGLE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type, data } }] }],
    }),
  });
  // Pass Google's JSON (including its errors) straight through.
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
