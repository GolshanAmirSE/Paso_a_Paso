// Keeps the book available offline after the first visit.
const CACHE = "paso-a-paso-v1";
const FILES = [
  "./assets/geist-cyrillic-wght-normal-CHSlOQsW.woff2",
  "./assets/geist-latin-ext-wght-normal-DMtmJ5ZE.woff2",
  "./assets/geist-latin-wght-normal-Dm3htQBi.woff2",
  "./assets/index-B-W18Lla.js",
  "./assets/index-DGwDT_q2.css",
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).catch(() => (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error())),
    ),
  );
});
