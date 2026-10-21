(()=>{'use strict';
const section=document.querySelector('.kc-cast-section');if(!section)return;
const scroller=section.querySelector('.kc-cast-credits'),button=section.querySelector('.kc-cast-toggle'),label=section.querySelector('.kc-cast-label'),canvas=section.querySelector('.kc-cast-particles');
if(!scroller||!button||!label||!canvas)return;
const ctx=canvas.getContext('2d');if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let visible=false,playing=false,paused=false,raf=0,last=0,hold=0,pos=0,particles=[],w=0,h=0;
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const particleCount=isIOS?28:55;
let lastParticleFrame=0;
const sprite=document.createElement('canvas');
sprite.width=sprite.height=32;
const spriteCtx=sprite.getContext('2d');
if(spriteCtx){
  const glow=spriteCtx.createRadialGradient(16,16,0,16,16,16);
  glow.addColorStop(0,'rgba(255,224,158,.95)');
  glow.addColorStop(.18,'rgba(248,210,137,.55)');
  glow.addColorStop(1,'rgba(248,210,137,0)');
  spriteCtx.fillStyle=glow;spriteCtx.fillRect(0,0,32,32);
}
function resize(force=false){
  // Stable CSS dimensions: Safari's address-bar animation changes the visual
  // viewport, but should never reset the particle world.
  const width=Math.max(1,Math.round(section.clientWidth));
  const height=Math.max(1,Math.round(section.offsetHeight));
  if(!force&&Math.abs(width-w)<2&&Math.abs(height-h)<2)return;
  const oldW=w||width,oldH=h||height;
  w=width;h=height;
  // Native iPhone Retina canvas at 3x is expensive; paint at 1x and upscale.
  canvas.width=w;canvas.height=h;
  ctx.setTransform(1,0,0,1,0,0);
  if(!particles.length){
    if(!reduced)particles=Array.from({length:particleCount},()=>({
      x:Math.random()*w,y:Math.random()*h,
      r:3+Math.random()*6,vy:4+Math.random()*10,
      vx:(Math.random()-.5)*5,phase:Math.random()*Math.PI*2,
      twinkle:.4+Math.random()*.9
    }));
  }else for(const p of particles){
    p.x=p.x/oldW*w;p.y=p.y/oldH*h;
  }
}
function draw(now,dt){
  ctx.clearRect(0,0,w,h);
  const t=now*.001;
  for(const p of particles){
    p.y-=p.vy*dt;p.x+=p.vx*dt;
    if(p.y< -12){p.y=h+12;p.x=Math.random()*w;}
    if(p.x< -12)p.x=w+12;else if(p.x>w+12)p.x=-12;
    ctx.globalAlpha=.24+.5*(.5+.5*Math.sin(t*p.twinkle+p.phase));
    // Pre-rendered glow: avoids Safari's expensive shadowBlur on every frame.
    ctx.drawImage(sprite,p.x-p.r,p.y-p.r,p.r*2,p.r*2);
  }
  ctx.globalAlpha=1;
}
function sync(){button.setAttribute('aria-pressed',String(!playing));label.textContent=playing?'Pause the credits':'Play the credits';}
function tick(now){
  raf=0;if(!visible)return;
  const dt=last?Math.min(.05,Math.max(0,(now-last)/1000)):0;last=now;
  if(playing&&now>hold){
    if(Math.abs(scroller.scrollTop-pos)>3)pos=scroller.scrollTop;
    pos+=30*dt;scroller.scrollTop=pos;
    if(scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-2){playing=false;paused=true;sync();}
  }
  if(!reduced && (!isIOS || now-lastParticleFrame>=32)){draw(now,Math.min(.05,(now-lastParticleFrame)/1000)||dt);lastParticleFrame=now;}
  raf=requestAnimationFrame(tick);
}
function start(){if(raf||document.hidden)return;last=0;lastParticleFrame=0;raf=requestAnimationFrame(tick);}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
button.addEventListener('click',()=>{if(playing){playing=false;paused=true;}else{if(scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-2)scroller.scrollTop=0;pos=scroller.scrollTop;playing=true;paused=false;hold=0;}sync();start();});
for(const e of ['pointerdown','wheel','touchstart','keydown'])scroller.addEventListener(e,()=>{hold=performance.now()+3500;pos=scroller.scrollTop;},{passive:true});
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(!reduced&&!paused)playing=true;sync();start();}else stop();},{threshold:.08});observer.observe(section);
// ResizeObserver catches genuine section layout changes; the resize function
// ignores same-size events and keeps existing particle positions.
let lastViewportWidth=window.innerWidth;
window.addEventListener('resize',()=>{
  if(Math.abs(window.innerWidth-lastViewportWidth)>2){
    lastViewportWidth=window.innerWidth;resize();
  }
},{passive:true});
if('ResizeObserver'in window){
  const ro=new ResizeObserver(()=>{if(Math.abs(section.clientWidth-w)>2)resize();});
  ro.observe(section);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(visible)start();});
resize(true);sync();
})();
