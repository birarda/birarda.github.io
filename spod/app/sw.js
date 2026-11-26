// The web preview's service worker, so it works offline once installed to the
// home screen. web/build.sh writes it to web/sw.js with 8d262b36a33e set from
// the build's files, so a new build is a new cache: the page, its script and
// its wasm always come from the same build.
const VERSION = "8d262b36a33e";
const CACHE = "spod-" + VERSION;
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pkg/spod.js",
  "./pkg/spod_bg.wasm",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("spod-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// The build's own files come from the cache. Anything else (other origins,
// such as Spotify's) goes to the network as usual.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request, { ignoreSearch: true }).then((hit) => hit || fetch(request)),
    ),
  );
});
