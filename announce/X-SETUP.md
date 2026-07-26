# Getting the X account wired up

Zero assumptions. You'll be clicking through two websites and pasting four
strings into GitHub. Twenty minutes if the developer portal is in a good mood.

Nothing here can be automated on your behalf. Signing up means accepting X's
terms as yourself, and passing a phone and anti-bot check that exists precisely
to stop scripts making accounts.

## 1. The account

Go to x.com and sign up. Things worth deciding before you start rather than
after:

* **Handle.** Short, matches the product, no underscores or digits if you can
  help it. You get one shot at the good one.
* **Email.** Use one you can still get into in a year. If the account is worth
  anything later, this is the recovery path.
* **Phone.** X asks for one and will usually make you verify it before the API
  will let you post. A number you actually control.

Fill in the profile properly before posting anything. An egg account posting a
link is indistinguishable from spam, and X's own systems treat it that way.

**Put this in the bio, or something like it:**

> Posts here are scheduled. Built and run by [your name].

That isn't decoration. X's automation rules require an account driven by the API
to make clear that it is one and who's behind it, and a line in the bio is the
accepted way to do it. Do it before the first live run, not after someone
reports you.

## 2. The developer account

1. Go to **developer.x.com** and sign in as the account you just made.
2. Sign up for developer access. It asks what you're building. Answer honestly
   and in one plain sentence: *"Scheduled posts announcing a free web app I
   built. One account, my own content, a few posts a week."* Vague or grandiose
   answers get held up.
3. You'll land in a dashboard with a **Project** and an **App** already created,
   or a button to create them. You need both.

## 3. Set the app to Read and write

This is the step everyone gets wrong, and its failure looks like a bug rather
than a setting.

1. Open your App → **User authentication settings** → **Set up** (or **Edit**).
2. **App permissions**: choose **Read and write**.
3. **Type of App**: **Web App, Automated App or Bot**.
4. It demands a **Callback URI** and a **Website URL** even though a
   single-account poster never uses the callback. Put anything valid:
   * Callback URI: `https://meelie24.github.io/daily/traffic/`
   * Website URL: `https://meelie24.github.io/daily/traffic/`
5. Save.

## 4. Get the four credentials

App → **Keys and tokens**.

| Portal calls it | Copy it into |
|---|---|
| API Key | `X_API_KEY` |
| API Key Secret | `X_API_SECRET` |
| Access Token | `X_ACCESS_TOKEN` |
| Access Token Secret | `X_ACCESS_SECRET` |

**Generate the Access Token and Secret AFTER you set Read and write in step 3.**
A token remembers the permission level it was born with. If you made it while the
app was Read-only, it stays Read-only forever, and the poster fails with a 403
that talks about permissions while the portal cheerfully shows "Read and write".
If in doubt, hit **Regenerate** on the token pair. It costs nothing.

Each secret is shown once. Copy them straight into step 5.

## 5. Put them in the repo

GitHub → your repo → **Settings** → **Secrets and variables** → **Actions**.

On the **Secrets** tab, **New repository secret**, four times, using the exact
names in the table above.

Leave the **Variables** tab alone for now.

## 6. Watch it not post

**Actions** → **Announce** → **Run workflow**.

It should print the next queue item with a weighted character count and a price
per post, then say `dry run, nothing sent`. That's correct. It won't post until
you do step 7.

If it fails here, the message will say which of the four credentials is missing
or wrong.

## 7. Add the money

X discontinued the free tier for new developers in February 2026. Posting through
the API costs $0.015 a post, or $0.20 if the post contains a link, and the
minimum credit top-up is $25.

In the developer console, add credit. Set a monthly spend cap while you're there.
The whole launch queue is about $0.48, so the $25 is the entry price rather than
the running cost.

If you'd rather not spend it: skip this and step 8 entirely, and post by hand
from `../traffic/LAUNCH.md`, which has the same copy. Delete
`.github/workflows/announce.yml` and nothing else changes.

## 8. Arm it

Same GitHub settings page, **Variables** tab this time. **New repository
variable**, name `ANNOUNCE_LIVE`, value `true`.

Run the workflow again. This time it posts.

To disarm, set that variable to anything else. The workflow keeps running and
keeps telling you what it would have sent.

## When the first live run half-works

The queue posts a thread: hook first, link in the self-reply. X restricted
programmatic replies in February 2026 and it isn't publicly settled whether
replying to your own post is exempt.

So the first run is the test. If the reply comes back 403 the script says so
explicitly, records the post that did land, and stops. Two ways on, neither
needing a code change:

* Post the reply by hand from the app. The restriction is on the API, not you.
* Edit `queue.json`: move the link into `text` and delete that item's `replies`.
  One call, always works, costs $0.20 and takes the reach hit.

## Things that will waste your afternoon

* **403 mentioning permissions** — the access token predates the Read and write
  change. Regenerate it.
* **403 about duplicate content** — X won't take the same text twice. Edit the
  queue item; don't rerun it.
* **401** — a credential is wrong or was regenerated after you copied it. All
  four have to come from the same app.
* **Scheduled workflows stop after 60 days of repository inactivity.** GitHub
  disables them and emails you.
* **Cron is approximate.** `:05` can land twenty minutes late. For a post that
  has to hit a specific minute, use **Run workflow** by hand.
