/* Kenneth & Catherine — cinematic fireworks finale, v3.0.
   Canvas 2D accelerated compositing, pooled particles, fixed-step physics.
   All aerial bursts are emitted ONLY by rockets upon arrival. */
(()=>{'use strict';
const section=document.querySelector('.kc-finale');if(!section)return;
const canvas=section.querySelector('.kc-finale-canvas');const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 700px)');
const palette={gold:['#FFE8A7','#EFC77A','#D7A34D'],ivory:['#FFFFFF','#FFF6DC','#F5DDB0'],rose:['#FFE9D9','#E7BDAE','#D89B8D'],sage:['#E5F2DC','#BED4BB','#91B69A']};
const kinds=['chrysanthemum','peony','willow','brocade','palm','strobe'];
const rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[(Math.random()*a.length)|0],clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let W=0,H=0,DPR=1,active=false,raf=0,prev=0,acc=0,elapsed=0,showTime=0,nextLaunch=0,sequence=0,quality=1;
let rockets=[],sparks=[],free=[],haze=[],pending=[],frameAvg=16.7,frameSamples=0,lastInteraction=-1e6;
const maxRockets=()=>mobile.matches?7:12,maxPending=()=>mobile.matches?12:22;
const pool=()=>free.pop()||{};
const wishLayer=section.querySelector('.kc-finale-wish-layer'),wishForm=section.querySelector('#kc-finale-wish-form'),wishInput=section.querySelector('#kc-finale-wish');
let wishInFlight=false;
function finishWish(){wishInFlight=false;if(wishForm){const b=wishForm.querySelector('button');if(b)b.disabled=false}}
function showWish(message,x,y){if(!wishLayer)return;wishLayer.replaceChildren();const box=document.createElement('div');box.className='kc-finale-wish-burst';box.style.left=(x/W*100)+'%';box.style.top=(Math.min(y/H*100,22))+'%';const text=document.createElement('span');text.textContent=message;box.append(text);wishLayer.append(box);const clear=()=>{if(box.parentNode)box.remove()};if(reduced.matches)setTimeout(clear,5000);else box.addEventListener('animationend',clear,{once:true});wishInFlight=false;if(wishForm){const b=wishForm.querySelector('button');if(b)b.disabled=false}}

function resize(){const b=section.getBoundingClientRect();W=Math.max(1,b.width);H=Math.max(1,b.height);DPR=Math.min(devicePixelRatio||1,mobile.matches?1.1:1.5);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H)}
function makeSpark(x,y,vx,vy,life,radius,color,opt={}){if(sparks.length>= Math.floor((mobile.matches?850:2100)*quality))return;
const p=pool();Object.assign(p,{x,y,px:x,py:y,vx,vy,life,ttl:life,radius,color,drag:opt.drag??.991,gravity:opt.gravity??.038,twinkle:opt.twinkle??.18,trail:opt.trail??.32,seed:Math.random()*1000,kind:opt.kind||'ember',phase:Math.random()*6.28});sparks.push(p)}
function ignition(x,y){for(let i=0;i<20*quality;i++){const a=rand(0,Math.PI*2),s=rand(.35,2.4);makeSpark(x,y,Math.cos(a)*s,Math.sin(a)*s,rand(10,26),rand(.35,.9),'#FFF4C8',{gravity:.06,drag:.94,trail:.1})}}
function launch(spec={}){if(reduced.matches||!active||rockets.length>=maxRockets())return false;
const startX=clamp(spec.startX??rand(.12,.88)*W,18,W-18),targetX=clamp(spec.targetX??rand(.1,.9)*W,20,W-20);
const targetY=clamp(spec.targetY??rand(.14,.5)*H,Math.min(55,H*.1),H*.66);
const y=H+8,flight=rand(70,112)*(mobile.matches?.8:1)*(spec.wishRocket?1.52:1),dx=targetX-startX;
const rocket={x:startX,y,px:startX,py:y,sx:startX,sy:y,tx:targetX,ty:targetY,t:0,duration:flight,kind:spec.kind||pick(kinds),tone:spec.tone||pick(['gold','gold','gold','ivory','rose','sage']),size:spec.size||rand(.75,1.2),curve:rand(-20,20)*(mobile.matches?.5:1),tail:[],flash:9,message:spec.message||null,wishRocket:!!spec.wishRocket};
rockets.push(rocket);ignition(startX,H-3);return true;
}
function explosion(r){if(r.wishRocket){if(r.message)showWish(r.message,r.x,r.y);else finishWish();const keep=Math.floor((mobile.matches?850:2100)*quality*.38);if(sparks.length>keep){const removed=sparks.splice(0,sparks.length-keep);for(const p of removed)if(free.length<2300)free.push(p)}}const type=r.kind,base=palette[r.tone],power=r.size*(mobile.matches?.77:1);
let count={chrysanthemum:350,peony:240,willow:270,brocade:410,palm:190,strobe:260}[type];count=Math.round(count*power*quality*(r.wishRocket?2.2:1));
// Transient ignition flash is drawn from the exact endpoint; never independently spawned.
haze.push({x:r.x,y:r.y,r:r.wishRocket?11:5,life:r.wishRocket?23:12,ttl:r.wishRocket?23:12,color:base[0]});
 section.dispatchEvent(new CustomEvent("kc:firework-explosion",{detail:{x:r.x/W,y:r.y/H}}));
const arms=type==='palm'?rand(9,15)|0:0;
for(let i=0;i<count;i++){
 let a=rand(0,Math.PI*2),s=rand(1.1,4.1)*power;
 if(type==='palm'){a=(Math.floor(i/(count/arms))/arms)*Math.PI*2+rand(-.16,.16);s=rand(2,4.7)*power}
 else if(type==='willow'){s=rand(.9,3.1)*power}
 else if(type==='brocade'){s=rand(1.2,3.5)*power}
 else if(type==='peony'){s=rand(2,4.6)*power}
 else if(type==='strobe'){s=rand(1.5,3.8)*power}
 const life=type==='willow'?rand(130,220):type==='brocade'?rand(105,170):type==='palm'?rand(100,165):rand(65,120);
 const gravity=type==='willow'?.023:type==='palm'?.043:.033;
 const drag=type==='willow'?.996:type==='brocade'?.994:rand(.986,.995);
 const color=pick(base);
 makeSpark(r.x,r.y,Math.cos(a)*s*rand(.87,1.13),Math.sin(a)*s*rand(.85,1.15),life,rand(.45,1.05),color,{drag,gravity,twinkle:type==='strobe'?.9:type==='brocade'?.55:.15,trail:type==='willow'?.9:type==='brocade'?.75:type==='palm'?.7:.35,kind:type});
 }
}
function tick(dt){elapsed+=dt;showTime+=dt;
 for(let i=rockets.length-1;i>=0;i--){const r=rockets[i];r.px=r.x;r.py=r.y;r.t+=dt;const u=clamp(r.t/r.duration,0,1);
 // Rocket decelerates approaching its apex; path and explosion share endpoint.
 const eased=1-Math.pow(1-u,1.65);r.x=r.sx+(r.tx-r.sx)*eased+Math.sin(u*Math.PI)*r.curve;r.y=r.sy+(r.ty-r.sy)*eased;
 if(r.t%2<dt*1.2){for(let j=0;j<2;j++)makeSpark(r.x+rand(-1,1),r.y+rand(2,7),rand(-.55,.55),rand(.45,1.5),rand(10,30),rand(.35,.8),pick(palette.gold),{gravity:.025,drag:.96,trail:.28})}
 if(u>=1){r.x=r.tx;r.y=r.ty;explosion(r);rockets.splice(i,1)}}
 for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.px=p.x;p.py=p.y;p.vx*=Math.pow(p.drag,dt);p.vy=p.vy*Math.pow(p.drag,dt)+p.gravity*dt;p.vx+=Math.sin(elapsed*.035+p.seed)*.0018*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0||p.y>H+60){sparks.splice(i,1);if(free.length<2300)free.push(p)}}
 for(let i=haze.length-1;i>=0;i--){const h=haze[i];h.life-=dt;h.r+=dt*4;if(h.life<=0)haze.splice(i,1)}
 for(let i=pending.length-1;i>=0;i--){if(pending[i].at<=showTime){if(!pending[i].spec.wishRocket||rockets.length<maxRockets()){launch(pending[i].spec);pending.splice(i,1)}}}
 // 38-second show: opening -> build -> main -> staggered golden finale -> natural ember decay.
 if(showTime>=nextLaunch){const t=showTime%2350;
 if(t<210){if(sequence===0){launch({kind:'chrysanthemum',tone:'gold',size:1.25,targetX:W*.5,targetY:H*.24});sequence=1}nextLaunch=showTime+240}
 else if(t<640){launch({kind:pick(['peony','chrysanthemum','strobe']),tone:pick(['gold','ivory','rose']),size:rand(.7,1.05)});nextLaunch=showTime+rand(95,145)}
 else if(t<1600){const type=pick(kinds);launch({kind:type,tone:pick(['gold','gold','ivory','rose','sage']),size:rand(.7,1.2)});if(Math.random()<.43&&pending.length<maxPending())pending.push({at:showTime+rand(14,35),spec:{kind:pick(kinds),tone:'gold',targetX:rand(.12,.88)*W,targetY:rand(.16,.48)*H}});nextLaunch=showTime+rand(80,150)}
 else if(t<1860){launch({kind:pick(['willow','brocade']),tone:'gold',size:1.35});nextLaunch=showTime+180}
 else if(t<2020){nextLaunch=showTime+80} // short visual pause
 else if(t<2240){for(let i=0;i<3&&pending.length<maxPending();i++)pending.push({at:showTime+i*12,spec:{kind:pick(['brocade','chrysanthemum','willow']),tone:i%3?'gold':'ivory',size:rand(1.05,1.45),targetX:W*(.22+i*.28),targetY:H*rand(.16,.38)}});nextLaunch=showTime+70}
 else {nextLaunch=showTime+130} // wait for sparks to fall before next cycle
 if(t>2240&&t<2300)sequence=0;
 }
 }
function render(){ctx.clearRect(0,0,W,H);ctx.save();ctx.globalCompositeOperation='lighter';
 for(const h of haze){const a=h.life/h.ttl,g=ctx.createRadialGradient(h.x,h.y,0,h.x,h.y,h.r*4);g.addColorStop(0,`rgba(255,249,216,${.42*a})`);g.addColorStop(.2,`rgba(255,220,145,${.16*a})`);g.addColorStop(1,'rgba(255,200,100,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(h.x,h.y,h.r*4,0,Math.PI*2);ctx.fill()}
 ctx.lineCap='round';
 for(const r of rockets){if(r.wishRocket){const dx=r.x-r.px,dy=r.y-r.py;ctx.save();ctx.globalAlpha=.87;ctx.strokeStyle='#FFCF72';ctx.shadowColor='#FFCB67';ctx.shadowBlur=18;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(r.x-dx*12,r.y-dy*12);ctx.lineTo(r.x,r.y);ctx.stroke();ctx.globalAlpha=1;ctx.strokeStyle='#FFF8D9';ctx.lineWidth=1.65;ctx.beginPath();ctx.moveTo(r.x-dx*17,r.y-dy*17);ctx.lineTo(r.x,r.y);ctx.stroke();ctx.fillStyle='#FFFFFF';ctx.shadowBlur=22;ctx.beginPath();ctx.arc(r.x,r.y,3.2,0,Math.PI*2);ctx.fill();ctx.restore()}else{ctx.globalAlpha=.75;ctx.strokeStyle='#FFE5AA';ctx.lineWidth=1.35;ctx.beginPath();ctx.moveTo(r.px,r.py);ctx.lineTo(r.x,r.y);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#FFF9E8';ctx.shadowColor='#FFDB84';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(r.x,r.y,1.9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}}
 for(const p of sparks){const a=clamp(p.life/p.ttl,0,1),flicker=(Math.sin(elapsed*.5+p.seed)*.5+.5);const brightness=(p.kind==='strobe'?(flicker>.7?1:.08):.74+.26*flicker)*Math.min(1,(1-a)*9)*Math.pow(a,.65);ctx.globalAlpha=brightness;
 if(p.trail>.2){ctx.strokeStyle=p.color;ctx.lineWidth=p.radius*(p.kind==='palm'?1.5:.65);ctx.beginPath();ctx.moveTo(p.px-(p.x-p.px)*p.trail*2,p.py-(p.y-p.py)*p.trail*2);ctx.lineTo(p.x,p.y);ctx.stroke()}
 ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.radius*(.4+.6*a),0,Math.PI*2);ctx.fill()}
 ctx.restore()}
function animate(now){raf=0;if(!active)return;const delta=Math.min(50,now-(prev||now));prev=now;acc+=delta;frameAvg=frameAvg*.97+delta*.03;if(++frameSamples%180===0){if(frameAvg>26)quality=Math.max(.4,quality*.84);else if(frameAvg<18)quality=Math.min(mobile.matches?.65:1,quality*1.05)}let steps=0;while(acc>=16.667&&steps<3){tick(1);acc-=16.667;steps++}render();raf=requestAnimationFrame(animate)}
function begin(){if(active)return;active=true;resize();prev=0;acc=0;showTime=0;nextLaunch=0;sequence=0;quality=mobile.matches?.5:.85;if(!reduced.matches)raf=requestAnimationFrame(animate)}
function stop(){wishInFlight=false;if(wishForm){const b=wishForm.querySelector('button');if(b)b.disabled=false}active=false;cancelAnimationFrame(raf);raf=0;rockets=[];for(const p of sparks)if(free.length<2300)free.push(p);sparks=[];haze=[];pending=[];ctx.clearRect(0,0,W,H)}
const io=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!reduced.matches)begin();else stop()},{threshold:.08});io.observe(section);
wishForm?.addEventListener('submit',e=>{e.preventDefault();const message=wishInput.value.trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,90);if(wishInFlight)return;if(reduced.matches){if(message)showWish(message,W*.5,H*.19);else finishWish();wishInput.value='';return}if(!active)return;wishInFlight=true;const button=wishForm.querySelector('button');if(button)button.disabled=true;const spec={message,wishRocket:true,kind:'brocade',tone:'gold',size:mobile.matches?2.0:2.4,startX:W*.5,targetX:W*.5,targetY:H*.19};if(rockets.length<maxRockets())launch(spec);else pending.unshift({at:showTime+1,spec});wishInput.value=''});
section.addEventListener('pointerdown',e=>{if(e.target.closest('button, input, form, label')||!active||reduced.matches||showTime-lastInteraction<(mobile.matches?16:10))return;lastInteraction=showTime;const rect=section.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;launch({targetX:clamp(x,20,W-20),targetY:clamp(y,40,H*.6),kind:pick(kinds),tone:pick(['gold','gold','ivory','rose'])})});
const ro=new ResizeObserver(()=>{if(active)resize()});ro.observe(section);
reduced.addEventListener?.('change',()=>{if(reduced.matches)stop();else if(section.getBoundingClientRect().top<innerHeight&&section.getBoundingClientRect().bottom>0)begin()});
addEventListener('pagehide',()=>{stop();io.disconnect();ro.disconnect()},{once:true});
})();
