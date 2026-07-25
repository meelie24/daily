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
