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

One limit worth knowing, because a geohash square keeps a constant span in
degrees and degrees of longitude get shorter towards the poles. At the equator a
square is about 4.9 km wide, at 60° it's 2.4 km, and past roughly **66°** the
nine squares stop covering the full 2 km range from east to west. So above the
Arctic Circle, two cars near the far end of that range on an east-west line can
miss each other. Everywhere with meaningful traffic is well inside it, and the
tests state the bound rather than sampling below it and calling that a pass.

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

## The Lane Hour

Proximity chat has a cold start problem it can't solve on its own. The first
person to open it anywhere is alone, decides it's dead, and doesn't come back.

So there's one room, at 19:00 UTC every day, for everyone. It's an ordinary
shared code (`lane-hour`) that the app knows about, which means location is
ignored inside it and nothing about where you are goes on the wire. The app shows
it in your own local time and offers it where you're already looking at an empty
room, rather than as a banner.

The instant is fixed in UTC deliberately. A room "at 8pm local" would be
twenty-four separate rooms with one person in each, which is the original problem
wearing a hat.

Joining remembers whatever code you were on, so leaving puts you back rather than
quietly switching your position broadcast back on.

## Stickers

Twelve of them, drawn into the file as inline SVG and animated where the
movement says something the still drawing doesn't. Only the index goes on the
wire, so a sticker costs about a byte and arrives instantly on a bad signal.

They aren't from a GIF service, and that isn't laziness. Searching Giphy or
Tenor means an API key and a third-party request on every keystroke, inside an
app whose pitch is that nothing is stored and nobody is watching. It also can't
work here: a GIF runs to megabytes and one MQTT frame is capped at 64 KB.

Every sticker carries a label, which is what Listen mode reads aloud and what a
screen reader announces. It's under the drawing rather than in a tooltip,
because someone glancing at a phone on a dashboard shouldn't have to decode a
picture.

## Taking a message back

Your own messages can be edited or deleted, and it reaches every screen still in
range and listening. It cannot reach someone who has driven off, closed the app,
or already read it, and the app says that rather than implying the message was
retracted.

There is no account here and no signature, so an id on the wire is just a string
a peer typed. If a delete only named whose message to remove, one modified
client could wipe every message in range off everyone's screen. So each message
carries a commitment: 64 bits of SHA-256 over a random nonce only the sender
has. Deleting or editing means revealing the nonce, and every receiver checks it
hashes to the commitment they already stored. Nothing to distribute, no keys, no
identity, and unforgeable without inverting the hash. An edit ships a fresh
commitment, because revealing a nonce spends it.

Retractions carry no coordinates, so they're handled above the proximity gate
that drops unlocated packets. That isn't a hole: the message being retracted
already passed that gate when it arrived, and the proof is still required.

## Voice notes

Twenty seconds, one tap, only while you're stopped. Hit the limit and it sends
itself rather than being thrown away for being long enough.

Length and bitrate are one decision, not two. It all rides in a single MQTT
frame against a 64 KB cap that the JSON shares, and base64 adds a third on top,
so twenty seconds at the 24 kbit/s the six-second version used would have been
80 KB and simply wouldn't have gone out. At 12 kbit/s it's about 40 KB encoded,
and Opus holds up fine down there for speech, which is all anyone records into a
phone on a dashboard.

While you talk there's a live level meter. It's an analyser tapped off the same
MediaStream, not a link in the chain — the recorder is attached to the stream
itself, so nothing in the meter can alter a sample of what gets encoded.

The bars on a sent note are the real waveform, decoded from the audio rather
than drawn for effect, and computed at both ends so nothing extra rides the
wire. Playing one fills the bars up to the playhead.

This is the one part of Lane that isn't anonymous, and the app says so in as many
words before your first recording. It's your actual voice, going out over the
same public relay as everything else, to people who can also see which car it
came from. A voice identifies you far more precisely than a colour and a shape
do. Nothing is disguised, and pretending otherwise would be worse than saying it.

Everything else follows the rules typing already follows. The mic disappears
while you're moving, a green light mid-recording bins the take rather than
sending half a sentence, and Quiet kills playback and recording together. In
Listen mode an incoming note plays itself, since not looking at the screen is the
entire point; outside Listen mode it waits for a tap, because unprompted audio
from a stranger is startling if you didn't ask for it.

Chrome records Opus in WebM and Safari records AAC in MP4, and Safari can't play
the first. Where that happens the bubble says so instead of showing a play button
that does nothing.

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
| `traffic/og.png` | The 1200×630 card the link unfurls as |
| `traffic/DOMAIN.md` | Getting it a real URL, free |
| `traffic/LAUNCH.md` | Where to launch it, and the copy |
| `announce/` | Posts the launch queue to one X account on a schedule |
| `.github/workflows/pages.yml` | Deploys the repo to GitHub Pages on push to main |
| `index.html` | A different app that already lived in this repo, untouched |

The link preview tags in `<head>` are absolute URLs pointing at the GitHub Pages
host. Crawlers don't run JavaScript, so those can't be worked out at load time —
if the app moves, they get edited by hand. `DOMAIN.md` says which ones.
