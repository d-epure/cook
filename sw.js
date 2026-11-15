/* Service worker: aplicatia merge si fara internet.
   Versiunea vine din ?v=... (aceeasi cu APP_V), deci la fiecare versiune noua se face un cache nou.
   Fisierele aplicatiei: mai intai reteaua (ai mereu ultima versiune), daca nu e net, din cache.
   Apelurile catre model (api.anthropic.com) NU trec pe aici: nu sunt interceptate si nu se salveaza. */
const V=new URL(self.location.href).searchParams.get("v")||"0";
const CACHE="cook-"+V; /* 4.1.1: nume propriu; "retete-" putea fi si cache-ul altei aplicatii de pe aceeasi adresa */
const SHELL=["./","index.html","style.css?v="+V,"app.js?v="+V,"nutri.js?v="+V,"manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
/* sterg doar cache-urile acestei aplicatii: cele "cook-" vechi si cele "retete-" care contin pagina de la adresa mea */
const mine=k=>k.startsWith("cook-")?Promise.resolve(k!==CACHE):k.startsWith("retete-")?caches.open(k).then(c=>c.keys()).then(rs=>rs.some(r=>r.url.startsWith(self.registration.scope))).catch(()=>false):Promise.resolve(false);
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>mine(k).then(y=>y?caches.delete(k):false)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.origin===self.location.origin){
  /* reteaua intai; daca nu raspunde in 4 secunde (conexiune foarte slaba) sau lipseste, copia din cache */
  const net=fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res});
  const old=()=>caches.open(CACHE).then(c=>c.match(r).then(m=>m||c.match(r,{ignoreSearch:true})).then(m=>m||(r.mode==="navigate"?c.match("index.html"):undefined)));
  e.respondWith(new Promise((ok,no)=>{let done=false;const t=setTimeout(()=>{old().then(m=>{if(m&&!done){done=true;ok(m)}})},4000);
   net.then(res=>{clearTimeout(t);if(!done){done=true;ok(res)}}).catch(()=>{clearTimeout(t);if(done)return;old().then(m=>{done=true;m?ok(m):no(new TypeError("fara retea si fara copie"))})})}));
  return}
 if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
  e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{const n=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>m);return m||n})))}
});
