# AI Money Tools — New Site Setup Guide

A complete static website: **25 live, working tools** on their own SEO-optimized pages, glassmorphism design, mobile responsive, AdSense-ready. No database, no backend — works on any hosting.

## 1. What's in this package

```
index.html                 Homepage (tool grid, filters, UK/US comparison, FAQ)
tools/                     25 tool pages — every tool live and working
about.html, contact.html   Company pages (required for AdSense approval)
privacy-policy.html        Privacy policy incl. AdSense/cookie disclosures
terms.html, disclaimer.html
404.html                   Not-found page
assets/css/style.css       Glassmorphism design system
assets/js/main.js          Region toggle, menus, FAQ, copy/print helpers
assets/js/taxdata.js       ⚠️ ALL tax thresholds live here — update yearly
sitemap.xml, robots.txt    SEO files (already pointing at aimoneytools.pro)
ads.txt                    AdSense ads.txt template
```

## 2. Deploy (replace the old site)

Upload **everything in this folder** to your web root (public_html / www) via your host's file manager or FTP, replacing the old files. That's it — no build step, no server config.

- cPanel hosting: upload the zip → Extract into `public_html`.
- Netlify/Vercel/Cloudflare Pages: drag the folder in, set custom domain `aimoneytools.pro`.
- Set your 404 page to `404.html` (cPanel: Error Pages, or `.htaccess`: `ErrorDocument 404 /404.html`).

Then in **Google Search Console** → Sitemaps → submit `https://aimoneytools.pro/sitemap.xml` and use "URL inspection → Request indexing" on the homepage so Google re-crawls the new site quickly.

## 3. AdSense setup (3 steps)

The site ships with ad placements already positioned on every page (top, mid-content, bottom — styled placeholder boxes labelled "Advertisement").

**Step A — Apply.** Deploy the site first, then apply at adsense.google.com with `aimoneytools.pro`. The site already has what reviewers look for: substantial unique content on every page, privacy policy with ad disclosures, about/contact pages, and no "coming soon" placeholders.

**Step B — Verification code.** In every HTML file's `<head>` there is a commented block marked `GOOGLE ADSENSE`. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your publisher ID and remove the comment markers `<!--` and `-->` around the `<script>` line. (Find-and-replace across files makes this a 2-minute job.)

**Step C — After approval.**
1. Edit `ads.txt`: replace `pub-0000000000000000` with your publisher ID.
2. Easiest option: turn on **Auto ads** in AdSense — the head script alone will place ads, and you can delete or keep the placeholder boxes.
3. Manual option: in each `ad-slot` block, delete the `<span>Advertisement</span>` placeholder, uncomment the `<ins class="adsbygoogle">` unit, and paste your real `data-ad-client` and `data-ad-slot` IDs from AdSense → Ads → Ad units.

**AdSense policy notes already handled for you:** calculators alone often get rejected as "low value content" — that's why every tool page carries 600–900 words of unique explanatory content, methodology tables and FAQs. Don't remove that content. Also keep the privacy policy page linked in the footer (it contains the required Google ad-cookie disclosures).

## 4. Updating tax figures each year

All thresholds (UK bands, NI, student loans, SDLT, IHT; US brackets, standard deductions, 401k/IRA limits) live in **one file**: `assets/js/taxdata.js`, clearly labelled. Update the numbers there each April (UK) / each November when the IRS publishes (US) and every tool updates at once. Current data: UK 2026/27, US 2025 & 2026.

## 5. How the tools work

- Pure vanilla JavaScript — every calculation runs in the visitor's browser. No API costs, no server load, perfect privacy story (also stated on the site).
- The 🇬🇧/🇺🇸 toggle in the header switches every tool's logic and is remembered via localStorage.
- Each tool page includes: the live tool, band-by-band explanations, SEO content, FAQ with FAQPage schema, WebApplication + Breadcrumb schema, canonical/OG/Twitter meta, and internal links to 4 related tools.

## 6. Optional next steps

- Add Google Analytics 4: paste the GA snippet into the `<head>` blocks (same spot as AdSense).
- Blog: adding /blog/ articles that link to the tools is the fastest way to grow the organic traffic that makes AdSense pay.
- If you later move Scotland/Wales property tools, Canada/Australia regions etc., `taxdata.js` + the page generator pattern make that straightforward.
