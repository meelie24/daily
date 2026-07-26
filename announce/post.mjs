#!/usr/bin/env node
/* Posts the next due item from announce/queue.json to X, as one account, from CI.
 *
 * Zero dependencies on purpose: Node has fetch and node:crypto, and the whole
 * repo's premise is that you can read the thing that runs. Adding an SDK here
 * would mean a lockfile and a supply chain for what is about a hundred lines of
 * HMAC.
 *
 * It will not post unless it is told to twice: the four credentials have to be
 * present AND ANNOUNCE_LIVE has to be "true". Anything less prints what it would
 * have sent and exits clean, so merging this arms nothing.
 *
 *   node announce/post.mjs            dry run, always
 *   node announce/post.mjs --live     post, if the environment also allows it
 *   node announce/post.mjs --selftest crypto and counting checks, no network
 */
import { createHmac, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const QUEUE = join(HERE, 'queue.json');
const STATE = join(HERE, 'state.json');

/* X wraps every link in t.co, so a URL costs a flat 23 characters no matter how
   long it is, and there is no point shortening one by hand. */
const URL_COST = 23;
const MAX_LEN = 280;
/* At most this many posts per queue item. Pay-per-use bills each call, so an
   accidental hundred-post thread should fail the pre-flight, not the invoice. */
const MAX_THREAD = 5;

/* ------------------------------------------------------------------ encoding */

/* RFC 3986 percent-encoding. encodeURIComponent leaves ! ' ( ) * alone, which
   OAuth does not, and a signature computed over the wrong escaping fails with a
   401 that says nothing about why. */
const pct = s => encodeURIComponent(String(s)).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

/* ------------------------------------------------------------------ OAuth 1.0a */

/* The signature base string covers the method, the URL and the OAuth parameters
   plus any query parameters. It does NOT cover the request body unless that body
   is form-encoded (RFC 5849 3.4.1.3.1). Ours is JSON, so the body stays out.
   Signing the JSON body is the single most common way to get this wrong. */
function signatureBaseString(method, url, params) {
  const u = new URL(url);
  const base = `${u.protocol}//${u.host}${u.pathname}`;   // no query, no fragment, no default port
  const all = { ...params };
  for (const [k, v] of u.searchParams) all[k] = v;
  const joined = Object.keys(all)
    .map(k => [pct(k), pct(all[k])])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${method.toUpperCase()}&${pct(base)}&${pct(joined)}`;
}

function oauthHeader({ method, url, consumerKey, consumerSecret, token, tokenSecret, nonce, timestamp }) {
  const params = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce ?? randomBytes(24).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(timestamp ?? Math.floor(Date.now() / 1000)),
    oauth_token: token,
    oauth_version: '1.0',
  };
  const key = `${pct(consumerSecret)}&${pct(tokenSecret)}`;
  const sig = createHmac('sha1', key).update(signatureBaseString(method, url, params)).digest('base64');
  const full = { ...params, oauth_signature: sig };
  return 'OAuth ' + Object.keys(full).sort().map(k => `${pct(k)}="${pct(full[k])}"`).join(', ');
}

/* ------------------------------------------------------------------ counting */

/* X counts most Latin text as one per character and most everything else as two,
   which means a post that fits in 280 JavaScript string units can still be
   rejected. Ranges are twitter-text's weighted config; anything outside them
   weighs double. Emoji are counted as a unit rather than per code point, so a
   family emoji built from ZWJ joins costs 2, not 8. */
const LIGHT = [[0x0000, 0x10ff], [0x2000, 0x200d], [0x2010, 0x201f], [0x2032, 0x2037]];
const isLight = cp => LIGHT.some(([a, b]) => cp >= a && cp <= b);

/* Matches a whole emoji cluster including skin tones, variation selectors and
   ZWJ joins. Falls back to per-code-point counting where Unicode property
   escapes are unavailable. */
let EMOJI = null;
try { EMOJI = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|️⃣?|[\u{E0020}-\u{E007E}]+\u{E007F})?(‍(\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|️⃣?|[\u{E0020}-\u{E007E}]+\u{E007F})?))*/gu; }
catch { EMOJI = null; }

const URL_RE = /https?:\/\/[^\s<>"']+/gi;

export function weightedLength(text) {
  let s = String(text).trim();
  let total = 0;
  // Links first: replace each with a marker so its own characters stop counting.
  s = s.replace(URL_RE, () => { total += URL_COST; return ''; });
  if (EMOJI) s = s.replace(EMOJI, () => { total += 2; return ''; });
  for (const ch of s) total += isLight(ch.codePointAt(0)) ? 1 : 2;
  return total;
}

/* ------------------------------------------------------------------ the API */

const API = 'https://api.x.com/2/tweets';

async function createPost(text, replyTo, creds) {
  const body = replyTo ? { text, reply: { in_reply_to_tweet_id: replyTo } } : { text };
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: oauthHeader({ method: 'POST', url: API, ...creds }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let json = null;
  try { json = JSON.parse(raw); } catch { /* keep raw for the error message */ }
  if (!res.ok) {
    const why = json?.detail || json?.title || json?.errors?.[0]?.message || raw.slice(0, 400);
    throw new Error(`X returned ${res.status}: ${why}`);
  }
  const id = json?.data?.id;
  if (!id) throw new Error(`X returned 200 but no post id: ${raw.slice(0, 400)}`);
  return id;
}

/* ------------------------------------------------------------------ files */

const readJSON = (p, fallback) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return fallback; } };

function due(queue, state, now) {
  for (const item of queue) {
    if (!item?.id || typeof item.text !== 'string') continue;
    if (state.posted?.[item.id]) continue;
    if (item.notBefore && Date.parse(item.notBefore) > now) continue;
    return item;
  }
  return null;
}

/* Every reason a post is unsendable, gathered before anything is sent, so a
   thread never goes out half-finished because post 3 was too long. */
function preflight(item) {
  const parts = [item.text, ...(item.replies || [])];
  const bad = [];
  if (parts.length > MAX_THREAD) bad.push(`thread is ${parts.length} posts, cap is ${MAX_THREAD}`);
  parts.forEach((t, i) => {
    if (typeof t !== 'string' || !t.trim()) bad.push(`post ${i + 1} is empty`);
    else {
      const n = weightedLength(t);
      if (n > MAX_LEN) bad.push(`post ${i + 1} is ${n} weighted characters, ${n - MAX_LEN} over`);
    }
  });
  return bad;
}

/* ------------------------------------------------------------------ selftest */

function selftest() {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => c ? (pass++, console.log('  ok   ' + n)) : (fail++, console.log('  FAIL ' + n + (x === undefined ? '' : ' ' + JSON.stringify(x))));

  console.log('-- percent-encoding --');
  ok('escapes the sub-delims encodeURIComponent leaves alone', pct("!'()*") === '%21%27%28%29%2A', pct("!'()*"));
  ok('leaves the unreserved set alone', pct('aZ0-._~') === 'aZ0-._~', pct('aZ0-._~'));
  ok('encodes a space as %20, not +', pct('a b') === 'a%20b', pct('a b'));

  console.log('\n-- signature, against the published worked example --');
  // The long-standing Twitter OAuth worked example. If this reproduces to the
  // byte, the encoding, sorting, base-string and key construction are all right;
  // there is no way to hit it by accident.
  const params = {
    include_entities: 'true',
    status: 'Hello Ladies + Gentlemen, a signed OAuth request!',
    oauth_consumer_key: 'xvz1evFS4wEEPTGEFPHBog',
    oauth_nonce: 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: '1318622958',
    oauth_token: '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb',
    oauth_version: '1.0',
  };
  const bs = signatureBaseString('POST', 'https://api.twitter.com/1.1/statuses/update.json', params);
  const expectBase = 'POST&https%3A%2F%2Fapi.twitter.com%2F1.1%2Fstatuses%2Fupdate.json&include_entities%3Dtrue%26oauth_consumer_key%3Dxvz1evFS4wEEPTGEFPHBog%26oauth_nonce%3DkYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1318622958%26oauth_token%3D370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb%26oauth_version%3D1.0%26status%3DHello%2520Ladies%2520%252B%2520Gentlemen%252C%2520a%2520signed%2520OAuth%2520request%2521';
  ok('base string matches byte for byte', bs === expectBase, bs === expectBase ? '' : { got: bs });
  const sig = createHmac('sha1', `${pct('kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw')}&${pct('LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE')}`).update(bs).digest('base64');
  ok('signature matches the published value', sig === 'hCtSmYh+iHYCEqBWrE7C7hYmtUk=', sig);

  console.log('\n-- base string construction --');
  ok('drops the query string from the base URL but keeps its params',
     signatureBaseString('POST', 'https://api.x.com/2/tweets?a=1', { oauth_nonce: 'n' })
       === 'POST&' + pct('https://api.x.com/2/tweets') + '&' + pct('a=1&oauth_nonce=n'));
  ok('uppercases the method', signatureBaseString('post', 'https://x.test/a', {}).startsWith('POST&'));
  ok('sorts parameters by encoded key',
     signatureBaseString('GET', 'https://x.test/a', { b: '1', a: '2' }).endsWith(pct('a=2&b=1')));

  console.log('\n-- the header --');
  const h = oauthHeader({ method: 'POST', url: API, consumerKey: 'ck', consumerSecret: 'cs', token: 'tk', tokenSecret: 'ts', nonce: 'n', timestamp: 1 });
  ok('starts with the scheme', h.startsWith('OAuth '), h.slice(0, 12));
  ok('carries a signature', /oauth_signature="[^"]+"/.test(h));
  ok('quotes every value', h.slice(6).split(', ').every(p => /^[a-z_]+="[^"]*"$/.test(p)), h);
  ok('two calls use different nonces',
     oauthHeader({ method: 'POST', url: API, consumerKey: 'ck', consumerSecret: 'cs', token: 'tk', tokenSecret: 'ts' })
       !== oauthHeader({ method: 'POST', url: API, consumerKey: 'ck', consumerSecret: 'cs', token: 'tk', tokenSecret: 'ts' }));

  console.log('\n-- weighted length --');
  ok('plain ASCII counts one each', weightedLength('hello') === 5, weightedLength('hello'));
  ok('280 ASCII characters fit exactly', weightedLength('a'.repeat(280)) === 280);
  ok('surrounding whitespace is trimmed', weightedLength('  hi  ') === 2, weightedLength('  hi  '));
  ok('a short link still costs 23', weightedLength('https://a.co') === URL_COST, weightedLength('https://a.co'));
  ok('a long link costs the same 23', weightedLength('https://example.com/' + 'x'.repeat(300)) === URL_COST);
  ok('text plus a link adds up', weightedLength('see: https://a.co') === 5 + URL_COST, weightedLength('see: https://a.co'));
  ok('CJK counts double', weightedLength('日本語') === 6, weightedLength('日本語'));
  ok('an emoji counts as two', weightedLength('🚗') === 2, weightedLength('🚗'));
  ok('a ZWJ family is still one emoji', weightedLength('👨‍👩‍👧‍👦') === 2, weightedLength('👨‍👩‍👧‍👦'));
  ok('a flag is one emoji', weightedLength('🇬🇧') === 2, weightedLength('🇬🇧'));
  ok('an en dash is in the light range', weightedLength('–') === 1, weightedLength('–'));

  console.log('\n-- preflight --');
  ok('passes a sane item', preflight({ text: 'hello', replies: ['world'] }).length === 0);
  ok('catches an over-length post', preflight({ text: 'a'.repeat(281) }).length === 1);
  ok('reports which post in the thread is too long',
     preflight({ text: 'ok', replies: ['b'.repeat(300)] })[0].includes('post 2'));
  ok('catches an empty post', preflight({ text: '   ' }).length === 1);
  ok('caps thread length', preflight({ text: 'a', replies: ['b', 'c', 'd', 'e', 'f'] }).some(m => m.includes('cap')));

  console.log('\n-- picking what is due --');
  const q = [
    { id: 'a', text: 'one' },
    { id: 'b', text: 'two', notBefore: '2030-01-01T00:00:00Z' },
    { id: 'c', text: 'three' },
  ];
  ok('takes the first unposted item', due(q, { posted: {} }, Date.parse('2026-01-01'))?.id === 'a');
  ok('skips what is already posted', due(q, { posted: { a: {} } }, Date.parse('2026-01-01'))?.id === 'c');
  ok('respects notBefore', due(q, { posted: { a: {} } }, Date.parse('2031-01-01'))?.id === 'b');
  ok('returns nothing when the queue is drained', due(q, { posted: { a: {}, b: {}, c: {} } }, Date.parse('2031-01-01')) === null);
  ok('ignores malformed entries', due([{ text: 'no id' }, { id: 'x', text: 'fine' }], { posted: {} }, 0)?.id === 'x');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

/* ------------------------------------------------------------------ main */

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) return selftest();

  const queue = readJSON(QUEUE, []);
  const state = readJSON(STATE, { posted: {} });
  state.posted ||= {};

  const item = due(queue, state, Date.now());
  if (!item) { console.log('nothing due'); return; }

  const problems = preflight(item);
  const parts = [item.text, ...(item.replies || [])];
  console.log(`next up: ${item.id}`);
  parts.forEach((t, i) => console.log(`  [${i + 1}/${parts.length}] ${weightedLength(t)}/${MAX_LEN}  ${JSON.stringify(t.slice(0, 90))}`));
  if (problems.length) {
    console.error('will not send:\n  ' + problems.join('\n  '));
    process.exit(1);
  }

  const creds = {
    consumerKey: process.env.X_API_KEY,
    consumerSecret: process.env.X_API_SECRET,
    token: process.env.X_ACCESS_TOKEN,
    tokenSecret: process.env.X_ACCESS_SECRET,
  };
  const haveCreds = Object.values(creds).every(v => v && v.length > 4);
  const armed = process.env.ANNOUNCE_LIVE === 'true';
  const asked = argv.includes('--live');

  if (!(asked && armed && haveCreds)) {
    console.log(`\ndry run, nothing sent. --live:${asked} ANNOUNCE_LIVE:${armed} credentials:${haveCreds}`);
    return;
  }

  // Each call is billed, so a thread that dies half way records what did go out
  // rather than replaying the whole thing on the next run.
  const ids = [];
  try {
    for (const text of parts) {
      const id = await createPost(text, ids.at(-1), creds);
      ids.push(id);
      console.log(`  posted ${id}`);
    }
  } finally {
    if (ids.length) {
      state.posted[item.id] = { ids, at: new Date().toISOString(), complete: ids.length === parts.length };
      writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
      console.log(`recorded ${ids.length}/${parts.length} in state.json`);
    }
  }
}

main().catch(e => { console.error(String(e.message || e)); process.exit(1); });
