// 离线缓存（网络优先）：在线永远拿最新；没网才用上次缓存。
// 这样我一更新页面，你联网刷新就能拿到，不会被旧缓存卡住。
const CACHE = "tk-fasiwen-v2";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 网络优先：先连网拿最新，拿到顺手更新缓存；连不上才回退缓存。
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return resp;
      })
      .catch(() =>
        caches.match(e.request).then((r) => r || caches.match("./index.html"))
      )
  );
});
