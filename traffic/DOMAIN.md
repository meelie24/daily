# Putting Lane on its own domain

Right now Lane lives at `https://meelie24.github.io/daily/traffic/`. That works,
but it's a bad link to hand to strangers: it names someone's GitHub account, it
buries the app two folders deep, and it doesn't look like a product.

There is one thing to sort out before any of the DNS below matters.

## The repo layout problem, first

A GitHub Pages custom domain attaches to the **whole Pages site**, not to a folder
inside it. This repo publishes its root, and its root is the GLP-1 Companion app.
So if you point `lane.example` at this repo today, you get:

* `lane.example/` → GLP-1 Companion
* `lane.example/traffic/` → Lane

Which is worse than what we have now. Pick one:

**A. Give Lane its own repo (recommended).** Make a new empty repo, put
`index.html` and `og.png` at its root, turn Pages on, attach the domain. `daily`
carries on untouched and both apps keep working. From a clone of this repo:

```sh
mkdir -p ~/lane && cp traffic/index.html traffic/og.png ~/lane/
cd ~/lane && git init -b main && git add -A
git commit -m "Lane"
git remote add origin git@github.com:<you>/lane.git
git push -u origin main
```

Then **Settings → Pages → Build and deployment → Deploy from a branch → `main` /
`(root)`**.

**B. Make Lane the root of this repo.** Move `traffic/index.html` to the repo root
and the GLP-1 app down into a folder. Fewer moving parts, but the GLP-1 app's URL
changes and any existing link to it breaks. Only do this if nobody has that link.

Either way, once Lane is at a site root, edit the four absolute URLs in the
`<head>` of `index.html` — `canonical`, `og:url`, `og:image` — to the new domain.
They are absolute because crawlers don't run our JS, so they can't be worked out
at load time.

## Buying the name

Cloudflare Registrar sells at cost with no first-year-cheap-then-triple trick;
a `.com` is about $10–11/yr. Porkbun and Namecheap are fine too. You do not need
Cloudflare's DNS to use their registrar, and you do not need their registrar to
use their DNS.

Short and sayable beats clever. Someone is going to read this off a phone screen
in a car park.

## DNS

Two records to think about: the apex (`lane.example`) and `www`.

**Apex.** Four A records and four AAAA records, all with host `@`:

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

Add all eight. The IPv6 ones are not optional in 2026 — a chunk of mobile
networks are IPv6-only, and those are exactly the people using this.

**www.** One CNAME, host `www`, value `<you>.github.io` (with the trailing dot if
your provider wants one). Note it's the account subdomain, *not* the full page
URL.

Then in **Settings → Pages → Custom domain**, type the domain and save. That
writes a `CNAME` file into the repo, which is how Pages knows the site answers to
that name. Tick **Enforce HTTPS** once it lets you.

### If you're on Cloudflare DNS, read this bit

Set both records to **DNS only** — the grey cloud, not the orange one. Proxying
sits in front of Let's Encrypt's validation request, GitHub never sees the
challenge answered, and the certificate silently never issues. You get a Pages
settings page stuck on "certificate in progress" with nothing explaining why.

Grey cloud, wait for the cert, and leave it grey. The proxy buys you nothing here
— Pages already has a CDN in front of it.

### Waiting

DNS propagation is usually minutes and occasionally an hour. The certificate is
issued after DNS resolves, so if **Enforce HTTPS** is greyed out, the answer is
almost always "wait longer", not "something is broken". Check what the world
actually sees rather than what your own browser cached:

```sh
dig +short lane.example
dig +short AAAA lane.example
curl -sSI https://lane.example | head -1
```

## After it's live

* Re-check the link preview — paste the URL into a DM to yourself. If the card
  doesn't show, the `og:image` URL is still pointing at the old host.
* Facebook and LinkedIn cache aggressively. Their sharing debuggers have a
  re-scrape button. X caches too but usually expires within a day.
* Keep `meelie24.github.io/daily/traffic/` working if you've already sent it to
  anyone. GitHub redirects the old Pages URL to the custom domain automatically
  once the domain is attached to that same repo; if Lane moved repos, leave a
  one-line redirect stub behind instead.
