// Only public application files are cached here. No GPS, photos or course packs.
const CACHE='hope-shell-3.1-vlabel';
const SHELL=['./index.html','./entry.mjs','./app.mjs','./outing.mjs','./outing-core.mjs','./golf-core.mjs','./course-catalog.mjs','./preview.mjs','./preview-core.mjs','./montserrat-digits.ttf'];
const ROOT=new URL('./',self.location.href);
const ALLOWED=new Set(SHELL.map(p=>new URL(p,ROOT).pathname));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hope-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 if(request.mode==='navigate'&&(url.pathname===ROOT.pathname||url.pathname===new URL('./index.html',ROOT).pathname)){
  event.respondWith(caches.open(CACHE).then(async c=>(await c.match(new URL('./index.html',ROOT).href))||fetch(request)));return;
 }
 if(!ALLOWED.has(url.pathname))return;
 event.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(request,{ignoreSearch:true});if(hit)return hit;const response=await fetch(request);if(response.ok)await c.put(request,response.clone());return response;}));
});
