// Pestaña Tareas: colores por cercanía, Hecha, Posponer 3 días, formulario
const EM=['🟢','🟡','🔴','⚫'],CT=['var(--ok)','var(--warn)','var(--bad)','var(--late)'];let shd=false,te={},tf=null;
const h12=x=>{const[h,m]=x.split(':'),H=+h;return(H%12||12)+':'+m+(H<12?' a. m.':' p. m.')};
function tinfo(t){const n=new Date(),dd=Math.round((dt(t.due_date)-dt(today()))/864e5),tm=t.due_time?t.due_time.slice(0,5):'',hm=tm?+tm.slice(0,2)*60+ +tm.slice(3,5):0,
 over=dd<0||(dd==0&&tm&&n.getHours()*60+n.getMinutes()>hm),lv=over?3:dd>=4?0:dd>=2?1:2;
 return{lv,over,txt:over?(dd<0?`atrasada ${-dd} ${-dd==1?'día':'días'}`:'atrasada (pasó la hora)'):dd==0?'vence hoy':dd==1?'vence mañana':`faltan ${dd} días`}}
const tlist=()=>live(S.tasks).filter(t=>{const c=S.courses.find(x=>x.id==t.course_id);return!(c&&c.cycle_id)}),tkey=t=>t.due_date+(t.due_time||'99'),
pend=()=>tlist().filter(t=>!t.done).sort((a,b)=>tkey(a).localeCompare(tkey(b)));
function tcard(t){const i=tinfo(t),c=S.courses.find(x=>x.id==t.course_id);
 return`<div class=tk style="--tc:${CT[i.lv]}"><div class=th><i class=tg style="--c:${c?c.color:'var(--mu)'}">${esc(c?c.abbr:'—')}</i><b>${esc(t.title)}</b></div><div class=tm><span class=due>${i.txt}</span><span class=mu>${fmt(t.due_date)}${t.due_time?' · '+h12(t.due_time):''}</span></div>${t.snooze_until&&t.snooze_until>=today()?`<div class=mu>${I('clock','xs')} Avisos hasta ${fmt(t.snooze_until)}</div>`:''}<div class=tb2><button onclick="doneT('${t.id}',1)">${I('check','xs')}Hecha</button>${i.over?`<button class=sn onclick="snz('${t.id}')">${I('clock','xs')}Posponer 3 días</button>`:''}<button onclick="tform('${t.id}')" aria-label="Editar tarea">${I('pencil','xs')}</button></div></div>`}
function tareas(){const act=pend(),dn=tlist().filter(t=>t.done);
 $('#m').innerHTML=`<header class="hd row2"><h1>Tareas</h1><button class=add onclick="tform()">${I('plus','xs')}Nueva</button></header>`+(act.map(tcard).join('')||`<div class="card note">${I('check')}<div><b>Nada pendiente</b><span class=mu>Agrega una con “Nueva”.</span></div></div>`)+
 (dn.length?`<button class=fold onclick="shd=!shd;tareas()">Hechas (${dn.length})${I(shd?'chevD':'chevR','xs')}</button>`+(shd?dn.map(t=>`<div class="tk dn"><div class=th>${I('check','xs')}<b>${esc(t.title)}</b></div><div class=tb2><button onclick="doneT('${t.id}',0)">${I('undo','xs')}Deshacer</button></div></div>`).join(''):''):'')}
function doneT(id,v,quiet){const t=S.tasks.find(x=>x.id==id);t.done=!!v;t._d=1;save();sched();render();if(v&&!quiet)toast('Tarea hecha',()=>doneT(id,0,1))}
function snz(id){const t=S.tasks.find(x=>x.id==id),b=t.snooze_until&&t.snooze_until>today()?t.snooze_until:today();t.snooze_until=addd(b,3);t.snoozes=(t.snoozes||0)+1;t._d=1;save();sched();render();toast('Avisos hasta '+fmt(t.snooze_until))}
function tform(id,cid,from){const t=id&&S.tasks.find(x=>x.id==id)||{};te={id:t.id,back:V=='hoy'?'hoy':'tareas'};tf=from||null;V='tform';chrome();const sel=t.course_id||cid||'';
 $('#m').innerHTML=`<div class=edh><button class=ic onclick=back2() aria-label="Volver">${I('chevL')}</button><h2>${id?'Editar':'Nueva'} tarea</h2></div><label>Curso<select id=tc>${cur0().map(c=>`<option value=${c.id}${c.id==sel?' selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Tarea<input id=tn value="${esc(t.title||'')}" placeholder="Trabajo 2"></label><label>Fecha de entrega<input id=td type=date value="${t.due_date||''}"></label><label>Hora límite (opcional)<input id=th type=time value="${(t.due_time||'').slice(0,5)}"></label><button class=btn onclick=saveT()>${I('check','xs')}Guardar</button>${id?`<button class="btn2 dng" onclick="delT('${id}')">${I('trash','xs')}Eliminar</button>`:''}`}
function back2(){tf?go('ed',tf):go(te.back||'tareas')}
function saveT(){const title=$('#tn').value.trim(),c=$('#tc').value,d=$('#td').value,h=$('#th').value;if(!title||!c||!d)return toast('Completa curso, tarea y fecha.',null,'err');
 let t=te.id&&S.tasks.find(x=>x.id==te.id);if(!t){t={id:crypto.randomUUID(),done:false,snooze_until:null,snoozes:0,deleted:false};S.tasks.push(t)}
 Object.assign(t,{course_id:c,title,due_date:d,due_time:h||null,_d:1});save();sched();back2();toast('Tarea guardada')}
function delT(id){const t=S.tasks.find(x=>x.id==id);t.deleted=true;t._d=1;save();sched();back2();toast('Tarea eliminada',()=>{t.deleted=false;t._d=1;save();sched();render()})}
