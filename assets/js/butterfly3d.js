/**
 * Kenneth & Catherine — V9.07, sage-green original Blender butterfly + panel-contained flight.
 * A separate, lazy-loaded Three.js scene; the wedding rings are not touched.
 * The butterfly enters from the LOWER-RIGHT of the ivory Save the Date panel,
 * stays within its rounded boundaries, and lands in a reserved space under 3.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(() => {
  'use strict';
  const overlay = document.getElementById('butterfly-3d-container');
  const day = document.getElementById('calendar-wedding-day');
  const calendar = overlay?.closest('.wedding-calendar');
  if (!overlay || !day || !calendar) return;

  // Keep the canvas INSIDE the ivory rounded Save the Date panel, not in
  // <body>. This prevents the butterfly from appearing over the wedding film.
  const stage = overlay.closest('.save-date-stage');
  if (!stage) return;
  stage.appendChild(overlay);
  overlay.classList.add('butterfly-flight-panel');
  overlay.style.visibility = 'hidden';

  const MODEL_URL = 'assets/models/butterfly.glb';
  const FLIGHT_MS = 6200;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => { t = clamp(t, 0, 1); return t*t*(3-2*t); };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const variation = Array.from({length: 8}, () => Math.random()*2-1);

  let scene, camera, renderer, butterfly, mixer;
  let actions = [], wingParts = [], loaded = false, initializing = false;
  let inView = false, started = false, progress = 0;
  let lastTime = 0, frameId = 0, viewportW = 0, viewportH = 0;
  let modelPixels = 54;
  let forceReplay = false;
  let entrance = null;
  const clock = new THREE.Clock();

  // Cubic Bezier points are in VIEWPORT coordinates, not calendar coordinates.
  function bezier(a,b,c,d,t) {
    const u=1-t;
    return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d;
  }
  function xy(a,b,c,d,t) {
    return {x:bezier(a.x,b.x,c.x,d.x,t), y:bezier(a.y,b.y,c.y,d.y,t)};
  }
  // Landing point is anchored to the actual March 3 DOM cell.
  // A reserved gap beneath the first calendar week ensures the butterfly
  // cannot cover the numbers 10 or 17 (especially on narrow phones).
  function landingPoint() {
    const rect = day.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    return {
      x: rect.left + rect.width * .5 - stageRect.left,
      y: rect.bottom - stageRect.top + clamp(modelPixels*.32, 9, 15)
    };
  }

  // Entrance is the LOWER-RIGHT corner of the visible ivory panel.
  // The coordinates are local to that panel and cannot enter the video.
  function entrancePoint() {
    const rect = stage.getBoundingClientRect();
    const visibleBottom = Math.min(rect.bottom, window.innerHeight);
    const safeBottom = visibleBottom > Math.max(0,rect.top)+90
      ? visibleBottom-rect.top : stage.clientHeight;
    return {
      x: Math.max(modelPixels,stage.clientWidth-modelPixels*.75),
      y: clamp(safeBottom-modelPixels*.75,modelPixels,stage.clientHeight-modelPixels*.55)
    };
  }

  function flightPoint(rawT) {
    const t = smooth(clamp(rawT, 0, 1));
    const end = landingPoint();
    const w = viewportW, h = viewportH;
    const start = entrance || entrancePoint();
    // Four connected, gently curving arcs; approach the date from below,
    // not from the video above the panel.
    const entry = {
      x: clamp(w*.79,modelPixels,w-modelPixels*.5),
      y: mix(start.y,end.y,.24)
    };
    const swoop = {
      x: clamp(end.x-w*.21,modelPixels*.8,w*.73),
      y: mix(start.y,end.y,.58)
    };
    const approach = {
      x: clamp(end.x+Math.min(w*.12,95),modelPixels*.5,w-modelPixels*.5),
      y: end.y + clamp(h*.12,45,108)
    };
    if (t<.29) {
      const u=t/.29;
      return xy(start,{x:start.x-w*.025,y:mix(start.y,entry.y,.35)},
        {x:entry.x+w*.07,y:mix(start.y,entry.y,.83)},entry,u);
    }
    if (t<.57) {
      const u=(t-.29)/.28;
      return xy(entry,{x:entry.x-w*.15,y:entry.y-h*.05},
        {x:swoop.x+w*.07,y:swoop.y+h*.06},swoop,u);
    }
    if (t<.82) {
      const u=(t-.57)/.25;
      return xy(swoop,{x:swoop.x+w*.05,y:swoop.y-h*.08},
        {x:approach.x-w*.08,y:approach.y+h*.07},approach,u);
    }
    const u=(t-.82)/.18;
    return xy(approach,{x:approach.x-w*.03,y:approach.y-h*.06},
      {x:end.x+modelPixels*.08,y:end.y+modelPixels*.32},end,u);
  }

  // Wing pivots are separate named meshes reconstructed from the original
  // Blender file. They are animated in Three.js because the Blender 2.60
  // armature data is not portable to this lightweight reconstructed GLB.
  function animateWings(now) {
    if (!wingParts.length) return;
    const landed=smooth((progress-.83)/.17);
    const flutterTime=now*.044;
    const asymmetry=.06*Math.sin(now*.0028+variation[0]);
    for (const {mesh, side, hind} of wingParts) {
      const phase=flutterTime-(hind?.30:0)+(side<0?.045:-.045);
      const wave=.5+.5*Math.sin(phase);
      const flyingAngle=.12+1.02*(1-wave)+asymmetry;
      const restingAngle=.86+.055*Math.sin(now*.003+(hind?.7:0));
      mesh.rotation.y=side*mix(flyingAngle,restingAngle,landed);
      mesh.rotation.x=(hind?-.055:.035)*Math.sin(phase*.5)*(1-landed);
    }
  }

  function resize() {
    if (!renderer) return;
    const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
    if (w===viewportW && h===viewportH) return;
    viewportW=w; viewportH=h;
    camera.left=0;camera.right=w;camera.top=0;camera.bottom=h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(w,h,false);
    modelPixels=clamp(Math.min(w*.095,h*.08),30,46);
    paint();
  }

  function paint() {
    if (!butterfly) return;
    const t=clamp(progress,0,1);
    const p=flightPoint(t);
    const p1=flightPoint(clamp(t-.003,0,1));
    const p2=flightPoint(clamp(t+.003,0,1));
    const dx=p2.x-p1.x, dy=p2.y-p1.y;
    const heading=Math.atan2(dy,dx);
    const airborne=1-smooth((t-.82)/.18);
    const hoverAmount=1-smooth((t-.76)/.24);
    butterfly.position.set(p.x,p.y+(Math.sin(t*51+variation[2])*3.4+Math.sin(t*91)*1.1)*hoverAmount,0);
    // Bank through turns; a small yaw exposes the thickness of real 3D wings.
    butterfly.rotation.z=clamp(Math.sin(heading)*-.31,-.39,.39)*airborne +
      Math.sin(t*21+variation[3])*.075*airborne;
    butterfly.rotation.y=(Math.sin(t*14+variation[4])*.29 + .08)*airborne;
    butterfly.rotation.x=Math.sin(t*9+variation[5])*.09*airborne;
    const perspective=mix(1.23,.70,smooth(t));
    butterfly.scale.setScalar(modelPixels*perspective);
    butterfly.visible=started && (t>.006 || reduced.matches);
    // Highlight the date itself only when the butterfly lands.
    calendar.classList.toggle('butterfly-has-landed',t>=.995 && started);
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
    animateWings(now);
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
    entrance=entrancePoint();
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
      // Blender uses a Y-up butterfly; the overlay camera is Y-down.
      // A 180-degree rotation makes the head/antennae point UP in the browser.
      normalized.rotation.z = Math.PI;
      normalized.add(model);
      butterfly=new THREE.Group();butterfly.add(normalized);scene.add(butterfly);
      for (const name of ['TW_Left','TW_Right','BW_Left','BW_Right']) {
        const mesh=model.getObjectByName(name);
        if (mesh) {
          mesh.material.side=THREE.DoubleSide;
          wingParts.push({mesh,side:name.endsWith('Left')?1:-1,hind:name.startsWith('BW')});
        }
      }
      if (gltf.animations.length && !wingParts.length) {
        mixer=new THREE.AnimationMixer(model);
        actions=gltf.animations.map((clip,i)=>{
          const action=mixer.clipAction(clip);
          action.play();
          action.time=[0,.065,.028,.093][i%4];
          return action;
        });
      }
      loaded=true;
      console.info(`[Butterfly 3D] Ready: original Blender geometry, ${wingParts.length} wing meshes, lower-right panel flight, upright, sage-green.`);
      if (inView || forceReplay) {inView=true;begin();}
    },undefined,error=>{
      overlay.dataset.flightState='error';
      console.error(`[Butterfly 3D] Cannot load ${MODEL_URL}`,error);
    });
  }

  // Preload shortly BEFORE the calendar appears. The large 3D file won't
  // compete with the opening wedding-ring animation on initial page load.
  const sunrays=document.querySelector('.calendar-sunrays');
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
    if (sunrays) sunrays.classList.toggle('is-active',inView && !reduced.matches);
    if (inView) {
      if (loaded) begin();
      else initialize();
    } else {
      started=false;
      progress=0;
      lastTime=0;
      overlay.style.visibility='hidden';
      overlay.dataset.flightState='waiting';
      calendar.classList.remove('butterfly-has-landed');
      entrance=null;
    }
  },{threshold:.60,rootMargin:'0px 0px -8% 0px'});
  watcher.observe(day);

  window.addEventListener('resize',()=>{resize();if(inView)schedule();},{passive:true});
  window.addEventListener('scroll',()=>{if(inView && loaded)schedule();},{passive:true});
  reduced.addEventListener('change',()=>{
    if (sunrays) sunrays.classList.toggle('is-active',inView && !reduced.matches);
    if(inView && loaded)begin();
  });
  document.addEventListener('visibilitychange',()=>{
    if (!document.hidden && inView && loaded) {lastTime=0;schedule();}
  });

  // Optional replay from the browser console: KCButterflyFlight.replay()
  window.KCButterflyFlight={
    replay(){forceReplay=true;initialize();if(loaded){inView=true;begin();}},
    status(){return {loaded,inView,started,progress,state:overlay.dataset.flightState||'waiting',entrance:entrance||null,landing:landingPoint(),model:MODEL_URL};}
  };
  overlay.dataset.flightState='waiting';
})();
