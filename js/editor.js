// Editor con formato: la nota se guarda como HTML limpio (solo etiquetas permitidas).
// Las notas viejas en texto plano se convierten al abrirlas; búsqueda y vista previa usan el texto sin formato.
const isH=c=>/^\s*</.test(c||''),
toH=t=>(t||'').split('\n').map(l=>'<p>'+(esc(l)||'<br>')+'</p>').join(''),
// Etiquetas que la nota puede tener; cualquier otra se quita (si es peligrosa, con su contenido)
OKT=new Set(['P','DIV','BR','B','STRONG','I','EM','U','S','STRIKE','MARK','H2','H3','UL','OL','LI','BLOCKQUOTE']),
OKC=/^(hl-[ygpc]|pq)$/,BAD=/^(SCRIPT|STYLE|IFRAME|FRAME|OBJECT|EMBED|TEMPLATE|SVG|MATH|NOSCRIPT|TEXTAREA|SELECT|OPTION|BUTTON|INPUT|FORM|IMG|PICTURE|VIDEO|AUDIO|SOURCE|CANVAS|LINK|META|BASE|HEAD|TITLE)$/;
function clean(h){const d=new DOMParser().parseFromString('<body>'+(h||''),'text/html'),out=document.createElement('div');
 const walk=(src,dst)=>{for(const n of src.childNodes){if(n.nodeType==3)dst.append(n.data);else if(n.nodeType==1&&!BAD.test(n.tagName)){
  if(OKT.has(n.tagName)){const e=document.createElement(n.tagName),c=[...n.classList].filter(x=>OKC.test(x));if(c.length)e.className=c.join(' ');if(n.tagName!='BR')walk(n,e);if(/^(P|DIV)$/.test(n.tagName)&&!e.firstChild)continue;dst.append(e)}else walk(n,dst)}}};
 walk(d.body,out);return out.innerHTML}
const noteH=c=>isH(c)?clean(c):toH(c);
// Texto plano de una nota (una línea por bloque); se guarda en caché porque la búsqueda lo pide en cada tecla
const PL=new Map();
function plain(c){if(!isH(c))return c||'';if(PL.has(c))return PL.get(c);const d=new DOMParser().parseFromString('<body>'+c,'text/html');
 d.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));d.querySelectorAll('p,div,h2,h3,li').forEach(e=>e.append('\n'));
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
 const c=x.cloneNode(true);c.querySelectorAll('p').forEach(p=>{if(p.querySelector('ul,ol,blockquote,p,div,h2,h3')){const d=document.createElement('div');d.append(...p.childNodes);p.replaceWith(d)}});typ(c.innerHTML)}
function edInit(x){try{document.execCommand('defaultParagraphSeparator',false,'p')}catch(e){}
 x.addEventListener('input',edSync);
 // Pegar: solo formato permitido; nada de estilos ni código de otras páginas
 x.addEventListener('paste',e=>{e.preventDefault();const d=e.clipboardData,h=d.getData('text/html');
  if(h)document.execCommand('insertHTML',false,clean(h));else document.execCommand('insertText',false,d.getData('text/plain'));edSync()});
 x.addEventListener('drop',e=>e.preventDefault());
 // Tab con teclado físico (PC): sangría
 x.addEventListener('keydown',e=>{if(e.key=='Tab'){e.preventDefault();e.shiftKey?outd():ind()}})}
