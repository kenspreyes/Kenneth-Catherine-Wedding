(()=>{'use strict';
const section=document.querySelector('.kc-cast-section');if(!section)return;
const canvas=section.querySelector('.kc-cast-particles');
if(!canvas)return;
const ctx=canvas.getContext('2d');if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let visible=false,playing=false,paused=false,raf=0,last=0,hold=0,pos=0,particles=[],w=0,h=0,dpr=1;
function resize(force=false){
  // The mobile address bar changes the viewport height during scroll. Do not
  // treat that as a new particle scene or recreate random particles.
  const width=Math.max(1,Math.round(section.clientWidth));
  const height=Math.max(1,Math.round(section.getBoundingClientRect().height));
  const pixelRatio=Math.min(window.devicePixelRatio||1,1.5);
  if(!force&&Math.abs(width-w)<2&&Math.abs(height-h)<2&&pixelRatio===dpr)return;
  const oldW=w||width,oldH=h||height;
  w=width;h=height;dpr=pixelRatio;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(!particles.length){
    const count=reduced?0:Math.min(65,Math.max(24,Math.floor(w*h/17000)));
    particles=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,r:.6+Math.random()*1.6,vy:5+Math.random()*15,vx:(Math.random()-.5)*7,phase:Math.random()*Math.PI*2,twinkle:.5+Math.random()*1.3}));
  }else{
    for(const p of particles){p.x=p.x/oldW*w;p.y=p.y/oldH*h;}
  }
}
function draw(now,dt){
  ctx.clearRect(0,0,w,h);const t=now*.001;
  for(const p of particles){
    p.y-=p.vy*dt;p.x+=p.vx*dt;
    if(p.y< -8){p.y=h+8;p.x=Math.random()*w;}
    if(p.x<0)p.x=w;else if(p.x>w)p.x=0;
    const alpha=.15+.52*(.5+.5*Math.sin(t*p.twinkle+p.phase));
    ctx.beginPath();ctx.fillStyle=`rgba(241,208,142,${alpha})`;
    ctx.shadowColor='rgba(239,198,112,.7)';ctx.shadowBlur=p.r*5;
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  ctx.shadowBlur=0;
}
// Manual-scrolling edition: keep only the atmospheric light particles.
function tick(now){
  raf=0;if(!visible)return;
  const dt=last?Math.min(.05,Math.max(0,(now-last)/1000)):0;last=now;
  if(!reduced)draw(now,dt);
  raf=requestAnimationFrame(tick);
}
function start(){if(raf||document.hidden)return;last=0;raf=requestAnimationFrame(tick);}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
const observer=new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(visible)start();else stop();
},{threshold:0,rootMargin:'120px 0px 120px 0px'});
observer.observe(section);
// ResizeObserver catches genuine section layout changes; the resize function
// ignores same-size events and keeps existing particle positions.
if('ResizeObserver'in window){const ro=new ResizeObserver(()=>resize());ro.observe(section);}else window.addEventListener('resize',()=>resize(),{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(visible)start();});
resize(true);
})();
