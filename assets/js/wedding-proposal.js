/* Proposal lighting, reference-inspired golden particle reveal, random pink
   tower sparkle ignition, and an explicit ring-box opening choreography. */
(()=>{'use strict';
const scene=document.querySelector('#proposal');if(!scene)return;
const lamps=[...scene.querySelectorAll('.kc-lantern')],box=scene.querySelector('.ringbox');
const count=scene.querySelector('.kc-proposal-count'),bulbs=[...scene.querySelectorAll('.kc-tower-spark')];
const canvas=scene.querySelector('.kc-proposal-magic'),stage=scene.querySelector('.kc-paris-vista');
if(lamps.length!==4||!box||!canvas||!stage)return;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const ctx=canvas.getContext('2d',{alpha:true});let width=1,height=1,dpr=1,lit=0,done=false;
let particles=[],raf=0,visible=true,active=true,last=0;
const low=matchMedia('(max-width:650px)').matches,limit=low?72:100;
const rand=(a,b)=>a+Math.random()*(b-a);
/* Randomly relocate a few illuminated pinlights inside the tower silhouette.
   This creates genuinely new sparkle positions rather than repeatedly pulsing
   fixed circles. Work is capped and stops when the section is offscreen. */
const glints=[];
let sparkleClock=0,twinkleTimer=0;
function towerSpot(){
 const y=rand(30,344);
 const half=y<120?7+(y-27)*.24:y<238?29+(y-120)*.30:65+(y-238)*.62;
 return{x:150+rand(-.81,.81)*half,y};
}
function moveSpot(el,star){
 const p=towerSpot();
 if(star){el.setAttribute('transform',`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${rand(.55,1.25).toFixed(2)})`)}
 else{el.setAttribute('cx',p.x.toFixed(1));el.setAttribute('cy',p.y.toFixed(1));el.setAttribute('r',rand(.48,.88).toFixed(2))}
}
function shuffleSparkleSpots(){
 if(!visible||!active||reduce||lit===0)return;
 // Dark phase is real opacity:0, then relocation, then a new ignition.
 // Keep only a small number of SVG changes per frame on mobile.
 const count=0;
 for(let i=0;i<count;i++){
  const el=bulbs[Math.floor(Math.random()*bulbs.length)];
  if(!el||!el.classList.contains('is-on'))continue;
  el.classList.remove('is-on');
  moveSpot(el,false);
  setTimeout(()=>{if(visible&&active&&lit>0)el.classList.add('is-on')},rand(140,460));
 }
 // A few true four-point sparkles pop up briefly, not persistent glowing dots.
 if(false && glints.length){const g=glints[Math.floor(Math.random()*glints.length)];
  g.classList.remove('is-glint');moveSpot(g,true);
  if(Math.random()<.78){g.classList.add('is-glint');setTimeout(()=>g.classList.remove('is-glint'),rand(160,350))}
 }
}
const shuffled=bulbs.slice();for(let i=shuffled.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
function size(){const r=stage.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);dpr=1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
function pos(el){const a=el.getBoundingClientRect(),b=stage.getBoundingClientRect();return{x:a.left+a.width/2-b.left,y:a.top+a.height*.32-b.top}}
function emit(x,y,n,type){if(reduce||!ctx)return;for(let i=0;i<n&&particles.length<limit;i++){
 const angle=rand(0,Math.PI*2),speed=type==='ring'?rand(.8,3.2):rand(.55,2.35);
 particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:1,decay:rand(.012,.025),r:rand(.85,2.05),star:false,h:Math.random()<.27?'#FFF4DA':'#F4CD8B',type});}
 start()}
function start(){if(!raf&&!reduce&&visible&&active)raf=requestAnimationFrame(frame)}
function frame(t){raf=0;if(!visible||!active)return;if(t-last<32){start();return}const dt=Math.min((t-last||16)/16,2);last=t;ctx.clearRect(0,0,width,height);
ctx.save();ctx.globalCompositeOperation='lighter';
for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=(q.type==='ring'?.026:.016)*dt;q.vx*=.995;q.life-=q.decay*dt;
if(q.life<=0){particles.splice(i,1);continue}
ctx.globalAlpha=Math.min(1,q.life)*.8;ctx.fillStyle=q.h;ctx.beginPath();if(q.star){const r=q.r*(.7+q.life);ctx.moveTo(q.x-r*2.2,q.y);ctx.lineTo(q.x+r*2.2,q.y);ctx.moveTo(q.x,q.y-r*2.2);ctx.lineTo(q.x,q.y+r*2.2);ctx.lineWidth=Math.max(.5,r*.45);ctx.strokeStyle=q.h;ctx.stroke()}else{ctx.arc(q.x,q.y,q.r*Math.max(.3,q.life),0,Math.PI*2);ctx.fill()}}
ctx.restore();if(particles.length)start()}
function ignite(lamp){const a=lamp.querySelector('.kc-bulb-core')||lamp;
 const pt=pos(a);pt.y+=a.getBoundingClientRect().height*.18;emit(pt.x,pt.y,low?29:38,'lamp');
 if(!reduce)setTimeout(()=>emit(pt.x,pt.y,low?17:24,'lamp'),145)}
function towerStep(n){const upto=Math.round(n/4*shuffled.length);for(let i=0;i<upto;i++){
 const b=shuffled[i];if(b.dataset.queued)continue;b.dataset.queued='1';
 if(reduce)b.classList.add('is-on');else setTimeout(()=>b.classList.add('is-on'),(i%17)*37+Math.random()*130);
 }}
function revealYes(){
 const yes=scene.querySelector('#proposal-story .kc-proposal-yes--story');
 if(!yes||yes.dataset.revealed)return;
 yes.dataset.revealed='1';
 const original=yes.textContent;
 yes.setAttribute('aria-label',original);
 yes.textContent='';
 const letters=[];
 for(const ch of original){const span=document.createElement('span');span.className='kc-yes-letter';span.textContent=ch===' '? '\u00a0':ch;span.setAttribute('aria-hidden','true');yes.appendChild(span);letters.push(span)}
 yes.classList.add('kc-yes-animated');
 const G=window.gsap;
 if(!reduce&&G){G.fromTo(letters,{opacity:0,y:30,scale:.6},{opacity:1,y:0,scale:1,duration:.7,ease:'back.out(2)',stagger:.04,clearProps:'transform,opacity'});}
 else {letters.forEach(x=>x.classList.add('kc-yes-visible'))}
}
function openBox(){scene.classList.add('is-ring');scene.querySelector('#proposal-story')?.classList.add('is-ring');setTimeout(revealYes,reduce?0:600);const lid=box.querySelector('.ringbox__lid-open'),closed=box.querySelector('.ringbox__lid-closed'),ring=box.querySelector('.ringbox__ring'),rays=box.querySelector('.ringbox__rays');
 if(!lid||!closed||!ring)return;
 // Animate before toggling visibility; avoids the earlier instantaneous pop.
 const G=window.gsap;
 if(reduce||!G){box.classList.add('is-open');box.classList.add('kc-ring-css-open');return}
 G.set(lid,{opacity:0,scaleY:.08,transformOrigin:'50% 100%'});G.set(ring,{opacity:0,y:18});
 const tl=G.timeline({onStart:()=>{box.classList.add('is-open');G.set(lid,{opacity:0});G.set(ring,{opacity:0})}});
 tl.to(closed,{opacity:0,duration:.25,ease:'power2.out'},0)
 .to(lid,{opacity:1,scaleY:1,duration:.75,ease:'back.out(2)'},.14)
 .to(ring,{opacity:1,y:0,duration:.85,ease:'back.out(2)'},.45)
 ;
 // No ring-box canvas particles: prevents floating dots at the tower base.
}
function complete(){if(done)return;done=true;if(count)count.textContent='All four lanterns are lit';scene.classList.add('is-tower-lit','kc-leds-active');lamps.forEach(l=>l.disabled=true);
 // Tower uses only blinking pink pinlights; no canvas particle burst.
 setTimeout(openBox,reduce?0:950)}

// Create a new non-overlapping garden arrangement on every page load.
// Plants are only revealed by .is-tower-lit, after all four lanterns are lit.
(function buildGarden(){
 const garden=scene.querySelector('.kc-random-garden');if(!garden)return;
 const front=document.createElement('div');front.className='kc-garden-foreground';garden.parentElement.appendChild(front);
 const positions=[];const choices=[
  {src:'assets/images/proposal-garden-tree-round.png',kind:'tree'},
  {src:'assets/images/proposal-garden-tree-square.png',kind:'tree'},
  {src:'assets/images/proposal-garden-shrub.png',kind:'shrub'}
 ];
 // Exactly two tall trees on the outside and two smaller ornamental tree-bushes
 // on the inside. Each occupies its own protected horizontal zone so they cannot
 // overlap one another or the central ring box. Positions vary on every visit.
 const planting=[
  {kind:'outer',zone:[17,20],height:[51,57],src:choices[0].src},
  {kind:'inner',zone:[24,28],height:[10,14],src:choices[2].src},
  {kind:'inner',zone:[72,76],height:[10,14],src:choices[2].src},
  {kind:'outer',zone:[80,83],height:[51,57],src:choices[0].src}
 ];
 planting.forEach((p,i)=>{
  const plant=document.createElement('img');
  plant.className='kc-plant kc-plant--'+p.kind;
  plant.src=p.src;plant.alt='';plant.decoding='async';plant.loading='eager';
  const x=p.zone[0]+Math.random()*(p.zone[1]-p.zone[0]);
  const height=p.height[0]+Math.random()*(p.height[1]-p.height[0]);
  plant.style.left=x.toFixed(2)+'%';
  plant.style.setProperty('--plant-height',height.toFixed(2)+'%');
  plant.style.setProperty('--plant-delay',(i*.14+Math.random()*.16).toFixed(2)+'s');
  if(p.kind==='outer'){
   // Each tree gets a ground contact shadow at the exact same random x coordinate.
   const ground=document.createElement('span');
   ground.className='kc-tree-ground';ground.setAttribute('aria-hidden','true');
   ground.style.left=x.toFixed(2)+'%';
   ground.style.setProperty('--tree-ground-width',(height*.57).toFixed(2)+'%');
   garden.appendChild(ground);
  }
  (p.kind==='inner'?front:garden).appendChild(plant);
 });
})();

lamps.forEach((lamp,i)=>lamp.addEventListener('click',()=>{
 if(done||lamp.classList.contains('is-lit'))return;
 lamp.classList.add('is-lit');lamp.setAttribute('aria-pressed','true');lamp.setAttribute('aria-label','Lantern '+(i+1)+' lit');
 lit++;scene.style.setProperty('--kc-lit',String(lit/4));scene.dataset.gardenLights=String(lit);if(count)count.textContent=lit+' of 4 lanterns lit';ignite(lamp);if(lit===4)complete();
}));
if(ctx){size();sparkleClock=window.setInterval(shuffleSparkleSpots,340);window.addEventListener('resize',size,{passive:true});
const io=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(raf);raf=0}}, {threshold:0});io.observe(scene);
document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active)start();else{cancelAnimationFrame(raf);raf=0}})}
})();
