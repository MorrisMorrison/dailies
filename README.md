# Dailies

[![Deploy](https://github.com/MorrisMorrison/dailies/actions/workflows/deploy.yml/badge.svg)](https://github.com/MorrisMorrison/dailies/actions/workflows/deploy.yml)
[![Tests](https://github.com/MorrisMorrison/dailies/actions/workflows/tests.yml/badge.svg)](https://github.com/MorrisMorrison/dailies/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/MorrisMorrison/dailies/graph/badge.svg)](https://codecov.io/gh/MorrisMorrison/dailies)

A small daily-habits checklist that runs entirely in the browser. Live at [dailies.health](https://dailies.health/).

<p align="center">
  <a href="https://github.com/user-attachments/assets/499e2d16-d544-4692-a803-d2ea95a569f5">
    <img width="220" alt="Dailies at the end of a day" src="https://github.com/user-attachments/assets/499e2d16-d544-4692-a803-d2ea95a569f5" />
  </a>
</p>

## Features

- **Dailies:**
  - six on by default: get outside, move, hydrate, eat well, rest, connect;
  - eight optional ones;
  - up to 10 custom ones (a name and an icon).
- **State:** in `localStorage` only; no accounts, no server, no analytics. Ticks reset at local midnight.
- **Progress:** shown as the sun on an arc. The sky colours follow it and shift with the season.
- **When the day is finished:**
  - shooting stars;
  - a quote of the day from the chosen collections (Classic, Nature, Stoics, Poetry, Storybooks; all public domain);
  - a star in "Your sky", which fills 15 real constellations over time.
- **Installable:** works as a PWA (web app manifest, service worker with offline fallback), with install steps for each kind of browser.

Vanilla HTML, CSS and JavaScript with native ES modules. No framework, no build step, no runtime dependencies.

## Development

The site uses ES modules, so serve it over http:

```sh
npx serve site
```

### Tests

```sh
npm test                                  # logic, Node only (Node 22+), nothing to install
npm install && npx playwright install webkit chromium
npm run test:browser                      # the page in WebKit and Chromium (Playwright)
```

Coverage of `site/js/`:
- **Node tests:** `npm run coverage:unit`.
- **Browser tests:** `COVERAGE=1 npm run test:browser && npm run coverage:browser` (Chromium only).

Playwright and the coverage tooling are dev dependencies; the site itself has none.

### CI

- **Tests** runs both suites on every pull request.
- **Deploy** runs on every push to `main`: it runs Tests, then publishes `site/` to GitHub Pages only if both suites passed.
- Coverage is reported to [Codecov](https://codecov.io/gh/MorrisMorrison/dailies).

## Layout

| Path | Contents |
|---|---|
| `site/` | The published site, deployed as is |
| `site/js/app.js` | Page rendering: sky, sun, cards, quote, Your sky |
| `site/js/store.js` | On-device state |
| `site/js/editor.js` | The Edit dialog |
| `site/js/share.js` | Install button, install sheet and reminder, Share button |
| `site/js/celebrate.js` | Shooting stars |
| `site/js/sky.js`, `colour.js` | Sky colours: progress, seasons, contrast |
| `site/js/dailies.js`, `icons.js`, `quotes.js`, `constellations.js`, `greeting.js` | Content |
| `site/sw.js`, `site/manifest.webmanifest` | Service worker and web app manifest |
| `tests/` | Node tests; `tests/browser/` holds the Playwright tests |

Early design prototypes are kept under the git tag [`prototypes`](https://github.com/MorrisMorrison/dailies/tree/prototypes/designs).

## Conventions

- **Releases:** after changing anything under `site/`, run `npm run release`.
- **Icons:** add an entry to `ICONS` in `site/js/icons.js`; it appears in the picker.
- **Quotes:** add to `site/js/quotes.js` with their collections. Every quote must:
  - be public domain in both the US and the EU;
  - fit the idea of the dailies;
  - be checked word for word against its source.

  No author may have more than half of a collection.
- **Tests:** new logic gets a Node test, and new page behaviour a browser test.

## License

[MIT](LICENSE). Third-party notices (constellation data, font, quotes): [THIRD_PARTY.md](THIRD_PARTY.md).
