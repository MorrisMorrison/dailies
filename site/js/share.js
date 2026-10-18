// Getting Dailies onto phones. On phones, a download button in the header adds Dailies to the home
// screen from the first visit: it opens the browser's install prompt where there is one (Android),
// or a short sheet with the steps, in the words of the browser: the Share menu on iPhone and iPad, and
// "open it in your browser" inside apps like Instagram, which can't add anything to the home screen.
// Once someone comes back after a finished day, a card reminds them too. Plus a Share button in the footer.
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
const platform = () => platformOf(navigator.userAgent, navigator.maxTouchPoints);

/** Shows or hides the header button and the card. `earlierFinishedDays` counts finished days other than today. */
export function paintInstall(earlierFinishedDays) {
  const standalone = isStandalone();
  $('install-open').hidden = !offersButton({ platform: platform(), standalone });
  const show = shouldOffer({ platform: platform(), standalone, dismissed: isDismissed(), earlierFinishedDays });
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

export function setupSharing(earlierFinishedDays) {
  // Chrome and Edge on Android hand over their install prompt; keep it for the Install buttons.
  addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    paintInstall(earlierFinishedDays());
  });
  addEventListener('appinstalled', () => { $('install').hidden = true; $('install-open').hidden = true; });

  // The browser's own prompt where there is one, otherwise the steps for this browser.
  async function install() {
    if (!installPrompt) { openSheet(); return; }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    installPrompt = null; // a prompt can only be used once
    if (outcome === 'accepted') { $('install').hidden = true; $('install-open').hidden = true; }
    else paintInstall(earlierFinishedDays());
  }
  $('install-open').addEventListener('click', install);
  $('install-go').addEventListener('click', install);
  $('install-dismiss').addEventListener('click', dismiss);
  $('install-copy').addEventListener('click', (event) => copyLink(event.currentTarget, 'Copy link'));

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

  paintInstall(earlierFinishedDays());
}
