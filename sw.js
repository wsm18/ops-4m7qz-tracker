const CACHE="operations-v217";
const ASSETS=["index.html","manifest.json","icon-192.png","icon-512.png","quizbank.js","fonts/oswald.woff2","fonts/roboto-condensed.woff2"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Only ever cache a genuinely successful, same-origin response — a 404/502
// mid-deploy, or a captive-portal login page returned as an HTTP 200, used to
// get written straight over the last-known-good cached index.html. Once that
// happens, going offline afterward serves the broken page permanently, until
// the origin is reachable AND healthy again — directly against this app's
// "fully offline" requirement.
function cacheable(res){ return res && res.ok && res.type==="basic"; }
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  // App code (HTML + JS) is NETWORK-FIRST so a new version is always picked up when
  // online; falls back to cache when offline. This prevents a stale cached index.html
  // (with an old skill-migration) from shadowing an update.
  const isAppCode = e.request.mode==="navigate" || /\.(html|js)$/.test(url.pathname) || url.pathname.endsWith("/");
  if(isAppCode){
    const networkFetch=fetch(e.request).then(res=>{
      if(cacheable(res)){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}); }
      return res;
    });
    // index.html is large; on a weak/lie-fi connection or a captive portal, a
    // bare network-first fetch could hang 30+ seconds with nothing shown even
    // though a perfectly good cached copy already exists. Race a short
    // timeout against the network — whichever resolves first wins the
    // response, but the network fetch is left running regardless (it still
    // updates the cache for next time once it does resolve).
    const timeout=new Promise(resolve=>setTimeout(()=>resolve(null),2500));
    e.respondWith(
      Promise.race([networkFetch,timeout])
        .then(res=>res||caches.match(e.request).then(hit=>hit||caches.match("index.html")).then(hit=>hit||networkFetch))
        .catch(()=>caches.match(e.request).then(hit=>hit||caches.match("index.html")))
    );
    return;
  }
  // Everything else (icons, manifest, fonts) stays cache-first for speed/offline.
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      if(cacheable(res)){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}); }
      return res;
    }).catch(()=>new Response(null,{status:404,statusText:"offline and not cached"})))
  );
});
