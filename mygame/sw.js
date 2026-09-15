const CACHE = "fwf-v1";
const ASSETS = ["index.html","manifest.json","assets/shadin.png","assets/ashmil.png","assets/shifin.png",
"assets/shadinhead.png","assets/ashmilhead.png","assets/shifinhead.png",
"assets/shadinjump.mp3","assets/shadinhit1.mp3","assets/shadinhit2.mp3",
"assets/ashmiljump.mp3","assets/ashmilhit1.mp3","assets/ashmilhit2.mp3",
"assets/shifinjump.mp3","assets/shifinhit1.mp3","assets/shifinhit2.mp3"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
