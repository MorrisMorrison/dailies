// Getting Dailies onto phones. Once someone comes back after a finished day, a small card explains how
// to keep it on the home screen, in the words of their browser: an Install button where the browser
// offers one (Android), the Share menu on iPhone and iPad, and "open it in your browser" inside apps
// like Instagram, which can't add anything to the home screen. Plus a Share button in the footer.
import { $ } from './html.js';

const DISMISSED = 'dailies:install-dismissed';

// ---- Pure helpers (tested in tests/share.test.js).

// Browsers built into other apps. They can't install a web app, so the page has to be opened elsewhere.
const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Snapchat|musical_ly|BytedanceWebview|LinkedInApp|Pinterest|Line\//;

/** 'inapp', 'ios', 'android' or 'desktop', from the user agent. iPads report themselves as a Mac with touch. */
export function platformOf(userAgent = '', touchPoints = 0) {
  if (IN_APP.test(userAgent)) return 'inapp';
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && touchPoints > 1)) return 'ios';
  if (/Android/.test(userAgent)) return 'android';
  return 'desktop';
}

/**
 * Whether to show the home-screen card: on phones and tablets only, not when Dailies already runs from
 * the home screen, not once dismissed, and only to someone who finished a day before today (so never on
 * a first visit).
 */
export function shouldOffer({ platform, standalone, dismissed, earlierFinishedDays }) {
  return platform !== 'desktop' && !standalone && !dismissed && earlierFinishedDays > 0;
}

const SHARE_ICON = '<svg class="share-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 10V1.5M5 4.5l3-3 3 3M4.5 7H3.5v7.5h9V7h-1"/></svg>';

/** The card's text for a platform; `canPrompt` when the browser handed us its install prompt. */
export function installText(platform, canPrompt) {
  if (platform === 'inapp') return 'You are in an app’s built-in browser. Open this page in Safari or Chrome to add it to your home screen.';
  if (platform === 'ios') return `Tap Share ${SHARE_ICON}, then <b>Add to Home Screen</b>. Dailies opens like an app, full screen, every morning.`;
  if (canPrompt) return 'Install Dailies and it opens like an app, full screen, straight from your home screen.';
  return 'Open your browser’s menu and choose <b>Add to Home screen</b> or <b>Install app</b>. Dailies then opens like an app.';
}

// ---- The home-screen card.

const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function isDismissed() {
  try { return localStorage.getItem(DISMISSED) !== null; } catch { return false; }
}

function dismiss() {
  try { localStorage.setItem(DISMISSED, new Date().toISOString().slice(0, 10)); } catch { /* shown again next visit */ }
  $('install').hidden = true;
}

let installPrompt = null;

/** Shows or hides the card. `earlierFinishedDays` counts finished days other than today. */
export function paintInstall(earlierFinishedDays) {
  const platform = platformOf(navigator.userAgent, navigator.maxTouchPoints);
  const show = shouldOffer({ platform, standalone: isStandalone(), dismissed: isDismissed(), earlierFinishedDays });
  $('install').hidden = !show;
  if (!show) return;
  $('install-text').innerHTML = installText(platform, Boolean(installPrompt));
  $('install-go').hidden = !(platform === 'android' && installPrompt);
}

export function setupSharing(earlierFinishedDays) {
  // Chrome and Edge on Android hand over their install prompt; keep it for the Install button.
  addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    paintInstall(earlierFinishedDays());
  });
  addEventListener('appinstalled', () => { $('install').hidden = true; });

  $('install-go').addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    installPrompt = null; // a prompt can only be used once
    if (outcome === 'accepted') $('install').hidden = true;
    else paintInstall(earlierFinishedDays());
  });
  $('install-dismiss').addEventListener('click', dismiss);

  // The footer's Share button: the phone's share sheet, or copy the link where there is none.
  const share = $('share');
  const url = new URL('./', location.href).href;
  share.addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Dailies', text: 'Six small things, every day.', url }); } catch { /* cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      share.textContent = 'Link copied';
    } catch {
      share.textContent = url.replace(/^https?:\/\/|\/$/g, '');
    }
    setTimeout(() => { share.textContent = 'Share Dailies'; }, 2500);
  });

  paintInstall(earlierFinishedDays());
}
