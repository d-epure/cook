/* Service worker: aplicatia merge si fara internet.
   Versiunea vine din ?v=... (aceeasi cu APP_V), deci la fiecare versiune noua se face un cache nou.
   Fisierele aplicatiei: mai intai reteaua (ai mereu ultima versiune), daca nu e net, din cache.
   Apelurile catre model (api.anthropic.com) NU trec pe aici: nu sunt interceptate si nu se salveaza. */
const V=new URL(self.location.href).searchParams.get("v")||"0";
const CACHE="retete-"+V;
const SHELL=["./","index.html","style.css?v="+V,"app.js?v="+V,"manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("retete-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.origin===self.location.origin){
  e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
   .catch(()=>caches.match(r).then(m=>m||caches.match(r,{ignoreSearch:true})).then(m=>m||(r.mode==="navigate"?caches.match("index.html"):undefined))));
  return}
 if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
  e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{const n=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>m);return m||n})))}
});
