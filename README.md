# Dailies

A tiny website for the small things that keep you well: get outside, move, hydrate, eat well, rest, connect.

- **No accounts, no server, no tracking.** Everything is stored in your browser (`localStorage`) and never leaves your device.
- **Fresh every morning.** The list resets at local midnight.
- **Vanilla HTML, CSS and JavaScript.** No framework, no build step.

The sun on the page is your progress: it rises with your first daily, reaches noon halfway through, and sets when you're done. The sky follows it.

## Run it

Open `index.html` in a browser. To get offline support (the service worker), serve the folder over http, for example with any static file server.

## Layout

| File | What it does |
|---|---|
| `index.html`, `style.css`, `app.js` | The site (the "Daylight" design) |
| `core.js` | The list of dailies, their icons, on-device state and the editor dialog |
| `sw.js`, `manifest.webmanifest`, `icon.svg` | Offline support and install-to-home-screen |
| `designs/` | The five early design prototypes and a gallery to compare them |

## The dailies

Six on by default, more you can switch on with **Edit**:

| Default | Optional |
|---|---|
| Get outside · Move · Hydrate · Eat well · Rest · Connect | Breathe · Unplug · Create · Learn · Tidy · Be grateful · Play · Be kind |

## License

[MIT](LICENSE)
