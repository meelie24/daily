# The announcer

Posts the next due item from `queue.json` to one X account, on a schedule, from
GitHub Actions. About 250 lines with no dependencies, because it's mostly HMAC
and a length check and neither of those is worth a lockfile.

It is inert until you deliberately arm it. Merging it posts nothing.

## What it does

Every hour it reads `queue.json`, finds the first item that hasn't been posted
and whose `notBefore` has passed, checks it will fit, and sends it. A thread goes
out as a post plus self-replies, each chained to the one before. What went out is
written to `state.json` and committed back, so a rerun can't send it twice.

Only one queue item per run. If a thread dies half way, `state.json` records the
posts that did land and marks the item `complete: false` rather than replaying
the whole thing.

## Why the link is never in the first post

X demotes posts that carry a link, by a lot. So the hook goes in the post and the
link goes in the first self-reply. That's why `queue.json` is shaped as `text`
plus `replies` rather than one blob.

## Turning it on

You need an X developer account, a project, an app with **Read and write**
permission, and the four OAuth 1.0a credentials from that app.

1. **Settings → Secrets and variables → Actions → Secrets**, add four:
   `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`.
2. Same page, **Variables** tab, add `ANNOUNCE_LIVE` = `true`.

Both are required. Credentials alone won't post, and the variable alone won't
either. That's deliberate: you can add the secrets, watch a dry run in the
Actions log, and only then flip the variable.

To turn it off again, set `ANNOUNCE_LIVE` to anything other than `true`. The
workflow keeps running and keeps reporting what it would have sent.

## The cost

X discontinued the free tier for new developers in February 2026 and moved to
pay-per-use, so posting through the API is no longer free. Check the current rate
on X's developer pricing page before you arm this. A three-post thread is three
billed calls, and the launch queue as it stands is seven posts in total.

If that isn't worth it, delete `.github/workflows/announce.yml` and post by hand
from `../traffic/LAUNCH.md`, which has the same copy in it. Nothing else depends
on this directory.

## Editing the queue

```json
{
  "id": "unique-and-never-reused",
  "notBefore": "2026-08-02T17:00:00Z",
  "text": "the post",
  "replies": ["first self-reply", "second"]
}
```

`id` is what `state.json` keys on, so changing an id after something has posted
will post it again. `notBefore` is UTC and may be `null`. `replies` may be
omitted.

Check it before committing:

```sh
node announce/post.mjs              # what would go out, with weighted lengths
node announce/post.mjs --selftest   # signing and counting, no network
```

The length shown is X's weighted count, not the string length: most non-Latin
characters cost 2, an emoji costs 2 however many code points it's built from, and
any link costs a flat 23 no matter how long it is.

## Things that will bite you

* **Scheduled workflows stop after 60 days of no repository activity.** GitHub
  disables them and emails you. Push anything to wake it up.
* **Cron is approximate.** A `:05` schedule can land ten or twenty minutes late
  when Actions is busy. If a post has to hit a specific minute, use **Run
  workflow** by hand.
* **The state commit needs push access to the default branch.** If that branch is
  protected, either allow the Actions bot through or drop the last step and lose
  the double-post protection.
* **Times in `queue.json` are UTC.** So is the Lane Hour. Your local clock isn't.

## One account

This posts as a single account that says what it is. Running several accounts
that look like different people to push the same thing is coordinated
inauthentic behaviour, and platforms ban the whole cluster when they find it,
which they do. The scheduling here exists so you don't have to be awake at 19:00
UTC, not so you can look like more people than you are.
