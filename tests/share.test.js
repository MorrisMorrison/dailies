// Who gets the home-screen card, and what it says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { platformOf, shouldOffer, installText } from '../site/js/share.js';

const UA = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
  android: 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
  instagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 389.0.0.20.86 (iPhone15,2; iOS 18_5; en_US)',
  facebook: 'Mozilla/5.0 (Linux; Android 15; Pixel 8 Build/AP3A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/520.0.0.47.70;]',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
};

test('tells phones, in-app browsers and desktops apart', () => {
  assert.equal(platformOf(UA.iphone, 5), 'ios');
  assert.equal(platformOf(UA.iphoneChrome, 5), 'ios');
  assert.equal(platformOf(UA.ipad, 5), 'ios', 'an iPad asks for the desktop site but has touch');
  assert.equal(platformOf(UA.ipad, 0), 'desktop', 'a real Mac');
  assert.equal(platformOf(UA.android, 5), 'android');
  assert.equal(platformOf(UA.instagram, 5), 'inapp');
  assert.equal(platformOf(UA.facebook, 5), 'inapp');
  assert.equal(platformOf(UA.windows, 0), 'desktop');
  assert.equal(platformOf(), 'desktop');
});

test('offers the home screen only to returning phone users who have not installed or dismissed it', () => {
  const base = { platform: 'ios', standalone: false, dismissed: false, earlierFinishedDays: 1 };
  assert.equal(shouldOffer(base), true);
  assert.equal(shouldOffer({ ...base, platform: 'android' }), true);
  assert.equal(shouldOffer({ ...base, platform: 'inapp' }), true);
  assert.equal(shouldOffer({ ...base, platform: 'desktop' }), false);
  assert.equal(shouldOffer({ ...base, standalone: true }), false);
  assert.equal(shouldOffer({ ...base, dismissed: true }), false);
  assert.equal(shouldOffer({ ...base, earlierFinishedDays: 0 }), false, 'not on a first visit');
});

test('explains the way in each browser offers', () => {
  assert.match(installText('ios', false), /Add to Home Screen/);
  assert.match(installText('android', true), /^Install Dailies/);
  assert.match(installText('android', false), /menu/);
  assert.match(installText('inapp', false), /Safari or Chrome/);
});
