// Pantalla "Hoy": curso del día, semana y tareas más urgentes
const hola=()=>{const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'};
function todayCard(c,s){return`<button class=today style="--c:${c.color}" onclick="openToday('${c.id}')"><span class=tg>${esc(c.abbr)}</span><b>${esc(c.name)}</b><span class=meta>${s?`Sesión ${s.number}${s.content.trim()?' · ya tiene notas':' · en blanco'}`:''}</span><span class=go>${I('pencil','xs')}Escribir</span></button>`}
function nextClass(){const t=today();for(let i=1;i<=7;i++){const d=addd(t,i),c=cur0().find(c=>c.days.includes(wd(d)));if(c)return{c,i,d}}}
function hoyV(){const t=today(),d=dt(t),cs=cur0().filter(c=>c.days.includes(wd(t))),nx=nextClass();
 let h=`<header class=hd><small>${hola()}</small><h1>${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}</h1></header>`;
 h+=cs.length?cs.map(c=>todayCard(c,sesHoy(c.id))).join(''):`<div class="card note">${I('cal')}<div><b>Hoy no tienes clase</b><span class=mu>${nx?`Próxima: ${esc(nx.c.name)} · ${nx.i==1?'mañana':DIAS[wd(nx.d)]}`:'Agrega tus cursos en Ajustes'}</span></div></div>`;
 h+=`<h2 class=sec>Esta semana</h2><div class=wk>`+[1,2,3,4,5].map(n=>{const l=cur0().filter(c=>c.days.includes(n));return`<div class="wd${n==wd(t)?' on':''}"><small>${DIAS[n]}</small>${l.map(c=>`<i style="--c:${c.color}">${esc(c.abbr)}</i>`).join('')||'<em>—</em>'}</div>`}).join('')+`</div>`;
 const act=pend();h+=`<h2 class=sec>Tareas próximas</h2>`+(act.slice(0,3).map(tcard).join('')||`<div class="card note">${I('check')}<div><b>Nada pendiente</b><span class=mu>Cuando agregues tareas aparecerán aquí.</span></div></div>`)+
 (act.length>3?`<button class=btn2 onclick="go('tareas')">Ver todas (${act.length})${I('chevR','xs')}</button>`:'');
 $('#m').innerHTML=h}
