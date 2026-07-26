# Launching Lane

Lane has a cold-start problem that no amount of reach fixes. One person opening
it alone in a jam gets an empty room and never comes back, so a thousand
scattered signups is a failure and forty people in one car park is a success.
Everything below is aimed at density rather than numbers.

## The mechanic

The Lane Hour is the thing to post about, not the app in the abstract. It's one
room, at 19:00 UTC every day, for everyone who opens Lane in that hour. Location
is ignored inside it, so it works whether people are in the same jam or on
different continents.

That's the whole pitch: **you don't have to find someone near you, you just have
to turn up at the same time.** Without it the honest answer to "what happens when
I open this" is "probably nothing", and people can tell.

Post before it starts, not after. An hour's notice, then a reminder at ten
minutes.

## Where the cars actually sit still

In rough order of how well they work:

* **Stadium and arena car parks at kick-out.** Thousands of people, stationary,
  bored, phone already in hand, all with the same thing to complain about.
* **Ferry and border queues.** Dover, Holyhead, Cairnryan. Operation Brock when
  it's running. People are stuck for hours and there's real information worth
  passing back down the line.
* **Festival and show car parks.** Same shape as football, longer.
* **A motorway closure while it's happening.** The local traffic groups on
  Facebook light up within minutes of one. That's the moment Lane is genuinely
  more useful than anything else on the phone, and it's the only time cold
  outreach isn't an interruption.

Turning up in a local group during an actual closure and saying "I built this,
it might help right now" is a different act from posting the same thing on a
Tuesday. Do the first one.

## X

X suppresses posts with links in them by a wide margin, so the link goes in the
first self-reply, not the post.

**Post:**

> I built a thing for when you're stuck at a red light.
>
> Everyone around you who has it open shows up. No names, no accounts. You're
> just your car. Red Car, Blue SUV, White Van.
>
> You type, everyone within a few hundred metres sees it. Nothing is saved.

**First reply:**

> It's a single web page, nothing to install: <link>
>
> Typing locks itself while you're moving, so it's a red-light and traffic-jam
> thing rather than a driving thing.

**Second reply, if you want it:**

> The problem with proximity chat is being the only one there. So there's one
> room at 19:00 UTC every day that ignores location entirely. Turn up then and
> there'll be other people.

Say you built it. An account posting about a product it doesn't admit to owning
is the thing that gets accounts banned, and it reads as dishonest even when it
works.

## Reddit

Reddit punishes anything that looks like marketing, and rewards the same
information delivered as a person talking. Pick subreddits where the traffic is
the topic, read their self-promotion rules first, and post once.

**Title:** I made a web page that lets you talk to the cars around you at a red
light

**Body:**

> Sat in the same jam on the A2 for the third time this month with no idea what
> was ahead, and it occurred to me that everyone around me knew something I
> didn't and there was no way to ask.
>
> So: it's one web page. It finds people near you who also have it open and puts
> you in the same conversation. Nobody has a username. You're identified by your
> car colour and shape, which is the only thing anyone can see anyway.
>
> Free typing locks itself when you're moving above walking pace and only
> one-tap hazard buttons stay available, because I didn't want to build a reason
> to look at your phone at 70. There's a read-aloud mode for the same reason.
>
> Nothing is stored anywhere. It runs on a public relay, which the app says
> plainly rather than pretending it's encrypted.
>
> The obvious problem is that it's useless if you're the only one with it, so
> there's a fixed hour every day where everyone lands in the same room
> regardless of location.
>
> <link>

## Hacker News

Show HN wants the technical decision, not the product.

**Title:** Show HN: Lane – proximity chat for cars in traffic, in one HTML file

**Body:**

> One file, no build step, no backend of mine. Position becomes a geohash and
> the geohash is the chat room; you subscribe to your own cell plus the eight
> around it so two cars either side of a boundary still find each other.
> Transport is MQTT over WebSocket, hand-written in about 90 lines so the page
> doesn't pull a CDN.
>
> The geohash precision is deliberately fixed rather than derived from the
> user's range setting. I had it derived at first, which meant two cars parked
> side by side with different range settings published to different topics and
> never saw each other.
>
> Coordinates are rounded to roughly a 55 m grid before they go on the wire, and
> handles rotate whenever you cross a cell, so nobody watching the public broker
> can stitch heartbeats into a trip.
>
> Two things it deliberately doesn't do, both because the users can physically
> see each other: no bearing or direction, only coarse distance bands, and no
> replies or DMs. Broadcast to the area or nothing.
>
> <link>

HN reads the source. The file is the argument, so link the repo in a comment.

## What not to do

Running several accounts that look like different people to push the same thing
is coordinated inauthentic behaviour. It's a ban of the whole cluster on X,
Reddit and TikTok alike, it usually takes the product's domain with it, and
there's no version of it that's worth the downside on something this small. One
account that says what it is.
