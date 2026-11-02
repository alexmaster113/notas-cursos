const C='nc1-v2',A=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!='GET'||u.origin!=location.origin)return;
e.respondWith(fetch(e.request).then(r=>{const p=r.clone();caches.open(C).then(c=>c.put(e.request,p));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(_){}e.waitUntil(self.registration.showNotification(d.title||'Notas',{body:d.body||'',tag:d.tag,icon:'icon-192.png',badge:'icon-192.png',data:{url:d.url||'./#tareas'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=e.notification.data.url;e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus'in c){if(c.navigate)c.navigate(u);return c.focus()}}return clients.openWindow(u)}))});
