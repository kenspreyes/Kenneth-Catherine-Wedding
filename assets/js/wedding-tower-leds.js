/* Independent architectural LED controller — no synchronized CSS cycles.
   Each SVG emitter follows the existing 300x370 viewBox and artwork geometry. */
(()=>{'use strict';
 const scene=document.getElementById('proposal');
 if(!scene)return;
 const nodes=Array.from(scene.querySelectorAll('.kc-architectural-leds .kc-led'));
 if(!nodes.length)return;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const random=(a,b)=>a+Math.random()*(b-a);
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 const lights=nodes.map((el,i)=>({el,i,mode:Math.random(),start:0,end:0,peak:random(.67,1),base:0,
    wait:random(0,1300),duration:0,kind:0,level:-1}));
 let running=false,frameId=0,lastFrame=0,visible=true;
 function schedule(q,t){
   const r=Math.random();q.kind=r<.24?0:r<.78?1:2;
   q.duration=q.kind===0?random(100,250):q.kind===1?random(300,700):random(1000,2000);
   q.start=t+random(45,q.kind===2?700:1150);
   q.end=q.start+q.duration;
   q.peak=random(q.kind===0?.88:.58,1);
   q.base=q.kind===2?random(.015,.075):0;
 }
 function tick(t){
   frameId=0;
   if(!visible||!scene.classList.contains('is-tower-lit')){running=false;return;}
   if(t-lastFrame<28){frameId=requestAnimationFrame(tick);return;}
   lastFrame=t;
   for(const q of lights){
     if(!q.start){q.start=t+q.wait;q.end=q.start+random(120,700);q.duration=q.end-q.start;}
     if(t>=q.end){schedule(q,t);}
     let v=0;
     if(t>=q.start){
       const u=clamp((t-q.start)/q.duration);
       if(q.kind===0){v=u<.22?smooth(u/.22):u<.48?1:1-smooth((u-.48)/.52);}
       else if(q.kind===1){v=u<.27?smooth(u/.27):u<.57?1:1-smooth((u-.57)/.43);}
       else{v=.08+.92*Math.sin(Math.PI*u)**2;}
       v=q.base+(q.peak-q.base)*v;
     }
     // Some LEDs go completely dark, rather than remaining static pinpoints.
     if(Math.abs(v-q.level)>.015){q.el.style.opacity=v.toFixed(3);q.level=v;}
   }
   frameId=requestAnimationFrame(tick);
 }
 function wake(){if(running||!visible||!scene.classList.contains('is-tower-lit'))return;
   running=true;lastFrame=0;frameId=requestAnimationFrame(tick);}
 const watcher=new MutationObserver(wake);
 watcher.observe(scene,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)wake();});
 if(reduce.matches){for(const q of lights)q.el.style.opacity='.42';watcher.disconnect();return;}
 wake();
})();
