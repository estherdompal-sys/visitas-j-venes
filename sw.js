/* Service Worker · Informe de visita Jóvenes
   Guarda la aplicación en el dispositivo para abrirla sin conexión.
   NO intercepta SIGPAC ni la ortofoto (otros dominios) y NO toca los datos de las visitas (IndexedDB).
   Al publicar una nueva versión, cambia VERSION para que los móviles la actualicen. */
const VERSION='v92-7';
const CACHE='visitas-jovenes-'+VERSION;
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./Plantilla_expedientes_recintos.xlsx','./Manual_visitas_jovenes.pdf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('visitas-jovenes-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return;          // SIGPAC, GRAFCAN, etc.: directo a la red
  // Con conexión se descarga la versión nueva; sin conexión se usa la guardada.
  e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
