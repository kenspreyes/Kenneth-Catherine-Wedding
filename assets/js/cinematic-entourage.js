(()=>{
'use strict';
const section=document.querySelector('.kc-cast-section');
if(!section)return;
const sky=section.querySelector('.kc-cast-sky'),canvas=section.querySelector('.kc-cast-particles');
if(!sky||!canvas)return;
const ctx=canvas.getContext('2d');
if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let w=0,h=0,visible=false,raf=0,last=0,skyLast=0,flies=[];
let gl=null,uniforms=null;
const vertex='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const fragment=`precision mediump float;uniform vec2 r;uniform float t;uniform vec3 a,b,c;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,s=.5;for(int i=0;i<4;i++){v+=s*n(p);p*=2.03;s*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.5;
float q=fbm(p+vec2(t*.018,-t*.012));float w=fbm(p*1.25+q*1.7+vec2(-t*.011,t*.016));
float clouds=fbm(p*1.9+vec2(-t*.015,t*.012)+w*.65);
float mist=smoothstep(.32,.69,clouds*.72+w*.45);
vec3 col=mix(a,b,smoothstep(.24,.68,w));
col=mix(col,c,mist*.90);
float highlights=smoothstep(.54,.80,clouds);
col+=vec3(.085,.105,.082)*highlights*.95;
float glow=smoothstep(.9,.0,length(uv-vec2(.5,.62)));col+=(c-a)*glow*.08;
gl_FragColor=vec4(col,1.);}`;
function initSky(){
 try{
  gl=sky.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl)throw Error('WebGL unavailable');
  const shader=(type,source)=>{const x=gl.createShader(type);gl.shaderSource(x,source);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw Error('shader');return x;};
  const program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const location=gl.getAttribLocation(program,'p');
  gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
  uniforms={r:gl.getUniformLocation(program,'r'),t:gl.getUniformLocation(program,'t'),a:gl.getUniformLocation(program,'a'),b:gl.getUniformLocation(program,'b'),c:gl.getUniformLocation(program,'c')};
  sky.addEventListener('webglcontextlost',e=>{e.preventDefault();gl=null;sky.style.display='none';});
 }catch(e){gl=null;sky.style.display='none';}
}
function drawSky(now){
 if(!gl)return;
 gl.uniform2f(uniforms.r,sky.width,sky.height);
 gl.uniform1f(uniforms.t,reduced?12:now*.001);
 gl.uniform3fv(uniforms.a,new Float32Array([.038,.075,.055]));
 gl.uniform3fv(uniforms.b,new Float32Array([.145,.245,.184]));
 gl.uniform3fv(uniforms.c,new Float32Array([.255,.354,.275]));
 gl.drawArrays(gl.TRIANGLES,0,3);
}
function resize(force=false){
 const nw=Math.max(1,Math.round(section.clientWidth)),nh=Math.max(1,Math.round(section.offsetHeight));
 if(!force&&Math.abs(nw-w)<2&&Math.abs(nh-h)<2)return;
 const ow=w||nw,oh=h||nh;w=nw;h=nh;
 // Low-resolution shader, matching the original's 0.3 render scale.
 sky.width=Math.max(2,Math.round(w*.3));sky.height=Math.max(2,Math.round(h*.3));
 if(gl)gl.viewport(0,0,sky.width,sky.height);
 const dpr=Math.min(window.devicePixelRatio||1,1.5);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 if(!flies.length&&!reduced){
  const n=w<700?14:26;
  flies=Array.from({length:n},()=>({x:rand(0,w),y:rand(h*.1,h*.95),vx:rand(-10,10),vy:rand(-8,8),r:rand(1.4,2.6),ph:rand(0,6.28)}));
 }else for(const p of flies){p.x=p.x/ow*w;p.y=p.y/oh*h;}
 drawSky(performance.now());
}
function drawFlies(now,dt){
 ctx.clearRect(0,0,w,h);
 const t=now*.001;
 for(const p of flies){
  p.vx=clamp(p.vx+rand(-30,30)*dt,-16,16);
  p.vy=clamp(p.vy+rand(-30,30)*dt,-12,12);
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.x< -40||p.x>w+40||p.y< -30||p.y>h+30){p.x=rand(0,w);p.y=rand(h*.1,h*.95);}
  ctx.globalAlpha=.35+.65*Math.abs(Math.sin(t*1.3+p.ph));
  ctx.fillStyle='#FFD98A';ctx.shadowColor='#FFC861';ctx.shadowBlur=12;
  ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;ctx.shadowBlur=0;
}
function frame(now){
 raf=0;if(!visible||document.hidden)return;
 const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
 if(!reduced)drawFlies(now,dt);
 if(now-skyLast>32){drawSky(now);skyLast=now;}
 if(!reduced)raf=requestAnimationFrame(frame);
}
function start(){if(raf||document.hidden)return;last=0;raf=requestAnimationFrame(frame);}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
initSky();resize(true);
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:0,rootMargin:'100px 0px 100px 0px'});
observer.observe(section);
if('ResizeObserver'in window){
 const ro=new ResizeObserver(()=>{if(Math.abs(section.clientWidth-w)>2||Math.abs(section.offsetHeight-h)>2)resize();});ro.observe(section);
}else window.addEventListener('resize',()=>resize(),{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(visible)start();});
})();
