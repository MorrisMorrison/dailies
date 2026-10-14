# Dailies

A tiny website for the small things that keep you well: get outside, move, hydrate, eat well, rest, connect.

- **No accounts, no server, no tracking.** Everything is stored in your browser (`localStorage`) and never leaves your device.
- **Fresh every morning.** The list resets at local midnight.
- **Vanilla HTML, CSS and JavaScript.** No framework, no build step.

The sun on the page is your progress: it rises with your first daily, reaches noon halfway through, and sets when you're done. The sky follows it.

## Run it

Open `site/index.html` in a browser. To get offline support (the service worker), serve the `site/` folder over http, for example with any static file server.

Every push to `main` publishes `site/` to GitHub Pages (`.github/workflows/pages.yml`).

## Layout

| Path | What it is |
|---|---|
| `site/` | The website, exactly as it is published |
| `site/index.html`, `style.css`, `app.js` | The page (the "Daylight" design) |
| `site/core.js` | The list of dailies, their icons, on-device state and the editor dialog |
| `site/sw.js`, `manifest.webmanifest`, `icon.svg` | Offline support and install-to-home-screen |
| `site/fonts/` | Manrope, self-hosted (SIL Open Font License) |
| `designs/` | The five early design prototypes and a gallery to compare them (not published) |

## The dailies

Six on by default, more you can switch on with **Edit**:

| Default | Optional |
|---|---|
| Get outside · Move · Hydrate · Eat well · Rest · Connect | Breathe · Unplug · Create · Learn · Tidy · Be grateful · Play · Be kind |

## License

[MIT](LICENSE)
