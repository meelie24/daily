# Lane

Talk to the cars around you. You pull up to a red light, open it, and the other
people running it within a few hundred metres are already there — no room to
join, no usernames, no friend list. Everyone is just their car: **Red Car**,
**Blue SUV**, **White Van**. Say why the jam happened, tell people to turn
around, or vent. Nothing is stored.

One file, no build step, no backend of our own: `traffic/index.html`.

## How it finds the cars near you

1. `watchPosition` gives a fix.
2. The fix is encoded as a **geohash** — a short string naming a map square.
   Precision is fixed at **5** (~4 km square).
3. You publish to your own square's topic and subscribe to **that square plus its
   8 neighbours**, so two cars either side of a square boundary still meet.
4. Anything that arrives is filtered by real distance against your **Range**
   setting (250 m – 2 km) before it reaches the screen.

The precision is deliberately *not* tied to the Range setting. If it were, two
cars parked side by side with different Range settings would compute different
topics and never see each other.

Transport is **MQTT 3.1.1 over a WebSocket**, written by hand (~90 lines) so the
page needs no CDN. QoS 0 only — a chat message that arrives late is worthless.

## The relay is public

The default relays are free public MQTT brokers (EMQX, HiveMQ, Mosquitto, with
automatic failover). **Anyone can subscribe to them.** So:

- Published coordinates are snapped to a **~55 m grid** — a harvester gets a
  block, not a driveway.
- Nothing is sent but colour, shape, coarse position and your text. No name, no
  account, no device id.
- Your handle is random and **regenerates every session**, so no one can build a
  reputation or a grudge against you across drives.
- Point **Relay** at your own broker (`wss://host:port/mqtt`) if you want it
  private.

A **private lane** (any shared word) ignores location entirely and publishes no
coordinates at all — useful for a convoy, or for testing with a friend.

## Safety, and what it cost the design

Using a phone while driving is illegal in most places, red light included. The
app says so on first launch and does not pretend otherwise. What it enforces:

- **Speed gate.** A motion state machine with hysteresis (moving ≥3 m/s, stopped
  <0.5 m/s held 3 s). Free typing is locked while you're moving; only one-tap
  hazard tiles remain.
- **Fails closed.** No fix, a stale fix, poor accuracy, or a backgrounded tab all
  count as *moving*.
- **Green-light interrupt.** Start moving mid-sentence and the composer blanks —
  the draft is held, not lost, and offered back at the next stop.
- **One message at a time while moving**, large, no scrollback, no unread counter.
- **Listen mode.** One tap (on the Road screen or in settings) and incoming
  messages are read aloud via the browser's speech synthesis, so you never look at
  the screen — the safest way to use this while driving. The spoken text is
  clipped, the queue is capped so a burst can't read out minutes of backlog, and
  it degrades silently where the Web Speech API is absent.
- **Quiet.** One tap silences everything — surfacing and speech — with an obvious
  way back, reachable from the driving surface.
- **Parked** is re-armed every session, never persisted, and switches itself off
  the moment you move.

Two deliberate omissions, both about the fact that people can see each other:

- **No bearing or direction, ever.** "The blue car behind you" plus anonymity is
  a targeting reticle. Only coarse distance bands are shown.
- **No replies, no DMs, no @-addressing.** Broadcast to the area or nothing.

De-escalating tiles ("Go ahead — I'll wait", "My bad") sit first and are styled
green, because tile order is a thumb on the scale.

Rate limits and mute are client-side, so they're friction for normal use, not
security. With rotating handles a mute can't follow someone across drives — the
direct cost of nobody being able to target you either.

## Design — "Obsidian & Lime"

Dark-mode-first glassmorphism, adapted from a web design system to a phone:

- **Obsidian base** (`#000` viewport, `#0c0c0c` surfaces) with a single neon lime
  accent (`#ccff00`) and emerald (`#10b981`) for de-escalating actions only.
- **Space Grotesk** headings at `-0.06em` tracking with an italic lime-to-white
  gradient span; **JetBrains Mono** for every technical label, uppercase and
  tracked out to `0.2em`.
- **Glass** is `rgba(255,255,255,.03)` over a 16px backdrop blur with a 1px
  white/10 hairline. Corners are ≥2rem everywhere.
- A 60px architectural grid, a grain veil, and two blurred glow spheres keep the
  dark from going flat.
- **Floating shell**: content rides in a rounded 2.5rem panel above the black
  viewport, and the composer + tab bar float together as one glass slab.

Three deliberate departures, all for legibility or safety:

- **The driving surface is not glass.** While you're moving, the message panel
  and the locked notice render solid black with pure-white type at 1.7rem. Blur
  and 60%-opacity text are fine when parked and wrong at 30mph.
- **The grain is a plain veil, not `mix-blend-mode: overlay`.** Overlay drags
  saturated accents toward mid-grey and the lime has to stay exact.
- **Swatch labels pick their own ink** by relative luminance (crossover at
  L=0.179), so every one of the 16 car colours clears 4.7:1.

Touch targets are ≥44px throughout, including the mono-labelled tab bar.

## Hardening pass

A five-dimension audit (security, safety, UX, network, a11y/perf) with adversarial
verification of the high-severity findings drove a round of fixes:

- **Critical XSS closed.** A hostile peer id could break out of the Mute button's
  inline handler and run code that read your *precise* location. `esc()` now
  escapes the apostrophe, and the Mute button is a delegated `data-id` handler, so
  wire data never reaches an executable context at all.
- **Radius bypass closed.** A peer sending zero/absent coordinates used to skip the
  distance gate and appear as local traffic anywhere. Unlocatable peers are now
  dropped in public mode.
- **Flood defence.** The peer set is capped, ids are length-bounded, heartbeats are
  de-duplicated, oversized frames are rejected, and repaints are coalesced to one
  per frame — so a hostile broker flood can't freeze the tab.
- **Dead-socket detection.** The client now tracks last-received bytes and tears
  down a silently half-open socket (tunnel, dead zone, IP change) instead of
  showing "connected" into a void. Plus a CONNACK timeout, backoff that survives
  broker rotation, and reconnect-on-foreground.
- **Driving surface, per the safety brief.** No unread badge or ping while moving;
  the read card truncates and updates at most once every 5s so a burst can't strobe
  it; hazard tiles are a fixed grid (no scrolling for all of them); a one-tap
  **Quiet** control silences everything; a stationary new user sees "Finding you…"
  instead of "You're moving."
- **Accessibility.** Pinch-zoom unblocked, real button + aria-label on the status
  chip and send button, `role="switch"` on toggles, `aria-pressed`/`aria-current`
  on chips and nav, a live-region toast, a screen-reader announcer for incoming
  messages, focus outlines, and 44px touch targets. Information-bearing muted text
  moved above the 4.5:1 contrast floor.
- **Also:** message timestamps, GPS-denied retry, location priming before the
  permission prompt, a home-screen icon + no more phantom PWA claim, GPS watch
  paused while backgrounded, and no peer-list wipe on GPS jitter.

Deliberately **not** changed (product calls, not defects): free typing stays
allowed when stopped (canned-only would be safer but isn't what this is);
`Cops ahead` ships without jurisdiction gating; there's no server, so no
cross-session bans or content ML. (The hands-free TTS "listen" mode flagged here
as the main thing worth building has since been built — see Listen mode above.)

## Testing it

It needs two devices; it will not invent traffic that isn't there.

- **Same place:** open it on two phones at the same light.
- **Anywhere:** set the same **private lane** word on both.
- **Locally:** serve the repo and open two browser windows.

## Files

| Path | What |
|---|---|
| `traffic/index.html` | The whole app |
| `index.html` | Unrelated app already in this repo, untouched |
