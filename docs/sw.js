// Lets the Space Explorer be installed as an app. It does not store anything: every request goes straight to the network,
// so updates always show up right away.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { });
