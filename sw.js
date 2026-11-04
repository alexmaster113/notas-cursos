const C='nc2-v4',A=['./','index.html','css/app.css','js/core.js','js/ui.js','js/hoy.js','js/notas.js','js/tareas.js','js/ajustes.js','js/adjuntos.js','js/sync.js','js/app.js','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
// Primero la red (preguntando siempre si hay versión nueva); solo se guardan en caché respuestas buenas del mismo sitio (un 404 no pisa el archivo bueno)
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!='GET'||u.origin!=location.origin)return;
e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok&&r.type=='basic'){const p=r.clone();caches.open(C).then(c=>c.put(e.request,p))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(_){}e.waitUntil(self.registration.showNotification(d.title||'Notas',{body:d.body||'',tag:d.tag,icon:'icon-192.png',badge:'icon-192.png',data:{url:d.url||'./#tareas'}}))});
// Al tocar el aviso solo se abre una página de esta misma app
self.addEventListener('notificationclick',e=>{e.notification.close();let u=new URL(e.notification.data.url,self.registration.scope);if(u.origin!=location.origin)u=new URL('./#tareas',self.registration.scope);u=u.href;
e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus'in c){if(c.navigate)c.navigate(u);return c.focus()}}return clients.openWindow(u)}))});
