const CACHE="operations-v144";
const ASSETS=["index.html","manifest.json","icon-192.png","icon-512.png","quizbank.js"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  // App code (HTML + JS) is NETWORK-FIRST so a new version is always picked up when
  // online; falls back to cache when offline. This prevents a stale cached index.html
  // (with an old skill-migration) from shadowing an update.
  const isAppCode = e.request.mode==="navigate" || /\.(html|js)$/.test(url.pathname) || url.pathname.endsWith("/");
  if(isAppCode){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match("index.html")))
    );
    return;
  }
  // Everything else (icons, manifest) stays cache-first for speed/offline.
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match("index.html")))
  );
});
