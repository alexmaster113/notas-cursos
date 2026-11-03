// Inicio de sesión, sincronización con Supabase y avisos push
function login(){$('#m').innerHTML=`<div class=login><img src="icon-192.png" alt=""><h1>Notas de clase</h1><p class=mu>Inicia sesión una sola vez.</p><label>Correo<input id=em type=email autocomplete=username></label><label>Contraseña<input id=pw type=password autocomplete=current-password></label><button class=btn onclick=doLogin()>Entrar</button><p id=er class=err></p></div>`}
async function doLogin(){try{const r=await fetch(SB+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:$('#em').value.trim(),password:$('#pw').value})}),j=await r.json();if(!r.ok)throw j.msg||j.error_description||'Error';
 S.auth={access:j.access_token,refresh:j.refresh_token,exp:Date.now()+j.expires_in*1000};save();boot()}catch(e){$('#er').textContent='No se pudo entrar: '+e}}
async function tok(){const a=S.auth;if(!a)return null;if(a.exp-Date.now()>6e4)return a.access;const r=await fetch(SB+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:a.refresh})});if(!r.ok)return null;const j=await r.json();S.auth={access:j.access_token,refresh:j.refresh_token,exp:Date.now()+j.expires_in*1000};save();return S.auth.access}
async function api(p,o={}){const t=await tok();if(!t)throw 0;return fetch(SB+'/rest/v1/'+p,{...o,headers:{apikey:KEY,Authorization:'Bearer '+t,'Content-Type':'application/json',...(o.headers||{})}})}
const COLS={cycles:['id','name','archived','deleted'],courses:['id','name','abbr','color','days','sort','deleted','cycle_id'],sessions:['id','course_id','number','date','content','deleted'],tasks:['id','course_id','title','due_date','due_time','done','snooze_until','snoozes','deleted']};
function sched(){clearTimeout(sy);sy=setTimeout(sync,3000)}
// _d: 1 = cambio pendiente, 2 = enviándose; si se edita durante el envío vuelve a 1 y no se pierde
let syncing=false;
async function sync(){if(!navigator.onLine||!S.auth||syncing)return;syncing=true;try{for(const T in COLS){const d=S[T].filter(x=>x._d);if(!d.length)continue;d.forEach(x=>x._d=2);let ok=false;
 try{const r=await api(T+'?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(d.map(x=>Object.fromEntries(COLS[T].map(k=>[k,x[k]]))))});ok=r.ok}
 finally{d.forEach(x=>{if(x._d==2)x._d=ok?0:1})}if(!ok)throw 1}
 // Un solo cursor para todas las tablas, con 2 min de margen por si una fila llega tarde
 const since=new Date(Date.parse(S.sync)-12e4).toISOString();let max=S.sync;
 for(const T in COLS){const r=await api(T+'?select=*&order=updated_at.asc&updated_at=gt.'+encodeURIComponent(since));if(!r.ok)throw 1;(await r.json()).forEach(w=>{const i=S[T].findIndex(x=>x.id==w.id);if(i<0)S[T].push(w);else if(!S[T][i]._d)S[T][i]=w;if(w.updated_at>max)max=w.updated_at})}
 S.sync=max;save();status('Sincronizado ✓')}catch(e){save();status('Sin sincronizar')}finally{syncing=false}}
async function fn(a,x={}){const t=await tok();if(!t)throw 'inicia sesión primero';const r=await fetch(SB+'/functions/v1/push',{method:'POST',headers:{Authorization:'Bearer '+t,'Content-Type':'application/json',apikey:KEY},body:JSON.stringify({action:a,...x})});if(!r.ok)throw 'error '+r.status;return r.json()}
const u8=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(s+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0))};
async function avisos(){try{if(!('Notification'in window)||!('PushManager'in window))return info('Avisos no disponibles','Este navegador no admite avisos. Usa Chrome con la app instalada.');
 if(await Notification.requestPermission()!='granted')return info('Permiso denegado','Actívalo en los ajustes de notificaciones del celular.');
 const reg=await navigator.serviceWorker.ready,{key}=await fn('key'),k=u8(key);let sub=await reg.pushManager.getSubscription();
 // Si la clave del servidor cambió, la suscripción vieja ya no sirve: se rehace
 if(sub){const o=sub.options.applicationServerKey;if(!o||new Uint8Array(o).join()!=k.join()){await sub.unsubscribe();sub=null}}
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:k});
 await fn('subscribe',{sub:sub.toJSON()});toast('Avisos activados ✓')}catch(e){toast('No se pudo activar: '+e,null,'err')}}
async function prueba(){try{const r=await fn('test');r.sent?toast('Aviso enviado ✓ Llegará en unos segundos'):info('Sin celular registrado','Toca “Activar avisos” primero.')}catch(e){toast('Error: '+e,null,'err')}}
