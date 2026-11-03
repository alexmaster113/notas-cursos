// Configuración, estado guardado, utilidades de fechas y navegación entre pantallas
const SB='https://yxvdpqzpiqkkcucdyywt.supabase.co',KEY='sb_publishable_mHsaAjfGkjz3hjptYCbLBA_z2ZD3y7o',LS='nc1',$=s=>document.querySelector(s);
let S=JSON.parse(localStorage.getItem(LS)||'null')||{courses:[],sessions:[],sync:'1970-01-01T00:00:00Z',auth:null},V='',cur=null,q='',tm,sy;
S.tasks=S.tasks||[];S.cycles=S.cycles||[];
if(S.sb!==SB){S.sb=SB;S.sync='1970-01-01T00:00:00Z';S.auth=null;[S.cycles,S.courses,S.sessions,S.tasks].forEach(a=>a.forEach(x=>x._d=1))}
const save=()=>localStorage.setItem(LS,JSON.stringify(S)),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10),today=()=>iso(new Date()),dt=s=>new Date(s+'T12:00:00'),
addd=(s,n)=>{const d=dt(s);d.setDate(d.getDate()+n);return iso(d)},wd=s=>dt(s).getDay(),fmt=s=>dt(s).toLocaleDateString('es-PE',{weekday:'short',day:'numeric',month:'short'}),
live=a=>a.filter(x=>!x.deleted),status=t=>{$('#sy').textContent=t};
const DIAS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre'];
const I=(n,c='')=>`<svg class="i ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
function step(c,s,k){for(let i=1;i<15;i++){const d=addd(s,i*k);if(c.days.includes(wd(d)))return d}}
function gen(){S.courses.forEach(c=>{if(c.deleted||c.cycle_id)return;const all=S.sessions.filter(s=>s.course_id==c.id);if(!all.length)return;let n=Math.max(0,...live(all).map(s=>s.number)),d=all.map(s=>s.date).sort().pop();
 for(let x=step(c,d,1);x&&x<=today();x=step(c,x,1)){S.sessions.push({id:crypto.randomUUID(),course_id:c.id,number:++n,date:x,content:'',deleted:false,_d:1})}});save()}
let ACY=null;const cur0=()=>live(S.courses).filter(c=>!c.cycle_id),ccy=()=>live(S.courses).filter(c=>ACY?c.cycle_id==ACY:!c.cycle_id);
function go(v,x){V=v;cur=x;const m=$('#m');m.scrollTop=0;m.classList.remove('fx');void m.offsetWidth;m.classList.add('fx');render()}
function home(){const t=today(),cs=cur0().filter(c=>c.days.includes(wd(t)));if(!cs.length)return go('tareas');if(cs.length==1)return openToday(cs[0].id);go('pick',cs.map(c=>c.id))}
function sesHoy(id){const l=live(S.sessions).filter(s=>s.course_id==id).sort((a,b)=>b.number-a.number);return l.find(s=>s.date==today())||l[0]}
function openToday(id){const s=sesHoy(id);s?go('ed',s.id):go('notas')}
const FULL=['ed','setup','editc','adj','tform'];
function chrome(){const m=$('#m'),hide=!S.auth||FULL.includes(V);$('#tb').style.display=hide?'none':'flex';m.classList.toggle('full',V=='ed');m.classList.toggle('nonav',hide);
 document.querySelectorAll('nav button').forEach((b,i)=>b.classList.toggle('on',['hoy','notas','tareas','cfg'][i]==V))}
function render(){const m=$('#m');if(V!='notas'&&V!='ed'&&V!='adj')ACY=null;chrome();
 if(!S.auth)return login();
 if(V=='pick')m.innerHTML=`<header class=hd><small>Hoy tienes dos cursos</small><h1>¿Cuál abres?</h1></header>`+cur.map(id=>{const c=S.courses.find(x=>x.id==id),s=sesHoy(id);return todayCard(c,s)}).join('');
 else if(V=='hoy')hoyV();
 else if(V=='notas'){m.innerHTML=`<header class=hd><h1>Notas</h1></header>`+(ACY?`<div class="card note">${I('archive')}<div><b>${esc((S.cycles.find(y=>y.id==ACY)||{}).name)}</b><span class=mu>Ciclo archivado</span></div><button class=btn2 onclick="ACY=null;go('notas')">Volver</button></div>`:'')+`<label class=srch>${I('search')}<input id=q type=search placeholder="Buscar en todas las notas" value="${esc(q)}" oninput="q=this.value;list()"></label><div id=ls></div>`;list()}
 else if(V=='ed')ed();
 else if(V=='tareas')tareas();
 else if(V=='editc')editc();
 else if(V=='papel')papel();
 else if(V=='adj')adj();
 else if(V=='setup')setup();
 else if(V=='tform')return;
 else cfg()}
