/* Souffle : fonctionne hors connexion. Changer VERSION à chaque mise à jour de ce fichier. */
const VERSION='souffle-v4';
// Petits fichiers mis de côté à l'installation. La page elle-même est mise en cache à chaque ouverture réussie.
const FILES=['manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==VERSION).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // Page : on demande toujours au serveur s'il y a une nouvelle version (sans passer par le cache du navigateur),
  // et on garde une copie pour le mode hors connexion
  if(r.mode==='navigate'){e.respondWith(fetch(new Request(r.url,{cache:'no-cache',credentials:'same-origin'})).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put('index.html',cp))}return res}).catch(()=>caches.match('index.html')));return}
  // Polices Google et fichiers locaux : cache d'abord
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res})));
  }
});
