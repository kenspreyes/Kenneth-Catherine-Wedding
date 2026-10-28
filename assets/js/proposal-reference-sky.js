/* Atmospheric proposal shader adapted from the user-supplied Very Online Studio reference. */
(()=>{'use strict';const root=document.querySelector('#proposal');if(!root)return;
const canvas=root.querySelector('.kc-ref-shader');if(!canvas)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let gl,program,loc={},raf=0,active=true;
const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const fs=`precision mediump float;uniform vec2 r;uniform float t;uniform vec3 a,b,c;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,s=.5;for(int i=0;i<4;i++){v+=s*n(p);p*=2.03;s*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.5;
float q=fbm(p+vec2(t*.018,-t*.012));float w=fbm(p*1.25+q*1.7+vec2(-t*.011,t*.016));
vec3 col=mix(a,b,smoothstep(.28,.82,w));col=mix(col,c,smoothstep(.42,.95,q)*.75);
float glow=smoothstep(.9,.0,length(uv-vec2(.5,.62)));col+=(c-a)*glow*.08;
gl_FragColor=vec4(col,1.);}`;
function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s;}
try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)throw Error('webgl');program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');gl.useProgram(program);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);for(const k of ['r','t','a','b','c'])loc[k]=gl.getUniformLocation(program,k);gl.uniform3fv(loc.a,[15/255,28/255,21/255]);gl.uniform3fv(loc.b,[26/255,45/255,33/255]);gl.uniform3fv(loc.c,[39/255,57/255,43/255]);}catch(e){canvas.style.display='none';return;}
function resize(){const rect=root.getBoundingClientRect();const w=Math.max(2,Math.min(420,Math.round(rect.width*.22))),h=Math.max(2,Math.min(300,Math.round(rect.height*.22)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.uniform2f(loc.r,w,h);}
const obs=new ResizeObserver(resize);obs.observe(root);resize();const start=performance.now();let last=0;
function frame(now){if(!active)return;raf=requestAnimationFrame(frame);if(document.hidden||now-last<67)return;last=now;gl.uniform1f(loc.t,reduced?0:(now-start)/1000);gl.drawArrays(gl.TRIANGLES,0,3);}
const io=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active){cancelAnimationFrame(raf);frame(performance.now());}else cancelAnimationFrame(raf);},{rootMargin:'150px'});io.observe(root);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(raf);canvas.style.display='none';});
})();
