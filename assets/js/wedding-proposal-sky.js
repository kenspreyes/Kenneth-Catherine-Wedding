/* Kenneth & Catherine — procedural midnight sky, WebGL with static CSS fallback.
   Separate compositing layer; proposal interaction and fireworks are untouched. */
(()=>{'use strict';
const section=document.querySelector('.kc-proposal'),canvas=section?.querySelector('.kc-proposal-night-sky');if(!canvas)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 700px)');
let gl,program,buffer,raf=0,visible=false,disposed=false,clock=0,last=0,paintAt=0,flashes=[];
try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});if(!gl)return;
const vertex=`attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
uniform vec2 resolution;uniform float time;uniform vec3 flashes[5];
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.07+vec2(2.8,1.3);a*=.5;}return s;}
void main(){vec2 uv=gl_FragCoord.xy/resolution;vec2 p=uv;float t=time;
// Vertical gradient: top = near black navy; horizon = indigo with green undertone.
vec3 top=vec3(.0588,.1098,.0824),mid=vec3(.102,.1765,.1294),horizon=vec3(.1529,.2235,.1686);
vec3 color=mix(horizon,mid,smoothstep(.05,.9,uv.y));color=mix(color,top,smoothstep(.46,1.,uv.y)*.86);
float atmosphere=fbm(vec2(uv.x*2.1,uv.y*2.3)+vec2(2.4,8.1));color+=vec3(.009,.014,.010)*(atmosphere-.45);
// Clouds remain at margins and near horizon; center deliberately stays clear.
vec2 q=vec2(uv.x*3.15,uv.y*5.8);
float left=1.-smoothstep(.05,.48,uv.x),right=smoothstep(.52,.95,uv.x);
// Sky details are restricted to the upper 42% of the composition.
// In UV space, y=1 is the top and y=0 is the ground.
float upper=smoothstep(.02,.22,uv.y);
float mask=(.48+.52*max(left,right))*upper*.95;
// Drift is intentionally perceptible over seconds; differing layers avoid sliding texture look.
vec2 drift=vec2(t*.026,t*.0024);
float warp=fbm(q*.72+drift*.45+vec2(2.8,7.2));
float cloud=fbm(vec2(q.x*1.05,q.y*.68)+drift+vec2(warp*.9,warp*.5));
float fine=fbm(vec2(q.x*2.6,q.y*1.8)+drift*1.35+vec2(5.3,2.1));
float wisps=smoothstep(.36,.64,cloud)*mask*(.68+.32*fine);
color+=vec3(.145,.169,.147)*wisps*.84;
color+=vec3(.045,.060,.047)*max(0.,fine-.4)*mask*.30;
// Sparse stars, larger than a pixel even on low-resolution mobile WebGL surfaces.
vec2 cells=uv*vec2(110.,72.);vec2 cell=floor(cells);
vec2 point=(fract(cells)-vec2(.15+.7*hash(cell+2.7),.15+.7*hash(cell+9.4)))*vec2(1.,resolution.y/resolution.x);
float eligible=step(.910,hash(cell+5.7))*smoothstep(.025,.18,uv.y);
float dist=length(point);float star=eligible*(1.-smoothstep(.025,.125,dist));
float twinkle=.76+.24*sin(t*1.4+hash(cell+1.2)*6.283);
star*=twinkle*(1.-wisps*.75);
color+=vec3(1.0,.96,.82)*star*1.25;
// Subtle localized champagne illumination triggered only by real rocket explosions.
for(int i=0;i<5;i++){vec3 f=flashes[i];vec2 delta=(uv-f.xy)*vec2(resolution.x/resolution.y,1.);float halo=exp(-dot(delta,delta)*35.);color+=vec3(.19,.126,.052)*halo*f.z*(.13+wisps*.72);}
// Keep central typography in a darker, protected pocket.
float center=exp(-dot((uv-vec2(.5,.47))*vec2(2.0,1.6),(uv-vec2(.5,.47))*vec2(2.0,1.6))*3.5);
color*=1.-center*.15;
color=clamp(color,0.,1.);gl_FragColor=vec4(color,1.);
}`;
function shader(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh}
const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(program);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
const flashData=new Float32Array(15);const uniforms={resolution:gl.getUniformLocation(program,'resolution'),time:gl.getUniformLocation(program,'time'),flashes:gl.getUniformLocation(program,'flashes[0]')};
function resize(){const r=canvas.getBoundingClientRect(),scale=mobile.matches?.55:.68,dpr=1;canvas.width=Math.max(2,Math.round(r.width*scale*dpr));canvas.height=Math.max(2,Math.round(r.height*scale*dpr));gl.viewport(0,0,canvas.width,canvas.height)}
function render(now){raf=0;if(!visible||disposed)return;clock+=Math.min(50,now-(last||now))/1000;last=now;if(now-paintAt<50&&!reduced.matches){raf=requestAnimationFrame(render);return;}paintAt=now;
const data=flashData;for(let i=flashes.length-1;i>=0;i--){const f=flashes[i];f.life-=.0167;if(f.life<=0)flashes.splice(i,1)}
flashes.slice(-5).forEach((f,i)=>{data[i*3]=f.x;data[i*3+1]=1-f.y;data[i*3+2]=Math.max(0,f.life/f.ttl)});
gl.useProgram(program);gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);gl.uniform1f(uniforms.time,clock);gl.uniform3fv(uniforms.flashes,data);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
if(!reduced.matches)raf=requestAnimationFrame(render)}
function start(){if(disposed||visible)return;visible=true;resize();last=0;paintAt=0;raf=requestAnimationFrame(render)}
function stop(){visible=false;cancelAnimationFrame(raf);raf=0}
const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting)start();else stop()},{threshold:.06});observer.observe(section);
const resizer=new ResizeObserver(()=>{if(visible){resize();if(reduced.matches)requestAnimationFrame(render)}});resizer.observe(canvas);
section.addEventListener('kc:firework-explosion',e=>{if(!visible)return;const d=e.detail||{};flashes.push({x:d.x,y:d.y,life:.65,ttl:.65});if(flashes.length>5)flashes.shift();if(reduced.matches)requestAnimationFrame(render)});
reduced.addEventListener?.('change',()=>{if(visible){cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(render)}});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();canvas.style.display='none'},{once:true});
addEventListener('pagehide',()=>{disposed=true;stop();observer.disconnect();resizer.disconnect();gl.deleteBuffer(buffer);gl.deleteProgram(program)},{once:true});
}catch(e){canvas.style.display='none';}
})();
