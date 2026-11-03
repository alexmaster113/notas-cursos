// Ventanas propias (hojas que suben desde abajo) y avisos cortos con "Deshacer"
function sheet(html){return new Promise(ok=>{const ov=$('#ov'),sh=$('#sh');sh.innerHTML='<i class=grab></i>'+html;ov.hidden=sh.hidden=false;requestAnimationFrame(()=>{ov.classList.add('on');sh.classList.add('on')});
 const close=v=>{ov.classList.remove('on');sh.classList.remove('on');setTimeout(()=>{ov.hidden=sh.hidden=true},220);ov.onclick=null;ok(v)};
 ov.onclick=()=>close(null);sh.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>close(b.dataset.v=='val'?sh.querySelector('input').value:b.dataset.v=='1'));
 const inp=sh.querySelector('input');if(inp){inp.focus();inp.onkeydown=e=>{if(e.key=='Enter')close(inp.value)}}})}
function ask(title,msg='',{ok='Aceptar',no='Cancelar',danger=false}={}){return sheet(`<h3>${title}</h3>${msg?`<p class=mu>${msg}</p>`:''}<button class="btn${danger?' dng':''}" data-v=1>${ok}</button><button class=btn2 data-v=0>${no}</button>`).then(v=>v===true)}
function askText(title,label,ph=''){return sheet(`<h3>${title}</h3><label>${label}<input placeholder="${esc(ph)}"></label><button class=btn data-v=val>Aceptar</button><button class=btn2 data-v=0>Cancelar</button>`).then(v=>typeof v=='string'?v.trim():null)}
function info(title,msg){return sheet(`<h3>${title}</h3><p class=mu>${msg}</p><button class=btn data-v=1>Entendido</button>`)}
let tt;function toast(msg,undo,kind=''){const t=$('#toast');clearTimeout(tt);t.className='toast '+kind;t.innerHTML=`<span>${esc(msg)}</span>`+(undo?`<button>${I('undo','xs')}Deshacer</button>`:'');
 if(undo)t.querySelector('button').onclick=()=>{undo();t.classList.remove('on')};t.hidden=false;requestAnimationFrame(()=>t.classList.add('on'));tt=setTimeout(()=>t.classList.remove('on'),undo?5000:2600)}
