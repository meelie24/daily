# Getting Lane a real URL

Lane lives at `https://meelie24.github.io/daily/traffic/`. That works, but it's a
bad link to hand a stranger: it names someone's GitHub account, it buries the app
two folders deep, and it doesn't look like a product.

**Use Cloudflare Pages.** It's free, it needs no card, and it's the only free
option that also fixes the folder problem. You end up at `https://lane.pages.dev/`
with the app at the bare root.

## Why this and not GitHub Pages

A Pages custom domain attaches to the whole site, not to a folder, and one repo
publishes exactly one site. This repo's root is the GLP-1 app. So on GitHub Pages
the two apps compete for the same root, and promoting `traffic/` takes the other
one offline.

Cloudflare Pages has a per-project **Root directory** setting. Point one project
at `traffic/` and that folder becomes the site root. The GLP-1 app and the
existing `meelie24.github.io/daily/traffic/` URL both keep working untouched,
because GitHub Pages isn't changed at all. Two hosts, same repo, no file moves,
no new repo, no CNAME committed.

## Setting it up

**Make the account.** `dash.cloudflare.com/sign-up`, email and password, confirm
the email. Skip the upsells. Do not add a domain or a zone.

**Make the project.**

1. Sidebar → **Compute (Workers & Pages)** → **Create** → the **Pages** tab →
   **Connect to Git**.
2. **Connect GitHub**, choose **Only select repositories**, pick `meelie24/daily`,
   **Install & Authorize**.
3. Select **daily** → **Begin setup**.
4. **Project name:** `lane`. Read the next section before you type this.
5. **Production branch:** `main`.
6. Expand **Build settings**:
   * **Framework preset:** None
   * **Build command:** leave completely empty
   * **Build output directory:** `/`
   * **Root directory (advanced)** → **Path:** `traffic`

   Don't put `traffic` in both. The output directory resolves *relative to* the
   root directory, so `traffic` plus `traffic` looks for `traffic/traffic` and the
   build fails.
7. **Save and Deploy.** About thirty seconds.

Then check all three: `lane.pages.dev` serves Lane at the root,
`meelie24.github.io/daily/` still serves the GLP-1 app, and
`meelie24.github.io/daily/traffic/` still serves Lane.

## The name is permanent

The `pages.dev` subdomain can't be renamed. Changing it means deleting the
project and creating a new one. The name is also global, so if `lane` is gone
Cloudflare will either error or offer you something like `lane-e5f.pages.dev`.
Never accept the hashed suggestion, it looks like a staging URL. Keep typing
names until one takes cleanly. `lanechat`, `lane-app` and `drivelane` are the
obvious fallbacks.

## Repoint the preview tags

Three absolute URLs in the `<head>` of `index.html`: `canonical`, `og:url` and
`og:image`. They're absolute because crawlers don't run our JS, which also means
nothing catches it if you forget. The card just quietly stops appearing.

```sh
sed -i 's|https://meelie24.github.io/daily/traffic/|https://lane.pages.dev/|g' traffic/index.html
grep -n 'canonical\|og:url\|og:image' traffic/index.html    # expect 3 lines, all the new host
```

The trailing slash matters. Drop it and `og:image` becomes
`https://lane.pages.devog.png`.

Commit and merge to `main`. Cloudflare redeploys on push by itself.

Then text the link to yourself and check the card renders. Facebook and LinkedIn
cache hard and have re-scrape buttons in their sharing debuggers; X usually
expires within a day.

## Worth 20 seconds

Project → **Settings** → **Builds** → **Build watch paths** → include
`traffic/*`. Otherwise every push touching the GLP-1 app rebuilds Lane for
nothing, and the 500 builds a month is an account-wide budget, not a per-project
one.

## What not to use, and why

* **Freenom (.tk, .ml, .ga, .cf, .gq).** Dead. Registrations stopped in 2023 and
  ICANN terminated the accreditation. Listicles still recommend it.
* **js.org.** Alive and well run, but Lane doesn't qualify. The rule is that the
  site must be *directly about* the JavaScript ecosystem; being written in
  JavaScript is explicitly not a qualification, and product pages are named as
  rejections.
* **is-a.dev.** Same eligibility problem, plus a technical dead end: you never
  hold the DNS, so the merged CNAME won't attach to Cloudflare Pages, which
  refuses it with Error 1014.
* **Vercel Hobby.** Free, but the terms restrict it to non-commercial projects.
  Also, Deployment Protection is on by default and serves crawlers a login page,
  so link previews fail outright.
* **Netlify.** Works the same way (Publish directory `traffic`, no build command)
  and commercial use is fine, but new accounts get 300 credits a month and the
  site goes **offline** when they run out. A hard quota is the wrong failure mode
  for a link that only matters when it spreads.
* **thedev.id.** 318 open pull requests and nobody merging.
* **eu.org.** Free forever, but approval takes days to months.

## If you ever buy a real domain

Cloudflare Registrar sells at cost, about $10 to $11 a year for a `.com`. Porkbun
and Namecheap are fine too. Attaching one to the Pages project is a few clicks in
**Custom domains** and Cloudflare handles the certificate.

If instead you attach a domain to **GitHub Pages**, you need the apex records:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |

Plus a CNAME on `www` pointing at `<you>.github.io`. Add all eight apex records;
the IPv6 ones aren't optional when a chunk of mobile networks are IPv6-only, and
those are exactly the people using this.

**On Cloudflare DNS, set them to DNS only, the grey cloud.** Proxying sits in
front of Let's Encrypt's validation, GitHub never sees the challenge answered,
and the certificate silently never issues. You get a settings page stuck on
"certificate in progress" with nothing explaining why. Leave it grey; Pages
already has a CDN in front of it.
