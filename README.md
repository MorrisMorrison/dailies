# Dailies

[![Deploy](https://github.com/MorrisMorrison/dailies/actions/workflows/deploy.yml/badge.svg)](https://github.com/MorrisMorrison/dailies/actions/workflows/deploy.yml)
[![Tests](https://github.com/MorrisMorrison/dailies/actions/workflows/tests.yml/badge.svg)](https://github.com/MorrisMorrison/dailies/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/MorrisMorrison/dailies/graph/badge.svg)](https://codecov.io/gh/MorrisMorrison/dailies)

A tiny website for the small things that keep you well: get outside, move, hydrate, eat well, rest, connect.

**[dailies.health](https://dailies.health/)**

- **No accounts, no server, no tracking.** Everything is stored in your browser (`localStorage`) and never leaves your device.
- **Visits are only counted, never tracked.** The site is served through Cloudflare, which counts requests on its side (how many visits, roughly how many people). There are no analytics scripts or cookies, and nothing is stored on your device for it.
- **Fresh every morning.** Ticks reset at local midnight.
- **Vanilla HTML, CSS and JavaScript.** No framework, no dependencies, no build step.
- **Works offline** and can be added to your home screen, where it opens full screen from its own icon. On phones, the download button at the top does that from the first visit: the browser's install prompt on Android, short steps for the Share menu on iPhone and iPad, and "open it in your browser" inside apps like Instagram. People who come back after a finished day also get a reminder, which can be dismissed for good.

The sun on the page is your progress: it rises with your first daily, reaches noon halfway through, and sets when you're done. The sky follows it, with a light that changes gently with the seasons: paler and crisper in winter, richer in summer. The greeting follows the clock, with a line that notices how far you are ("All done before noon.").

## The dailies

Six are on by default, and more can be switched on under **Edit**. You can also add up to 10 of your own, each with a name and an icon.

| Default | Optional |
|---|---|
| Get outside · Move · Hydrate · Eat well · Rest · Connect | Breathe · Unplug · Create · Learn · Tidy · Be grateful · Play · Be kind |

Finish all of them and the page glides back to the sky, where a few shooting stars cross it, the last one staying as a new star (on Android, the phone gives a short buzz too). You also get a **quote of the day**, which stays until midnight, from the collections you pick under **Edit**: Classic (a bit of everything), Nature, Stoics, Poetry or Storybooks. Every line is public domain and checked against its original text, with no repeats until every one has shown. Each finished day also lights a star in **Your sky**. The stars fill real constellations, from Cassiopeia and the Big Dipper to Orion and Pegasus. Only the dates of finished days are kept, on your device.

## Run it locally

The page uses ES modules, so it has to be served over http rather than opened as a file. Any static file server works, for example:

```sh
npx serve site
```

## Tests

```sh
npm test
```

Uses Node's built-in test runner (Node 22 or later) and installs nothing. These tests cover the logic: state, content rules, sky colours, the geometry of the shooting stars, and the published files. They run on every pull request.

```sh
npm install
npx playwright install webkit chromium
npm run test:browser
```

The browser tests check the page itself in WebKit (iPhone) and Chromium (Android and desktop):
- ticking;
- the home-screen button and sheet for each kind of browser;
- the shooting stars, and scrolling back to the sky;
- the quote that stays;
- the Edit dialog and the quote collections;
- the Share button.

They use [Playwright](https://playwright.dev), a dev-only dependency: the site itself has none. They run on every pull request.

Every push to `main` runs both suites before anything is published: the **Deploy** workflow calls the Tests workflow and publishes `site/` to GitHub Pages only if every test passed. Coverage of `site/js/` goes to [Codecov](https://codecov.io/gh/MorrisMorrison/dailies). It's measured by Node's built-in coverage for the Node tests and by Chromium for the browser tests (WebKit can't measure it); `npm run coverage:unit` and `COVERAGE=1 npm run test:browser && npm run coverage:browser` produce the reports locally.

## Layout

| Path | What it is |
|---|---|
| `site/` | The website, exactly as it is published. Every push to `main` deploys it to GitHub Pages once all tests pass, served through Cloudflare at [dailies.health](https://dailies.health/). |
| `site/index.html` | The page and the Edit dialog |
| `site/css/` | `style.css` for the page, `editor.css` for the Edit dialog |
| `site/js/app.js` | Draws the page: sky, sun, cards, quote, Your sky |
| `site/js/sky.js`, `colour.js` | The sky's colours: progress, seasons (hemisphere guessed from the timezone) and a contrast guard |
| `site/js/editor.js` | The Edit dialog |
| `site/js/celebrate.js` | The shooting stars when the day is finished |
| `site/js/share.js` | The home-screen button, sheet and reminder, and the Share button |
| `site/js/store.js` | On-device state: what's switched on, today's ticks, your own dailies, finished days |
| `site/js/dailies.js`, `icons.js`, `quotes.js`, `constellations.js`, `greeting.js` | Content: the built-in dailies, icon shapes, quotes, star positions, the greeting wording |
| `site/sw.js`, `site/manifest.webmanifest` | Offline support and install-to-home-screen |
| `site/img/`, `site/fonts/` | App icons, the link-preview image (`og.png`), install screenshots, and the self-hosted Manrope font |
| `tests/` | Tests for state, content rules and the published files |

The five early design prototypes are kept under the git tag [`prototypes`](https://github.com/MorrisMorrison/dailies/tree/prototypes/designs).

## Adding things

- **An icon:** add one entry to `ICONS` in `site/js/icons.js`. It appears in the picker automatically.
- **A quote:** add it to `site/js/quotes.js` with the collections it belongs to, but only if it is in the public domain in both the US and the EU, fits the idea of dailies, and you have checked it word for word against the original text. Keep any one author at no more than half of a collection, so they never come up two days running.
- **A file under `site/`:** list it in `ASSETS` in `site/sw.js` and bump `CACHE`. A test fails if you forget.
- **Any change to a script or stylesheet:** bump `CACHE` in `site/sw.js` and set the same number in every `?v=` in `site/index.html` (the stylesheets, the entry script and the import map). That way a page never mixes files from two releases out of a cache. A new module also needs a line in the import map. Tests check all of this.

## License

[MIT](LICENSE). Third-party notices (constellation data, font, quotes): [THIRD_PARTY.md](THIRD_PARTY.md).
