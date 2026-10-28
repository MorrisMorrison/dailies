// Getting Dailies onto phones. On phones, a download button in the header adds Dailies to the home
// screen from the first visit: it opens the browser's install prompt where there is one (Android),
// or a short sheet with the steps, in the words of the browser: the Share menu on iPhone and iPad, and
// "open it in your browser" inside apps like Instagram, which can't add anything to the home screen.
// Inside such apps, a line at the top offers to open Dailies in Safari or the browser (#52). Once a
// day is finished, a card in the same place suggests the home screen. Plus a Share button in the footer.
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
 * Whether to show the home-screen card: once today's dailies are all done (the moment people like
 * Dailies most, the first day included), on phones and tablets in their own browser, not when Dailies
 * already runs from the home screen, and not once dismissed. In-app browsers get the line at the top instead.
 */
export function shouldOffer({ platform, standalone, dismissed, finishedToday }) {
  return (platform === 'ios' || platform === 'android') && !standalone && !dismissed && finishedToday;
}

/** The app whose built-in browser this is, for the line at the top; null outside one. */
export function inAppName(userAgent = '') {
  const apps = [[/Pinterest/, 'Pinterest'], [/Instagram/, 'Instagram'], [/FBAN|FBAV|FB_IAB/, 'Facebook'],
    [/WhatsApp/, 'WhatsApp'], [/Snapchat/, 'Snapchat'], [/musical_ly|BytedanceWebview/, 'TikTok'],
    [/LinkedInApp/, 'LinkedIn'], [/Line\//, 'LINE']];
  if (!IN_APP.test(userAgent)) return null;
  return apps.find(([pattern]) => pattern.test(userAgent))?.[1] ?? 'this app';
}

/**
 * A link that leaves the app's browser for the real one: Safari's own URL scheme on iPhone and iPad
 * (iOS 17 and later), an intent that hands the address to the default browser on Android. Some apps
 * block both, so Copy link stays next to it.
 */
export function openOutside(userAgent, url) {
  const { host, pathname } = new URL(url);
  if (/iPhone|iPad|iPod/.test(userAgent)) return { href: `x-safari-https://${host}${pathname}`, label: 'Open in Safari' };
  if (/Android/.test(userAgent)) return { href: `intent://${host}${pathname}#Intent;scheme=https;end`, label: 'Open in browser' };
  return null;
}

/** Whether to show the header's home-screen button: on phones and tablets, until Dailies runs from the home screen. */
export function offersButton({ platform, standalone }) {
  return platform !== 'desktop' && !standalone;
}

const SHARE_ICON = '<svg class="share-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 10V1.5M5 4.5l3-3 3 3M4.5 7H3.5v7.5h9V7h-1"/></svg>';

/** The sheet's steps for a platform without an install prompt, as list items. */
export function sheetSteps(platform) {
  if (platform === 'inapp') return [
    'You are in an app’s built-in browser, which can’t add pages to your home screen.',
    'Open this page in Safari or Chrome: look for <b>Open in browser</b>, often behind ⋯ or ⋮. Or copy the link and paste it there.',
    'Then tap the home-screen button at the top again.',
  ];
  if (platform === 'ios') return [
    `Tap Share ${SHARE_ICON} in the browser’s toolbar. In newer Safari, tap ⋯ first.`,
    'Choose <b>Add to Home Screen</b>, then tap <b>Add</b>.',
    'Dailies now opens from its own icon, full screen, and works offline.',
  ];
  return [
    'Open the browser’s menu ⋮.',
    'Choose <b>Add to Home screen</b> or <b>Install app</b>.',
    'Dailies now opens from its own icon, full screen, and works offline.',
  ];
}

/** The card's text for a platform; `canPrompt` when the browser handed us its install prompt. */
export function installText(platform, canPrompt) {
  if (platform === 'ios') return `Tap Share ${SHARE_ICON}, then <b>Add to Home Screen</b>. Dailies then opens from its own icon, full screen, and works offline.`;
  if (canPrompt) return 'Install Dailies and it opens from its own icon, full screen, and works offline.';
  return 'Open your browser’s menu and choose <b>Add to Home screen</b> or <b>Install app</b>. Dailies then opens from its own icon, full screen, and works offline.';
}

/** The line at the top inside an app's browser. */
export function inAppText(app, android = false) {
  const browser = android ? 'your browser' : 'Safari';
  return `You’re in ${app === 'this app' ? 'an app’s' : `${app}’s`} browser. Open Dailies in ${browser} to keep it on your home screen.`;
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
const platform = () => platformOf(navigator.userAgent, navigator.maxTouchPoints);

/** Shows or hides the header button and the card; the card once `finishedToday`. */
export function paintInstall(finishedToday) {
  const standalone = isStandalone();
  $('install-open').hidden = !offersButton({ platform: platform(), standalone });
  const show = shouldOffer({ platform: platform(), standalone, dismissed: isDismissed(), finishedToday });
  $('install').hidden = !show;
  if (!show) return;
  $('install-text').innerHTML = installText(platform(), Boolean(installPrompt));
  $('install-go').hidden = !(platform() === 'android' && installPrompt);
}

function openSheet() {
  $('install-steps').innerHTML = sheetSteps(platform()).map((step) => `<li><span>${step}</span></li>`).join('');
  $('install-copy').hidden = platform() !== 'inapp';
  $('install-sheet').showModal();
}

/** Copies the address; tells the button what happened for 2.5 seconds. */
async function copyLink(button, label) {
  const url = new URL('./', location.href).href;
  try {
    await navigator.clipboard.writeText(url);
    button.textContent = 'Link copied';
  } catch {
    button.textContent = url.replace(/^https?:\/\/|\/$/g, '');
  }
  setTimeout(() => { button.textContent = label; }, 2500);
}

// The line at the top inside an app's browser: which app, and a way out to the real browser.
function paintInApp() {
  const app = inAppName(navigator.userAgent);
  $('inapp').hidden = !app;
  if (!app) return;
  const way = openOutside(navigator.userAgent, new URL('./', location.href).href);
  $('inapp-text').textContent = inAppText(app, /Android/.test(navigator.userAgent));
  $('inapp-open').hidden = !way;
  if (way) Object.assign($('inapp-open'), { href: way.href, textContent: way.label });
}

export function setupSharing(finishedToday) {
  // Chrome and Edge on Android hand over their install prompt; keep it for the Install buttons.
  addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    paintInstall(finishedToday());
  });
  addEventListener('appinstalled', () => { $('install').hidden = true; $('install-open').hidden = true; });

  // The browser's own prompt where there is one, otherwise the steps for this browser.
  async function install() {
    if (!installPrompt) { openSheet(); return; }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    installPrompt = null; // a prompt can only be used once
    if (outcome === 'accepted') { $('install').hidden = true; $('install-open').hidden = true; }
    else paintInstall(finishedToday());
  }
  $('install-open').addEventListener('click', install);
  $('install-go').addEventListener('click', install);
  $('install-dismiss').addEventListener('click', dismiss);
  $('install-copy').addEventListener('click', (event) => copyLink(event.currentTarget, 'Copy link'));
  $('inapp-copy').addEventListener('click', (event) => copyLink(event.currentTarget, 'Copy link'));

  // The footer's Share button: the phone's share sheet, or copy the link where there is none.
  const share = $('share');
  const url = new URL('./', location.href).href;
  share.addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Dailies', text: 'Six small things, every day.', url }); } catch { /* cancelled */ }
      return;
    }
    copyLink(share, 'Share Dailies');
  });

  paintInApp();
  paintInstall(finishedToday());
}
