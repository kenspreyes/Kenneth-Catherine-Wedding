/**
 * Kenneth & Catherine — V8.99, cinematic corner-to-calendar butterfly flight.
 * A separate, lazy-loaded Three.js scene; the wedding rings are not touched.
 * The butterfly enters from the UPPER-RIGHT CORNER OF THE VIEWPORT, follows
 * an arcing flight with gentle banks, then lands beneath March 3.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(() => {
  'use strict';
  const overlay = document.getElementById('butterfly-3d-container');
  const day = document.getElementById('calendar-wedding-day');
  const calendar = overlay?.closest('.wedding-calendar');
  if (!overlay || !day || !calendar) return;

  // A calendar-sized canvas clips the butterfly at the calendar boundary.
  // Move ONLY the butterfly overlay to <body>, leaving the calendar and all
  // other website elements unchanged. This lets it cross the full page view.
  document.body.appendChild(overlay);
  overlay.classList.add('butterfly-flight-viewport');
  overlay.style.visibility = 'hidden';

  const MODEL_URL = 'assets/models/butterfly.glb';
  const FLIGHT_MS = 5200;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => { t = clamp(t, 0, 1); return t*t*(3-2*t); };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const variation = Array.from({length: 8}, () => Math.random()*2-1);

  let scene, camera, renderer, butterfly, mixer;
  let actions = [], loaded = false, initializing = false;
  let inView = false, started = false, progress = 0;
  let lastTime = 0, frameId = 0, viewportW = 0, viewportH = 0;
  let modelPixels = 54;
  let dust = [];
  let forceReplay = false;
  const clock = new THREE.Clock();

  // Cubic Bezier points are in VIEWPORT coordinates, not calendar coordinates.
  function bezier(a,b,c,d,t) {
    const u=1-t;
    return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d;
  }
  function xy(a,b,c,d,t) {
    return {x:bezier(a.x,b.x,c.x,d.x,t), y:bezier(a.y,b.y,c.y,d.y,t)};
  }
  function landingPoint() {
    const rect = day.getBoundingClientRect();
    return {
      x: rect.left + rect.width*.53 + 3,
      y: rect.bottom + Math.max(15,modelPixels*.40)
    };
  }
  function flightPoint(rawT) {
    const t = clamp(rawT,0,1);
    const end = landingPoint();
    const w = viewportW, h = viewportH;
    const start = {x:w + modelPixels*.6, y:-modelPixels*.6};
    const entry = {x:w*.85, y:Math.min(h*.18, end.y*.46)};
    const approach = {
      x:end.x + clamp(w*.15,45,115),
      y:end.y - clamp(h*.19,65,125)
    };
    const hover = {
      x:end.x + clamp(w*.055,16,45),
      y:end.y - Math.max(30,modelPixels*.80)
    };
    // Ease only at the beginning and end. Keep speed through the middle
    // so the butterfly does not stop unnaturally at each curve join.
    const phase=smooth(t);
    if (phase < .38) {
      const u=phase/.38;
      return xy(start,
        {x:w*.98,y:h*.08},
        {x:entry.x+w*.08,y:entry.y-h*.10},
        entry,u);
    }
    if (phase < .78) {
      const u=(phase-.38)/.40;
      return xy(entry,
        {x:entry.x-w*.085,y:entry.y+h*.11},
        {x:approach.x+w*.045,y:approach.y-h*.09},
        approach,u);
    }
    // Final curve: gentle hover, then a slow touchdown below March 3.
    const u=(phase-.78)/.22;
    return xy(approach,
      {x:approach.x-w*.025,y:approach.y+h*.055},
      {x:hover.x,y:hover.y},
      end,u);
  }

  function resize() {
    if (!renderer) return;
    const w=Math.max(1,window.innerWidth),h=Math.max(1,window.innerHeight);
    if (w===viewportW && h===viewportH) return;
    viewportW=w; viewportH=h;
    camera.left=0;camera.right=w;camera.top=0;camera.bottom=h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(w,h,false);
    modelPixels=clamp(Math.min(w*.14,h*.13),38,76);
    paint();
  }

  function makeDust() {
    dust=Array.from({length:30},(_,i)=>{
      const el=document.createElement('span');
      el.className='butterfly-3d-dust';
      overlay.appendChild(el);
      return {el, lag:.014+i*.0067, dx:variation[i%8]*6+(Math.random()-.5)*9,
        dy:(Math.random()-.5)*11, size:.65+Math.random()*1.4};
    });
  }

  function paint() {
    if (!butterfly) return;
    const t=clamp(progress,0,1);
    const p=flightPoint(t);
    const p1=flightPoint(clamp(t-.003,0,1));
    const p2=flightPoint(clamp(t+.003,0,1));
    const dx=p2.x-p1.x, dy=p2.y-p1.y;
    const heading=Math.atan2(dy,dx);
    const airborne=1-smooth((t-.80)/.20);
    const hoverAmount=1-smooth((t-.73)/.27);
    butterfly.position.set(p.x,p.y+Math.sin(t*57+variation[2])*3.6*hoverAmount,0);
    // Bank through turns; a small yaw exposes the thickness of real 3D wings.
    butterfly.rotation.z=clamp(Math.sin(heading)*-.22,-.30,.30)*airborne +
      Math.sin(t*18+variation[3])*.075*airborne;
    butterfly.rotation.y=(Math.sin(t*13+variation[4])*.26 + .07)*airborne;
    butterfly.rotation.x=Math.sin(t*9+variation[5])*.09*airborne;
    const perspective=mix(1.16,.70,smooth(t));
    butterfly.scale.setScalar(modelPixels*perspective);
    butterfly.visible=started && (t>.006 || reduced.matches);
    for (const dot of dust) {
      const tailT=t-dot.lag;
      const active=started && !reduced.matches && t<.91 &&
        tailT>0 && tailT<1 && t>.02;
      if (!active) {dot.el.style.opacity='0';continue;}
      const q=flightPoint(tailT);
      const alpha=.62*(1-smooth(dot.lag/.24))*smooth(t/.07);
      dot.el.style.setProperty('--dust-x',`${(q.x+dot.dx).toFixed(1)}px`);
      dot.el.style.setProperty('--dust-y',`${(q.y+dot.dy).toFixed(1)}px`);
      dot.el.style.setProperty('--dust-alpha',alpha.toFixed(3));
      dot.el.style.setProperty('--dust-size',dot.size.toFixed(2));
      dot.el.style.opacity='';
    }
    overlay.dataset.flightState=t>=1?'landed':t>.006?'flying':'starting';
    overlay.dataset.flightProgress=t.toFixed(3);
  }

  function schedule() {
    if (!frameId) frameId=requestAnimationFrame(frame);
  }
  function frame(now) {
    frameId=0;
    if (!loaded || !inView) return;
    resize();
    const dt=lastTime?Math.min(70,now-lastTime):0;
    lastTime=now;
    if (started && !reduced.matches) progress=clamp(progress+dt/FLIGHT_MS,0,1);
    if (reduced.matches) progress=1;
    paint();
    if (mixer) {
      const settling=smooth((progress-.82)/.18);
      const speed=mix(1.40+.14*Math.sin(progress*29),.075,settling);
      for (const action of actions) action.timeScale=speed;
      mixer.update(Math.min(clock.getDelta(),.05));
    }
    renderer.render(scene,camera);
    // Once landed, render at a gentler frame rate for subtle resting wings.
    if (inView) schedule();
  }

  function begin() {
    if (!loaded || !inView) return;
    started=true;
    progress=reduced.matches?1:0;
    lastTime=0;
    overlay.style.visibility='visible';
    overlay.dataset.flightState='starting';
    paint();
    schedule();
  }

  function initialize() {
    if (initializing) return;
    initializing=true;
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    } catch(error) {
      console.warn('[Butterfly 3D] WebGL is unavailable:',error);
      overlay.dataset.flightState='unavailable';
      return;
    }
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.16;
    renderer.domElement.setAttribute('aria-hidden','true');
    overlay.appendChild(renderer.domElement);
    scene=new THREE.Scene();
    camera=new THREE.OrthographicCamera(0,1,0,1,.1,1000);
    camera.position.set(0,0,200);camera.lookAt(0,0,0);
    scene.add(new THREE.AmbientLight(0xffffff,1.35));
    const light=new THREE.DirectionalLight(0xfff0d9,1.50);
    light.position.set(-35,-25,100);scene.add(light);
    const fill=new THREE.DirectionalLight(0xe1e9d5,.55);
    fill.position.set(50,50,75);scene.add(fill);
    makeDust();
    resize();
    new GLTFLoader().load(MODEL_URL,gltf=>{
      const model=gltf.scene;
      const box=new THREE.Box3().setFromObject(model);
      const size=box.getSize(new THREE.Vector3());
      const largest=Math.max(size.x,size.y,size.z);
      if (!Number.isFinite(largest) || largest<=0) {
        console.warn('[Butterfly 3D] The GLB contains no visible geometry.');
        return;
      }
      model.position.sub(box.getCenter(new THREE.Vector3()));
      const normalized=new THREE.Group();
      normalized.scale.setScalar(1/largest);
      normalized.rotation.x=Math.PI/2; // Blender's XZ wings face the viewer.
      normalized.add(model);
      butterfly=new THREE.Group();butterfly.add(normalized);scene.add(butterfly);
      if (gltf.animations.length) {
        mixer=new THREE.AnimationMixer(model);
        actions=gltf.animations.map((clip,i)=>{
          const action=mixer.clipAction(clip);
          action.play();
          action.time=[0,.065,.028,.093][i%4];
          return action;
        });
      }
      loaded=true;
      console.info(`[Butterfly 3D] Ready: upper-right corner flight; ${gltf.animations.length} wing animations.`);
      if (inView || forceReplay) {inView=true;begin();}
    },undefined,error=>{
      overlay.dataset.flightState='error';
      console.error(`[Butterfly 3D] Cannot load ${MODEL_URL}`,error);
    });
  }

  // Preload shortly BEFORE the calendar appears. The large 3D file won't
  // compete with the opening wedding-ring animation on initial page load.
  const preload=new IntersectionObserver(entries=>{
    if (entries.some(entry=>entry.isIntersecting)) {
      initialize();preload.disconnect();
    }
  },{rootMargin:'850px 0px'});
  preload.observe(day);

  // Trigger only when March 3 is actually visible on screen, not while the
  // user is watching the film or reading another section of the page.
  const watcher=new IntersectionObserver(entries=>{
    const nowVisible=entries.some(entry=>entry.isIntersecting);
    if (nowVisible===inView) return;
    inView=nowVisible;
    if (inView) {
      if (loaded) begin();
      else initialize();
    } else {
      started=false;
      progress=0;
      lastTime=0;
      overlay.style.visibility='hidden';
      overlay.dataset.flightState='waiting';
      for (const dot of dust) dot.el.style.opacity='0';
    }
  },{threshold:.60,rootMargin:'0px 0px -8% 0px'});
  watcher.observe(day);

  window.addEventListener('resize',()=>{resize();if(inView)schedule();},{passive:true});
  window.addEventListener('scroll',()=>{if(inView && loaded)schedule();},{passive:true});
  reduced.addEventListener('change',()=>{if(inView && loaded)begin();});
  document.addEventListener('visibilitychange',()=>{
    if (!document.hidden && inView && loaded) {lastTime=0;schedule();}
  });

  // Optional replay from the browser console: KCButterflyFlight.replay()
  window.KCButterflyFlight={
    replay(){forceReplay=true;initialize();if(loaded){inView=true;begin();}},
    status(){return {loaded,inView,started,progress,state:overlay.dataset.flightState||'waiting'};}
  };
  overlay.dataset.flightState='waiting';
})();
