# Making money from Lane, in the right order

Researched July 2026. The one-line verdict: drivers pay for road utility, never
for chat, and anonymity kills everything the big chat apps sell. Build value for
a lone user first; there is nothing to monetize while rooms are empty.

## What survives anonymity, and what doesn't

Yik Yak raised about $75M on anonymous hyperlocal social and sold for about $1M.
Discord and Telegram monetize identity: badges, themes, flair, bigger presence.
Lane has no identity to decorate — it resets every session, on purpose — so
cosmetics, profiles, reputation and ads are all dead ends here. Don't build them.

What does transfer, from apps drivers actually pay for (REVER Pro $39.99/yr,
Trucker Path's paid tiers, Telegram Premium's doubled-limits pattern):
capacity and data depth.

## Lane Pro — about $14.99/yr

* **The full road layer.** The free app shows one region's feed; Pro shows the
  lot, plus the rain nowcast strip everywhere. Utility, the thing the
  comparables prove people pay for.
* **Long-life road notes.** 12 hours instead of 2, so a morning warning lasts
  the evening commute.
* **Wider radius.** Hear a bigger stretch of road. Telegram's pattern: paying
  doubles your limits, it never changes who you are.
* **Corridor boost, $1.99 one-off.** Extends tonight's corridor for everyone on
  it — Discord's boost mechanic, aimed at a place rather than a person, which is
  the only kind of visible premium that anonymity permits.

## The payment rail: Polar.sh

Merchant of record, so they handle VAT and sales tax in 60+ countries — for a
solo owner this is the deciding feature. Fees 5% + $0.50 on the free tier, plus
small payout fees.

The no-backend mechanic:

1. The page links out to Polar's hosted checkout.
2. The buyer gets a license key by email; keys support expiry (set one year, so
   renewal works without accounts) and per-device activation limits.
3. The page validates the key with an unauthenticated `POST` to
   `api.polar.sh/v1/customer-portal/license-keys/validate` — designed for public
   clients — and caches the unlock in localStorage.

Be clear-eyed: with the whole app shipped in one readable file, any client-side
gate is an honesty box. Someone can open devtools and flip the flag. At this
scale that's fine, and pretending otherwise would cost a backend for nothing.

Fallback if Polar's CORS disappoints in practice: Gumroad's license verify
endpoint is confirmed CORS-open in their source, but their fees run ~13%.
Lemon Squeezy is winding into Stripe Managed Payments — don't build on it.
Plain Stripe has no unauthenticated verify endpoint at all; it needs a worker.

## Order of operations

1. **Free solo value first** — the road layer and notes, already shipped. The
   app must be worth opening alone before anything is worth paying for.
2. **The Polar gate** — an afternoon's work, once there's something to gate.
3. **The consumable last** — a corridor boost only means something once
   corridors have people on them.

Never on the list: cosmetics, profiles, message history, ads.
