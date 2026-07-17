# Friend&Friends — Wholesale Supply Partner Website

A commercial, single-page marketing website for **Friend&Friends**, a B2B
wholesale supplier covering almost every ecommerce product category. Every
order is quality checked (QC) before dispatch, and custom sourcing is
offered when a product isn't already in the catalogue.

Built as static **HTML / CSS / vanilla JS** — no build step, no framework,
no server required. Drop it on any static host (GitHub Pages, Netlify,
Vercel, S3, etc.) and it works.

## ✨ Features

- **3D hero scene** — a rotating "hub" of product crates built in Three.js,
  with mouse parallax and scroll-linked camera movement.
- **Scroll-drawn supply network** — a second Three.js scene where a
  hub-and-node network draws itself as you scroll, visualising one supply
  hub connected to every product category.
- **Scroll-reveal animations** on every section (IntersectionObserver, no
  jank, respects `prefers-reduced-motion`).
- **3D tilt cards** on hover for feature, catalogue, and "why us" cards.
- **Animated stat counters**, a scroll-filled process timeline, and a
  flipping 3D "QC Passed" stamp.
- **Working contact form UI** (client-side validation + toast confirmation)
  ready to be wired up to a real backend or form service.
- Fully **responsive** down to mobile, with a collapsible nav.
- Content sourced/adapted from the brand's reference site, restructured
  around: wholesale catalogue, quality check process, and custom sourcing.

## 📁 Project structure

```
friendandfriends/
├── index.html          # All page markup/content
├── css/
│   └── style.css        # Design tokens, layout, responsive rules, animations
├── js/
│   ├── scene.js         # Three.js hero + scroll-drawn network scenes
│   └── main.js          # Nav, scroll reveals, tilt cards, counters, form
├── assets/               # Place any images/icons/favicons here
├── README.md
├── LICENSE
└── .gitignore
```

## 🚀 Getting started

No build tools needed. Clone the repo and open it with any static server
(opening `index.html` directly in a browser also works, but a local server
avoids any CORS quirks with fonts/CDNs):

```bash
git clone https://github.com/<your-username>/friendandfriends-website.git
cd friendandfriends-website

# any static server works, for example:
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080` (or whichever port your server prints).

## 🌐 Deploying

This is a static site, so any static host works:

- **GitHub Pages** — push to a repo, then enable Pages on the `main` branch
  (root folder).
- **Netlify / Vercel** — import the repo, framework preset "Other", build
  command empty, publish directory `/`.

## 🛠️ Customizing

- **Copy & content** — everything lives in `index.html`; sections are
  labelled with HTML comments (`<!-- ============ HERO ============ -->`, etc.).
- **Colors / type / spacing** — all design tokens are CSS custom properties
  at the top of `css/style.css` under `:root`.
- **3D scenes** — `js/scene.js` has two independent functions,
  `initHero()` and `initNetwork()`, each fully commented. Tweak crate/node
  counts, colors, and motion speeds there.
- **Contact form** — `js/main.js` currently logs submissions to the console
  and shows a confirmation toast. Replace the `console.log(...)` block
  inside the `submit` handler with a real `fetch()` call to your backend,
  form service (e.g. Formspree, Getform), or CRM webhook.

## 📦 Dependencies

Loaded via CDN in `index.html` — no `npm install` required:

- [Three.js r128](https://threejs.org/) — 3D scenes
- [GSAP 3 + ScrollTrigger](https://gsap.com/) — scroll-linked animation
- Google Fonts: Archivo Expanded, Inter, IBM Plex Mono

## ♿ Accessibility & performance notes

- Respects `prefers-reduced-motion` by disabling continuous 3D motion and
  instant-scrolling instead of smooth-scrolling.
- All interactive elements are keyboard-reachable; focus states rely on
  default browser outlines — extend `:focus-visible` styles in
  `style.css` if you need a more branded focus ring.
- The Three.js canvases are decorative (`aria-hidden="true"`) and never
  block access to underlying content.

## 📄 License

MIT — see [LICENSE](LICENSE). Content and brand name are placeholders for
Friend&Friends; replace copy, contact details, and legal pages before
production use.
