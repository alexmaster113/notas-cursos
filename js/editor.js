// Editor con formato: la nota se guarda como HTML limpio (solo etiquetas permitidas).
// Las notas viejas en texto plano se convierten al abrirlas; búsqueda y vista previa usan el texto sin formato.
// Las notas con formato se guardan con el marcador <!--h--> para no confundirlas con texto plano que empiece por "<".
// Las guardadas por la v2.4.0 (sin marcador) se reconocen porque el editor nunca guarda saltos de línea.
const HM='<!--h-->',isH=c=>(c||'').startsWith(HM)||!(c||'').includes('\n')&&/^<(p|div|ul|ol|h[23]|blockquote)[\s>]/.test(c||''),
toH=t=>(t||'').split('\n').map(l=>'<p>'+(esc(l.replace(/^ +/,m=>'\u00a0'.repeat(m.length)).replace(/  /g,' \u00a0'))||'<br>')+'</p>').join(''),
// Etiquetas que la nota puede tener; cualquier otra se quita (si es peligrosa, con su contenido)
OKT=new Set(['P','DIV','BR','B','STRONG','I','EM','U','S','STRIKE','MARK','H2','H3','UL','OL','LI','BLOCKQUOTE']),
OKC=/^(hl-[ygpc]|pq)$/,MAPT={H1:'H2',H4:'H3',H5:'H3',H6:'H3'},BLK=/^(PRE|SECTION|ARTICLE|HEADER|FOOTER|MAIN|ASIDE|NAV|FIGURE|ADDRESS|TABLE|TR|TD|TH|CAPTION|DL|DT|DD)$/,BAD=/^(SCRIPT|STYLE|IFRAME|FRAME|OBJECT|EMBED|TEMPLATE|SVG|MATH|NOSCRIPT|TEXTAREA|SELECT|OPTION|BUTTON|INPUT|FORM|IMG|PICTURE|VIDEO|AUDIO|SOURCE|CANVAS|LINK|META|BASE|HEAD|TITLE)$/;
function clean(h){const d=new DOMParser().parseFromString('<body>'+(h||''),'text/html'),out=document.createElement('div');
 // Solo elementos HTML (los de SVG/MathML se descartan); títulos de otras páginas pasan a Título/Subtítulo y los bloques desconocidos a una línea propia
 const walk=(src,dst)=>{for(const n of src.childNodes){if(n.nodeType==3)dst.append(n.data.replace(/\s*\n\s*/g,' '));else if(n.nodeType==1&&n.namespaceURI=='http://www.w3.org/1999/xhtml'&&!BAD.test(n.tagName)){const tg=MAPT[n.tagName]||n.tagName;
  if(BLK.test(tg)){const e=document.createElement('div');walk(n,e);if(e.firstChild)dst.append(e)}
  else if(OKT.has(tg)){const e=document.createElement(tg),c=[...n.classList].filter(x=>OKC.test(x));if(c.length)e.className=c.join(' ');if(tg!='BR')walk(n,e);if(/^(P|DIV)$/.test(tg)&&!e.firstChild)continue;dst.append(e)}else walk(n,dst)}}};
 walk(d.body,out);return out.innerHTML}
const noteH=c=>isH(c)?clean(c):toH(c);
// Texto plano de una nota (una línea por bloque); se guarda en caché porque la búsqueda lo pide en cada tecla
const PL=new Map();
function plain(c){if(!isH(c))return c||'';if(PL.has(c))return PL.get(c);const d=new DOMParser().parseFromString('<body>'+c,'text/html');
 d.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));d.querySelectorAll('p,div,h2,h3,li,blockquote').forEach(e=>e.append('\n'));
 const t=d.body.textContent.replace(/[ \t]+\n/g,'\n').replace(/\n{2,}/g,'\n').trim();if(PL.size>500)PL.clear();PL.set(c,t);return t}
const filled=s=>plain(s.content).trim()!='';

// Acciones del editor. Los botones usan onpointerdown con preventDefault para no quitar el foco ni la selección.
const edEl=()=>$('#tx');
function edCmd(c,v){const x=edEl();if(!x)return;x.focus();document.execCommand(c,false,v??null);edSync()}
const ind=()=>edCmd('indent'),outd=()=>edCmd('outdent'),bul=()=>edCmd('insertUnorderedList');
// Casilla ☐ al inicio de la línea donde está el cursor
function chk(){const x=edEl();x.focus();const sel=getSelection();if(!sel.rangeCount)return;let n=sel.anchorNode;
 while(n&&n!=x&&!(n.nodeType==1&&/^(P|DIV|H2|H3|LI)$/.test(n.tagName)))n=n.parentNode;
 if(!n||n==x){document.execCommand('insertText',false,'☐ ');return edSync()}
 const r=document.createRange();r.setStart(n,0);r.collapse(true);sel.removeAllRanges();sel.addRange(r);document.execCommand('insertText',false,'☐ ');edSync()}
// Si el editor queda vacío o con texto suelto, se envuelve en un párrafo para que tenga renglones
function edFix(x){if(!x.firstChild||x.innerHTML=='<br>'){x.innerHTML='<p><br></p>';const r=document.createRange();r.setStart(x.firstChild,0);getSelection().removeAllRanges();getSelection().addRange(r)}
 else if([...x.childNodes].some(n=>n.nodeType==3&&n.data.trim()))document.execCommand('formatBlock',false,'p')}
// El navegador agrega estilos en línea (p. ej. margin en la sangría); se quitan para que mande la hoja de estilos
// Chrome mete listas dentro de párrafos (<p><ul>), que al reabrir se partirían en líneas vacías: al guardar, ese <p> pasa a <div>
function edSync(){const x=edEl();if(!x)return;edFix(x);x.querySelectorAll('[style]').forEach(e=>e.removeAttribute('style'));
 const c=x.cloneNode(true);c.querySelectorAll('p:has(ul,ol,blockquote,p,div,h2,h3)').forEach(p=>{const d=document.createElement('div');d.append(...p.childNodes);p.replaceWith(d)});typ(HM+c.innerHTML)}
function edInit(x){try{document.execCommand('defaultParagraphSeparator',false,'p')}catch(e){}
 x.addEventListener('input',()=>{if(!busy)edSync()});
 // Pegar: solo formato permitido; nada de estilos ni código de otras páginas
 x.addEventListener('paste',e=>{e.preventDefault();const d=e.clipboardData,h=d.getData('text/html');
  const c=h&&clean(h);if(c&&plain(c).trim())document.execCommand('insertHTML',false,c);else document.execCommand('insertText',false,d.getData('text/plain'));edSync()});
 x.addEventListener('drop',e=>e.preventDefault());
 // Tab con teclado físico (PC): sangría
 x.addEventListener('keydown',e=>{if(e.key=='Tab'){e.preventDefault();e.shiftKey?outd():ind()}})}

// v2.5.0 — botón Aa: tamaños, negrita y sombreado sobre el texto seleccionado.
// Se recuerda la última selección dentro de la nota porque en Android tocar un botón puede quitarla.
let lastR=null,fmtOpen=false,busy=false;
const HL={'hl-y':'#fde68a','hl-g':'#bbf7d0','hl-p':'#fbcfe8','hl-c':'#bae6fd'},HLN={'hl-y':'amarillo','hl-g':'verde','hl-p':'rosa','hl-c':'celeste'};
document.addEventListener('selectionchange',()=>{const x=edEl(),s=getSelection();if(!x||!s.rangeCount)return;const r=s.getRangeAt(0);
 // Si la nota no tiene el foco (se tocó un botón), no se pisa la selección que había
 if(x.contains(r.commonAncestorContainer)&&(document.activeElement==x||!r.collapsed)){lastR=r.cloneRange();fmtState()}});
// Tocar la barra de abajo o la de formato no debe quitarle el foco ni la selección a la nota
document.addEventListener('mousedown',e=>{if(e.target.closest('.tools,.fmt'))e.preventDefault()});
// Manda la selección actual si está en la nota; la recordada solo se usa si la actual se perdió (cursor sin selección)
function keepSel(){const x=edEl(),s=getSelection(),cur=s.rangeCount?s.getRangeAt(0).cloneRange():null,inX=cur&&x.contains(cur.commonAncestorContainer),
 r=inX&&(!cur.collapsed||!lastR||lastR.collapsed)?cur:lastR;x.focus();if(r&&x.contains(r.commonAncestorContainer)){s.removeAllRanges();s.addRange(r);lastR=r.cloneRange()}}
// ¿La selección cubre de verdad parte del texto de e? (no basta con tocar su borde, como al seleccionar una línea en Android)
function hits(r,e){const er=document.createRange();er.selectNodeContents(e);if(er.comparePoint(r.startContainer,r.startOffset)>0||er.comparePoint(r.endContainer,r.endOffset)<0)return false;
 if(er.comparePoint(r.startContainer,r.startOffset)==0)er.setStart(r.startContainer,r.startOffset);if(er.comparePoint(r.endContainer,r.endOffset)==0)er.setEnd(r.endContainer,r.endOffset);return er.toString()!=''}
// Bloques (líneas) que toca la selección
function selBlocks(){const x=edEl(),s=getSelection();if(!x||!s.rangeCount)return[];const r=s.getRangeAt(0);
 const b=r.collapsed?[]:[...x.querySelectorAll('p,div,h2,h3,li')].filter(e=>!e.querySelector('p,div,h2,h3,li')&&hits(r,e));
 if(!b.length){let n=r.startContainer;while(n&&n!=x&&!(n.nodeType==1&&/^(P|DIV|H2|H3|LI)$/.test(n.tagName)))n=n.parentNode;if(n&&n!=x)b.push(n)}return b}
// El tamaño se aplica a la línea completa, así los renglones siguen alineados
const quiet=f=>{busy=true;try{f()}finally{busy=false}};
function fSize(t){keepSel();quiet(()=>document.execCommand('formatBlock',false,t=='pq'?'p':t));selBlocks().forEach(e=>e.classList.toggle('pq',t=='pq'));edSync();fmtState()}
function fInl(c){keepSel();quiet(()=>{document.execCommand('styleWithCSS',false,false);document.execCommand(c)});edSync();fmtState()}
// Sombreado: Chrome lo pone como estilo en línea; se cambia por <mark class> (los estilos en línea no se guardan)
function fHl(c){keepSel();const x=edEl(),s=getSelection();if(!s.rangeCount||s.isCollapsed)return toast('Primero selecciona el texto que quieres sombrear');
 if(c){quiet(()=>{document.execCommand('styleWithCSS',false,true);document.execCommand('hiliteColor',false,HL[c]);document.execCommand('styleWithCSS',false,false)});
  // Chrome a veces pone el color en un <span> nuevo y a veces en la etiqueta ya existente (p. ej. <b>)
  const ms=[];x.querySelectorAll('[style]').forEach(el=>{if(!el.style.backgroundColor)return;el.style.backgroundColor='';const m=document.createElement('mark');m.className=c;m.append(...el.childNodes);
   el.tagName=='SPAN'?el.replaceWith(m):el.append(m);ms.push(m)});
  if(ms.length){const r=document.createRange();r.setStartBefore(ms[0]);r.setEndAfter(ms[ms.length-1]);s.removeAllRanges();s.addRange(r)}}
 else{const r=s.getRangeAt(0);x.querySelectorAll('mark').forEach(m=>{if(hits(r,m))m.replaceWith(...m.childNodes)})}
 edSync();fmtState()}
function fClear(){keepSel();const x=edEl(),s=getSelection();quiet(()=>document.execCommand('removeFormat'));
 if(s.rangeCount){const r=s.getRangeAt(0);x.querySelectorAll('mark').forEach(m=>{if(hits(r,m))m.replaceWith(...m.childNodes)})}fSize('p')}
// Botones marcados según el formato donde está el cursor (para saber qué está aplicado)
function fmtState(){const p=$('#fmt');if(!p||p.hidden)return;
 ['bold','italic','underline','strikeThrough'].forEach(c=>{const b=p.querySelector(`[data-c=${c}]`);if(b)b.setAttribute('aria-pressed',document.queryCommandState(c))});
 const bl=selBlocks()[0],t=!bl?'p':bl.classList.contains('pq')?'pq':/^H[23]$/.test(bl.tagName)?bl.tagName.toLowerCase():'p';
 p.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t==t))}
function togFmt(){const p=$('#fmt'),b=$('#aa');fmtOpen=p.hidden;p.hidden=!fmtOpen;b.setAttribute('aria-expanded',fmtOpen);b.classList.toggle('on',fmtOpen);fmtState()}
const fb=(on,label,inner,attrs='')=>`<button onpointerdown="event.preventDefault()" onclick="${on}" aria-label="${label}" ${attrs}>${inner}</button>`;
function fmtBar(){return`<div id=fmt class=fmt ${fmtOpen?'':'hidden'} role=toolbar aria-label="Formato del texto"><div class=frow>`+
 [['h2','Título'],['h3','Subtítulo'],['p','Normal'],['pq','Pequeño']].map(([t,l])=>fb(`fSize('${t}')`,l,`<span class=t-${t}>${l}</span>`,`data-t=${t} aria-pressed=false`)).join('')+
 `</div><div class=frow>`+[['bold','Negrita','<b>B</b>'],['italic','Cursiva','<i>I</i>'],['underline','Subrayado','<u>U</u>'],['strikeThrough','Tachado','<s>S</s>']].map(([c,l,h])=>fb(`fInl('${c}')`,l,h,`data-c=${c} aria-pressed=false`)).join('')+fb('fClear()','Quitar formato',I('erase'))+`</div><div class=frow>`+
 Object.keys(HL).map(c=>fb(`fHl('${c}')`,'Sombrear '+HLN[c],`<i class="sw ${c}"></i>`)).join('')+fb("fHl('')",'Quitar sombreado','<i class="sw no"></i>')+`</div></div>`}
