// Ventanas propias (hojas que suben desde abajo) y avisos cortos con "Deshacer"
// La hoja es modal: bloquea el fondo, se cierra con Atrás/Escape y devuelve el foco al cerrar
let shT,skipPop=0,onBack=null;addEventListener('popstate',()=>{if(skipPop){skipPop--;return}onBack&&onBack()});
function sheet(html){return new Promise(ok=>{const ov=$('#ov'),sh=$('#sh'),bg=[$('#m'),$('#tb')],prev=document.activeElement;clearTimeout(shT);
 sh.innerHTML='<i class=grab></i>'+html;const h=sh.querySelector('h3');if(h)h.id='sht';ov.hidden=sh.hidden=false;bg.forEach(e=>e.inert=true);
 requestAnimationFrame(()=>{ov.classList.add('on');sh.classList.add('on')});history.pushState({sheet:1},'');let done=false;
 const kd=e=>{if(e.key=='Escape'){e.preventDefault();close(null)}else if(e.key=='Tab'){const f=[...sh.querySelectorAll('button,input')],a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement==a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement==z){e.preventDefault();a.focus()}}},
 pp=()=>close(null,true);
 const close=(v,fromBack)=>{if(done)return;done=true;removeEventListener('keydown',kd,true);onBack=null;if(!fromBack&&history.state&&history.state.sheet){skipPop++;history.back()}
  bg.forEach(e=>e.inert=false);ov.classList.remove('on');sh.classList.remove('on');shT=setTimeout(()=>{ov.hidden=sh.hidden=true},220);ov.onclick=null;prev&&prev.focus&&prev.focus();ok(v)};
 addEventListener('keydown',kd,true);onBack=pp;
 ov.onclick=()=>close(null);sh.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>close(b.dataset.v=='val'?sh.querySelector('input').value:b.dataset.v=='1'));
 const inp=sh.querySelector('input');if(inp){inp.focus();inp.onkeydown=e=>{if(e.key=='Enter')close(inp.value)}}else(sh.querySelector('.btn2')||sh.querySelector('button')).focus()})}
function ask(title,msg='',{ok='Aceptar',no='Cancelar',danger=false}={}){return sheet(`<h3>${title}</h3>${msg?`<p class=mu>${msg}</p>`:''}<button class="btn${danger?' dng':''}" data-v=1>${ok}</button><button class=btn2 data-v=0>${no}</button>`).then(v=>v===true)}
function askText(title,label,ph=''){return sheet(`<h3>${title}</h3><label>${label}<input placeholder="${esc(ph)}"></label><button class=btn data-v=val>Aceptar</button><button class=btn2 data-v=0>Cancelar</button>`).then(v=>typeof v=='string'?v.trim():null)}
function info(title,msg){return sheet(`<h3>${title}</h3><p class=mu>${msg}</p><button class=btn data-v=1>Entendido</button>`)}
// El aviso se queda mientras el dedo o el foco estén encima; con "Deshacer" dura 10 s
let tt;function toast(msg,undo,kind=''){const t=$('#toast'),D=undo?1e4:kind=='err'?6000:4000,hide=()=>{t.classList.remove('on');t.inert=true},arm=()=>{clearTimeout(tt);tt=setTimeout(hide,D)};
 clearTimeout(tt);t.className='toast '+kind;t.setAttribute('role',kind=='err'?'alert':'status');t.inert=false;t.innerHTML=`<span>${esc(msg)}</span>`+(undo?`<button>${I('undo','xs')}Deshacer</button>`:'');
 if(undo)t.querySelector('button').onclick=()=>{undo();hide()};t.onpointerenter=t.onfocusin=()=>clearTimeout(tt);t.onpointerleave=t.onfocusout=arm;
 requestAnimationFrame(()=>t.classList.add('on'));arm()}
