// Keeps the book available offline after the first visit. A new version replaces the old one automatically.
const CACHE = "paso-a-paso-69b24b887b";
const FILES = [
  "./assets/geist-cyrillic-wght-normal-CHSlOQsW.woff2",
  "./assets/geist-latin-ext-wght-normal-DMtmJ5ZE.woff2",
  "./assets/geist-latin-wght-normal-Dm3htQBi.woff2",
  "./assets/index-B18FmThs.js",
  "./assets/index-BduwYuoR.css",
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
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && !k.endsWith("-audio")).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  if (e.request.mode === "navigate") {
    // The page itself: newest version when online, saved copy when offline.
    // "no-store": never an old copy from the browser's own cache, so a new version shows up straight away.
    e.respondWith(fetch(e.request, { cache: "no-store" }).catch(() => caches.match("./index.html")));
    return;
  }
  const url = new URL(e.request.url);
  // The version check always asks the website.
  if (url.pathname.endsWith("/version.json")) return;
  // Parts of big voice files are fetched straight from the website (the app keeps them for offline use itself).
  if (e.request.headers.has("range")) return;
  if (url.pathname.includes("/audio/")) {
    // Recorded voices: the list is always checked online; the recordings are kept for offline use once played.
    if (url.pathname.endsWith("/index.json")) {
      e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
      return;
    }
    e.respondWith(
      caches.open("paso-a-paso-audio").then((c) =>
        c.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; })),
      ),
    );
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});
