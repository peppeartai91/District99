/* District 99: cache minima per l'installazione e per riaprire l'app anche con rete debole */
const V = "d99-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== "GET" || url.origin !== location.origin || req.headers.has("range") || /\.(mp4|mp3)$/.test(url.pathname)) return;
  e.respondWith(
    fetch(req).then(res => { if(res.ok){ const copy = res.clone(); caches.open(V).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match("index.html")))
  );
});
