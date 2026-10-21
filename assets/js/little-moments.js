/* Little Moments: adapted from the supplied Very Online Studio reference mechanics.
   Isolated to #moments; normal page scrolling and existing wedding animations are unchanged. */
(() => {
  'use strict';
  const section = document.querySelector('#moments');
  if (!section) return;
  const stack = section.querySelector('.stack');
  const items = [...section.querySelectorAll('.polaroid')];
  const count = section.querySelector('.stack__n');
  const spreadBtn = section.querySelector('[data-action="stack-spread"]');
  const spreadLabel = section.querySelector('.stack__spread-label');
  const dlg = document.querySelector('#kc-moments-lightbox');
  const image = dlg.querySelector('.kc-moments-lightbox__img');
  const caption = dlg.querySelector('.kc-moments-lightbox__caption');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const Flip = window.Flip;
  if (gsap && Flip) gsap.registerPlugin(Flip);
  let order = items.map((_,i)=>i), spread = false, anim = false, active = 0, opener = null;
  let suppressClickUntil = 0;
  const set = (el, props) => {
    if (gsap) { gsap.set(el,props); return; }
    if (props.clearProps) { el.style.transform=''; el.style.opacity=''; return; }
    const x=props.x||0,y=props.y||0,r=props.rotation||0,s=props.scale??1;
    el.style.transform=`translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
    if(props.opacity!==undefined)el.style.opacity=props.opacity;
  };
  const tween=(el,props)=>{
    if(gsap&&!reduced)gsap.to(el,props);
    else {set(el,props);props.onComplete?.();}
  };
  function layout(instant=false){
    order.forEach((idx,k)=>{
      const el=items[idx],depth=Math.min(k,4);
      el.style.zIndex=String(items.length-k);
      el.querySelector('button').tabIndex=(k===0||spread)?0:-1;
      if(spread)return;
      const vars={x:depth*3,y:depth*5,scale:1-depth*.025,rotation:parseFloat(el.style.getPropertyValue('--r'))||0,opacity:k>5?0:1};
      if(instant||reduced||!gsap)set(el,vars);
      else tween(el,{...vars,duration:.6,ease:'power3.out'});
    });
    count.textContent=String(order[0]+1);
  }
  function throwTop(dir=-1,vx=0){
    if(anim||spread)return;
    anim=true;
    const el=items[order[0]];
    tween(el,{x:dir*(innerWidth*.7+200),y:-40,rotation:dir*28+vx*4,duration:.45,ease:'power2.in',onComplete(){
      order.push(order.shift());
      set(el,{x:dir*60,y:30,rotation:0,scale:.9,opacity:0});
      layout(false);anim=false;
    }});
  }
  function bringBack(){
    if(anim||spread)return;
    anim=true;
    order.unshift(order.pop());
    const el=items[order[0]];
    set(el,{x:-innerWidth*.7-200,y:-40,rotation:-24,opacity:1});
    layout(false);
    if(gsap&&!reduced)gsap.delayedCall(.65,()=>anim=false);
    else anim=false;
  }
  function setSpread(on){
    if(anim)return;
    const state=(Flip&&!reduced&&gsap)?Flip.getState(items):null;
    spread=on;stack.classList.toggle('is-spread',on);
    if(on)items.forEach(el=>set(el,{clearProps:'transform,opacity'}));
    else layout(true);
    if(state)Flip.from(state,{duration:.9,ease:'power3.inOut',stagger:.025,absolute:false,scale:false});
    spreadBtn.setAttribute('aria-pressed',String(on));
    spreadLabel.textContent=on?'Stack them up':'Spread them out';
    layout(true);
  }
  function show(i){
    active=(i+items.length)%items.length;
    const li=items[active],im=li.querySelector('img');
    image.src=im.currentSrc||im.src;
    image.alt=im.alt;
    caption.textContent=li.querySelector('.polaroid__cap').textContent;
    if(gsap&&!reduced)gsap.fromTo(image,{opacity:0,scale:.97},{opacity:1,scale:1,duration:.45,ease:'power2.out'});
  }
  function open(i,from){opener=from;show(i);if(!dlg.open)dlg.showModal();}
  dlg.querySelector('.kc-moments-lightbox__prev').addEventListener('click',()=>show(active-1));
  dlg.querySelector('.kc-moments-lightbox__next').addEventListener('click',()=>show(active+1));
  dlg.querySelector('.kc-moments-lightbox__close').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
  dlg.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();show(active+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();show(active-1);}
  });
  let lightboxStart=null;
  dlg.addEventListener('pointerdown',e=>{lightboxStart={x:e.clientX,y:e.clientY};});
  dlg.addEventListener('pointerup',e=>{if(!lightboxStart)return;const dx=e.clientX-lightboxStart.x,dy=e.clientY-lightboxStart.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))show(active+(dx<0?1:-1));lightboxStart=null;});
  dlg.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  items.forEach((el,i)=>{
    const btn=el.querySelector('.polaroid__btn');
    btn.addEventListener('click',e=>{
      if(performance.now()<suppressClickUntil)return;
      if(spread||order[0]===i)open(i,btn);
    });
    let pointer=null, moved=false, base=null;
    el.addEventListener('pointerdown',e=>{
      if(e.button>0||pointer||spread||anim||order[0]!==i)return;
      pointer={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};moved=false;
      base=gsap?{x:Number(gsap.getProperty(el,'x'))||0,y:Number(gsap.getProperty(el,'y'))||0,r:Number(gsap.getProperty(el,'rotation'))||0}:{x:0,y:0,r:parseFloat(el.style.getPropertyValue('--r'))||0};
      try{el.setPointerCapture(e.pointerId);}catch(_e){}
    });
    el.addEventListener('pointermove',e=>{
      if(!pointer||e.pointerId!==pointer.id)return;
      const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
      if(Math.hypot(dx,dy)>5)moved=true;
      // Keep vertical page swipes native; only capture horizontal photo flicks.
      if(Math.abs(dx)<Math.abs(dy)*1.2&&!el.dataset.dragHorizontal)return;
      if(Math.abs(dx)>8)el.dataset.dragHorizontal='1';
      if(el.dataset.dragHorizontal){el.style.touchAction='none';set(el,{x:base.x+dx,y:base.y+dy*.4,rotation:base.r+dx*.06});}
    });
    function finish(e){
      if(!pointer||e.pointerId!==pointer.id)return;
      const dx=e.clientX-pointer.x,dt=performance.now()-pointer.t;
      const horizontal=!!el.dataset.dragHorizontal;
      pointer=null;delete el.dataset.dragHorizontal;el.style.touchAction='pan-y';
      if(horizontal&&moved){
        suppressClickUntil=performance.now()+400;
        const v=Math.abs(dx)/Math.max(dt,1);
        if(Math.abs(dx)>80||v>.6)throwTop(dx<0?-1:1,v);
        else tween(el,{x:base.x,y:base.y,rotation:base.r,duration:.6,ease:'elastic.out(1,.6)'});
      }
    }
    el.addEventListener('pointerup',finish);
    el.addEventListener('pointercancel',finish);
  });
  section.querySelector('[data-action="stack-next"]').addEventListener('click',()=>throwTop(-1));
  section.querySelector('[data-action="stack-prev"]').addEventListener('click',bringBack);
  spreadBtn.addEventListener('click',()=>setSpread(!spread));
  layout(true);
  if(!reduced&&gsap&&'IntersectionObserver'in window){
    let entered=false;
    const io=new IntersectionObserver(entries=>{
      if(entered||!entries[0].isIntersecting)return;
      entered=true;io.disconnect();
      const vis=order.slice(0,6).map(i=>items[i]).reverse();
      gsap.from(vis,{y:()=>innerHeight*.5,rotation:i=>i%2?25:-25,opacity:0,duration:.9,ease:'power3.out',stagger:.08,clearProps:'transform,opacity',onComplete:()=>layout(true)});
    },{threshold:.2});
    io.observe(section);
  }
})();
