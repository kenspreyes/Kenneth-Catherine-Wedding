/* Reference-style invitation controls. Sound is a user-activated, original
   synthesized music-box waltz; no autoplay and no network dependency. */
(()=>{'use strict';
const music=document.querySelector('.kc-reference-music');
const info=document.querySelector('.kc-reference-info');
const sheet=document.querySelector('#kc-info-sheet');
if(!music||!info||!sheet)return;
const close=sheet.querySelector('.kc-reference-close');
info.addEventListener('click',()=>{if(!sheet.open){try{sheet.showModal()}catch(_){sheet.setAttribute('open','')}}});
close.addEventListener('click',()=>sheet.close());
sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.close()});
sheet.querySelectorAll('.kc-reference-jumps a').forEach(a=>a.addEventListener('click',()=>sheet.close()));

// Swipe down from the header (or from the top of the scrollable panel) to dismiss.
// Keep normal vertical scrolling available when the information extends below the screen.
const inner=sheet.querySelector('.kc-reference-sheet-inner');
const head=sheet.querySelector('.kc-reference-sheet-head');
let startY=0,dragY=0,tracking=false,dragging=false,startInHeader=false;
function resetSheetDrag(){tracking=false;dragging=false;dragY=0;sheet.classList.remove('kc-sheet-dragging');sheet.classList.add('kc-sheet-settling');sheet.style.transform='';setTimeout(()=>sheet.classList.remove('kc-sheet-settling'),240)}
sheet.addEventListener('touchstart',e=>{
 if(!sheet.open||e.touches.length!==1)return;
 startInHeader=!!e.target.closest('.kc-reference-sheet-head');
 if(!startInHeader&&inner.scrollTop>2)return;
 startY=e.touches[0].clientY;dragY=0;tracking=true;dragging=false;
},{passive:true});
sheet.addEventListener('touchmove',e=>{
 if(!tracking||e.touches.length!==1)return;
 const delta=e.touches[0].clientY-startY;
 if(delta<0){if(!dragging)tracking=false;return;}
 if(!startInHeader&&inner.scrollTop>2){resetSheetDrag();return;}
 if(delta<8&&!dragging)return;
 dragging=true;dragY=Math.min(delta,window.innerHeight*.65);
 sheet.classList.remove('kc-sheet-settling');sheet.classList.add('kc-sheet-dragging');
 sheet.style.transform=`translate3d(0,${dragY}px,0)`;
 if(e.cancelable)e.preventDefault();
},{passive:false});
sheet.addEventListener('touchend',()=>{
 if(!tracking)return;
 const dismiss=dragging&&dragY>85;
 resetSheetDrag();
 if(dismiss)sheet.close();
},{passive:true});
sheet.addEventListener('touchcancel',resetSheetDrag,{passive:true});
sheet.addEventListener('close',resetSheetDrag);

let ctx=null,master=null,playing=false,timer=null,next=0,index=0;
const melody=[[69,1],[72,1],[77,1],[76,2],[74,1],[72,1],[69,1],[67,1],[69,3],[70,1],[74,1],[79,1],[77,2],[76,1],[74,1],[76,1],[79,1],[77,3],[72,1],[77,1],[81,1],[79,2],[77,1],[76,1],[74,1],[72,1],[74,3]];
const freq=n=>440*Math.pow(2,(n-69)/12);
function init(){
 if(ctx)return true;
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC)return false;
 try{ctx=new AC();master=ctx.createGain();master.gain.value=.12;master.connect(ctx.destination);return true}catch(_){return false}
}
function bell(m,t){
 const o=ctx.createOscillator(),g=ctx.createGain();
 o.type='sine';o.frequency.value=freq(m);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+1.65);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+1.7);
}
function tick(){
 if(!playing||!ctx||ctx.state!=='running')return;
 while(next<ctx.currentTime+.25){const [m,beats]=melody[index];bell(m,next);if(index%3===0)bell(m-12,next);next+=beats*.56;index=(index+1)%melody.length}
}
function stop(){playing=false;if(timer!==null)clearInterval(timer);timer=null;music.setAttribute('aria-pressed','false');music.setAttribute('aria-label','Turn on background music');if(ctx&&ctx.state==='running')ctx.suspend().catch(()=>{})}
music.addEventListener('click',async()=>{
 if(playing){stop();return}
 if(!init()){music.title='Audio unavailable in this browser';return}
 try{await ctx.resume();playing=true;next=ctx.currentTime+.07;index=0;tick();timer=setInterval(tick,100);music.setAttribute('aria-pressed','true');music.setAttribute('aria-label','Turn off background music')}catch(_){stop()}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop()});
window.addEventListener('pagehide',stop);
})();
