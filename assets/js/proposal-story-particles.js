/* Lightweight gold drifting lights, adapted from the Entourage effect.
   Canvas is scoped to the Proposal STORY ONLY, never the tower or ring box. */
(()=>{'use strict';
 const area=document.getElementById('proposal-story');
 const canvas=area&&area.querySelector('.kc-story-gold-particles');
 if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const rand=(a,b)=>a+Math.random()*(b-a);
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 let w=0,h=0,dpr=1,dots=[],visible=false,raf=0,last=0;
 function resize(){
  const nw=Math.max(1,area.clientWidth),nh=Math.max(1,area.offsetHeight);
  if(Math.abs(nw-w)<2&&Math.abs(nh-h)<2)return;
  const ow=w||nw,oh=h||nh;w=nw;h=nh;
  dpr=Math.min(devicePixelRatio||1,1.25);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count=w<700?12:23;
  if(!dots.length){dots=Array.from({length:count},()=>({x:rand(0,w),y:rand(0,h),vx:rand(-7,7),vy:rand(-7,7),r:rand(1.2,2.4),ph:rand(0,6.28)}));}
  else {dots.forEach(p=>{p.x=p.x/ow*w;p.y=p.y/oh*h;});dots.length=Math.min(dots.length,count);}
 }
 function draw(now){
  const dt=last?Math.min(.055,(now-last)/1000):0;last=now;
  ctx.clearRect(0,0,w,h);const t=now*.001;
  for(const p of dots){
   p.vx=clamp(p.vx+rand(-12,12)*dt,-11,11);p.vy=clamp(p.vy+rand(-12,12)*dt,-10,10);
   p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(p.x<-15)p.x=w+10;if(p.x>w+15)p.x=-10;
   if(p.y<-15)p.y=h+10;if(p.y>h+15)p.y=-10;
   ctx.globalAlpha=.18+.63*Math.abs(Math.sin(t*.85+p.ph));
   ctx.fillStyle='#FFD98A';ctx.shadowColor='#FFC861';ctx.shadowBlur=8;
   ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.shadowBlur=0;
 }
 function frame(now){raf=0;if(!visible||document.hidden||reduce)return;
  // Cap to ~24fps; do not compete with the tower shader and lantern effects.
  if(!last||now-last>=40)draw(now);
  raf=requestAnimationFrame(frame);
 }
 function start(){if(raf||!visible||document.hidden||reduce)return;last=0;raf=requestAnimationFrame(frame);}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
 resize();
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:0,rootMargin:'80px 0px'});
 observer.observe(area);
 if('ResizeObserver'in window)new ResizeObserver(resize).observe(area);
 else window.addEventListener('resize',resize,{passive:true});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
})();
