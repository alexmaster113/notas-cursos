// Arranque de la app y eventos globales
async function boot(){if(!S.auth)return render();if(!cur0().length)await Promise.race([sync(),new Promise(r=>setTimeout(r,4000))]);else sync();gen();cur0().length?(location.hash=='#tareas'?go('tareas'):home()):go('setup')}
addEventListener('pagehide',save);addEventListener('online',sync);document.addEventListener('visibilitychange',()=>{if(document.hidden){save();sync()}
 // Al volver a la app (quizá otro día) se crean las sesiones nuevas y se refresca la vista
 else if(S.auth){gen();if(['hoy','notas','tareas'].includes(V))render();sync()}});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
addEventListener('hashchange',()=>{if(location.hash=='#tareas'&&S.auth)go('tareas')});
document.addEventListener('click',e=>{if(e.target.closest('button,.s,.dc'))navigator.vibrate&&navigator.vibrate(8)});
boot();
