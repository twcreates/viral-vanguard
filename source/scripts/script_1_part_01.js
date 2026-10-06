
// boot screen: stays up at least 9 s (menu, avatar and music get time to come up), then fills the bar and fades to the main menu
const BOOT_T0=performance.now(),BOOT_MIN=9000;
addEventListener('load',()=>{const b=document.getElementById('boot');if(!b)return;const l=document.getElementById('bootl');
 const snd=()=>{if(l&&!b.classList.contains('ready'))l.textContent=(typeof AC!=='undefined'&&AC&&AC.state==='running')?'Loading Neon Core':'Loading Neon Core \u00b7 tap for sound'};snd();const si=setInterval(snd,500);
 setTimeout(()=>{clearInterval(si);if(l)l.textContent='Ready';b.classList.add('ready');
  setTimeout(()=>{b.classList.add('done');setTimeout(()=>b.remove(),700)},450)},Math.max(0,BOOT_MIN-(performance.now()-BOOT_T0)))});
