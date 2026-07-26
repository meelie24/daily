# Lane

Talk to the cars around you.

You pull up to a red light. You open Lane, and the other people running it within
a few hundred metres are already there. Nobody has a username. Everyone is just
their car: Red Car, Blue SUV, White Van. Say why the jam happened, tell people to
turn around, or vent about the guy who cut you up. Nothing is kept.

It's one HTML file, `traffic/index.html`. No build step, no backend of our own.

Live at **https://meelie24.github.io/daily/traffic/**

## How it finds the cars near you

Your GPS fix gets turned into a geohash, which is a short string naming a square
on the map. That square is the chat room. You publish to your own square and
listen to it plus the eight around it, so two cars either side of a boundary
still find each other. Anything that arrives then gets filtered by real distance
against your Range setting, which runs from 250 m to 2 km.

The square size is fixed and deliberately not tied to the Range setting. If it
were, two cars parked side by side with different Range settings would end up in
different rooms and never see each other.

Transport is MQTT over a WebSocket, hand written in about 90 lines so the page
doesn't need a CDN. QoS 0 only, because a chat message that turns up late is
worthless anyway.

## The relay is public

The default relays are free public MQTT brokers. Anyone can subscribe to them, so
Lane is built on that assumption rather than pretending otherwise:

* Published coordinates are rounded to roughly a 55 m grid. A harvester gets a
  block, not a driveway.
* Only colour, shape, coarse position and your text ever go on the wire. No name,
  no account, no device id.
* Your handle is random, and it changes every session and every time you cross
  into a new square, so nobody watching the broker can stitch your heartbeats
  into a whole trip.
* Point **Relay** at your own broker (`wss://host:port/mqtt`) if you want it
  private.

A **shared code** (any word both of you type) ignores location completely and
publishes no coordinates at all. Good for a convoy, or for testing with a friend.

## Safety, and what it cost

Using a phone while driving is illegal in most places, red light included. Lane
says so on first launch instead of implying a loophole. What it actually
enforces:

* **Speed gate.** A motion state machine with hysteresis: moving at 3 m/s or
  more, stopped below 0.5 m/s held for 3 seconds. Free typing locks while you're
  moving and only one-tap hazard tiles remain.
* **Fails closed.** No fix, a stale fix, poor accuracy or a backgrounded tab all
  count as moving.
* **Green light interrupt.** Start moving mid sentence and the composer blanks.
  The draft is held rather than lost, and offered back when you stop.
* **Listen mode.** Incoming messages are read out loud so you never look at the
  screen. On iPhone this only works with the app open and the screen on, because
  iOS suspends speech otherwise, and the app says that rather than promising
  something no web API can deliver.
* **Keep screen awake** stops the phone locking mid drive and taking GPS, the
  socket and speech down with it.
* **Quiet** silences everything in one tap. **Hush** does the same for 15 minutes
  and lifts by itself.
* **Parked** is re armed every session, never persisted, and switches itself off
  the moment you move.

Two things Lane deliberately does not do, both because people can see each other:

* **No bearing or direction, ever.** "The blue car behind you" plus anonymity is
  a targeting reticle. You only get coarse distance bands.
* **No replies, no DMs, no @ mentions.** It's broadcast to the area or nothing.

De-escalating tiles ("Go ahead, I'll wait", "My bad") sit first and are styled
green, because the order of those tiles is a thumb on the scale.

Rate limits and mute run in the browser, so they're friction for normal use
rather than security. With rotating handles a mute can't follow someone across
drives, which is the price of nobody being able to target you either.

## Design

Dark, glassy, one hot accent. Obsidian surfaces on a black viewport, neon lime
for anything you can act on, emerald for the calming tiles. Space Grotesk for
headings at tight tracking, JetBrains Mono for the small technical labels. Glass
panels are a 16px backdrop blur behind a 3% white fill with a hairline border,
and corners are 2rem or more everywhere. A 60px grid, a grain veil and two
blurred glow spheres keep the dark from going flat.

Three places it breaks its own rules, on purpose:

* **The driving surface isn't glass.** While you're moving, the message panel and
  the locked notice are solid black with pure white type at 1.7rem. Blur and 60%
  opacity text are fine parked and wrong at 30 mph.
* **The grain is a plain veil,** not `mix-blend-mode: overlay`, which drags
  saturated accents toward grey. The lime has to stay exact.
* **Swatch labels pick their own ink** by luminance, so all 16 car colours clear
  4.5:1.

Touch targets are 44px or bigger throughout.

## Trying it

You need two devices. It won't invent traffic that isn't there.

* Same place: open it on two phones at the same light.
* Anywhere: set the same shared code on both, or use the invite button, which
  sends a link that drops the other person straight into your code.
* Locally: serve the repo and open two browser windows on `/traffic/`.

## What's here

| Path | What |
|---|---|
| `traffic/index.html` | The whole app |
| `.github/workflows/pages.yml` | Deploys the repo to GitHub Pages on push to main |
| `index.html` | A different app that already lived in this repo, untouched |
