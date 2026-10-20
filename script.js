/* V8.70 — Mobile-visible handwriting trigger and cache-safe deployment, inspired by the referenced handwriting tutorial.
   Each visible ink stroke follows a real SVG path in natural pen order.
   Paths use a small subset of the Hershey Script 1 vector alphabet;
   attribution appears in README.txt. No font files are bundled.
   The existing ring toss, spotlight, and countdown remain unchanged. */
(() => {
  'use strict';
  const svg = document.querySelector('.ink-signature');
  if (!svg) return;
  const NS='http://www.w3.org/2000/svg';
  const create=(tag,attrs={})=>{
    const node=document.createElementNS(NS,tag);
    for(const [name,value] of Object.entries(attrs)) node.setAttribute(name,String(value));
    return node;
  };
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const glyphs={" ":{"advance":378,"d":""},"&":{"advance":819,"d":"M 756 410 L 724 378 L 756 346 L 788 378 L 788 410 L 756 441 L 724 441 L 662 410 L 598 346 L 441 94.5 L 378 31.5 L 315 0 L 220 0 L 126 31.5 L 94.5 94.5 L 94.5 158 L 126 220 L 158 252 L 220 284 L 378 346 L 441 378 L 504 441 L 536 504 L 536 567 L 504 630 L 441 662 L 378 630 L 346 567 L 346 472 L 378 284 L 410 189 L 472 94.5 L 536 31.5 L 598 0 L 662 0 L 693 63 L 693 94.5 M 220 0 L 158 31.5 L 126 94.5 L 126 158 L 158 220 L 189 252 L 378 346 M 346 472 L 378 315 L 410 220 L 472 126 L 536 63 L 598 31.5 L 662 31.5 L 693 63"},",":{"advance":346,"d":"M 126 0 L 94.5 31.5 L 126 63 L 158 31.5 L 158 0 L 126 -63 L 63 -126"},"C":{"advance":630,"d":"M 410 472 L 410 441 L 441 410 L 504 410 L 567 441 L 598 504 L 598 567 L 567 630 L 504 662 L 410 662 L 315 630 L 252 567 L 189 472 L 158 410 L 126 284 L 126 158 L 158 63 L 189 31.5 L 252 0 L 315 0 L 410 31.5 L 472 94.5 L 504 158"},"K":{"advance":756,"d":"M 252 441 L 189 472 L 158 536 L 158 567 L 189 630 L 252 662 L 284 662 L 346 630 L 378 567 L 378 504 L 346 378 L 284 189 L 220 63 L 158 0 L 94.5 0 L 63 31.5 L 63 94.5 M 788 567 L 788 630 L 756 662 L 724 662 L 662 630 L 598 567 L 536 472 L 472 410 L 410 378 L 346 378 M 410 378 L 441 315 L 441 94.5 L 472 31.5 L 504 0 L 536 0 L 598 31.5 L 630 63 L 693 158"},"a":{"advance":504,"d":"M 315 189 L 284 252 L 220 284 L 158 284 L 94.5 252 L 63 220 L 31.5 158 L 31.5 94.5 L 63 31.5 L 126 0 L 189 0 L 252 31.5 L 284 94.5 L 346 284 L 315 126 L 315 31.5 L 346 0 L 378 0 L 441 31.5 L 472 63 L 536 158"},"e":{"advance":315,"d":"M 63 63 L 126 94.5 L 158 126 L 189 189 L 189 252 L 158 284 L 126 284 L 63 252 L 31.5 189 L 31.5 94.5 L 63 31.5 L 126 0 L 189 0 L 252 31.5 L 284 63 L 346 158"},"h":{"advance":472,"d":"M 31.5 158 L 94.5 252 L 189 410 L 220 472 L 252 567 L 252 630 L 220 662 L 158 630 L 126 567 L 94.5 441 L 63 252 L 31.5 0 M 31.5 0 L 63 94.5 L 94.5 158 L 158 252 L 220 284 L 284 284 L 315 252 L 315 189 L 284 94.5 L 284 31.5 L 315 0 L 346 0 L 410 31.5 L 441 63 L 504 158"},"i":{"advance":220,"d":"M 126 441 L 126 410 L 158 410 L 158 441 L 126 441 M 31.5 158 L 94.5 284 L 31.5 94.5 L 31.5 31.5 L 63 0 L 94.5 0 L 158 31.5 L 189 63 L 252 158"},"l":{"advance":252,"d":"M 31.5 158 L 94.5 252 L 189 410 L 220 472 L 252 567 L 252 630 L 220 662 L 158 630 L 126 567 L 94.5 441 L 63 220 L 63 31.5 L 94.5 0 L 126 0 L 189 31.5 L 220 63 L 284 158"},"n":{"advance":567,"d":"M 31.5 158 L 94.5 252 L 158 284 L 189 252 L 189 220 L 158 94.5 L 126 0 M 158 94.5 L 189 158 L 252 252 L 315 284 L 378 284 L 410 252 L 410 189 L 378 94.5 L 378 31.5 L 410 0 L 441 0 L 504 31.5 L 536 63 L 598 158"},"o":{"advance":441,"d":"M 220 284 L 158 284 L 94.5 252 L 63 220 L 31.5 158 L 31.5 94.5 L 63 31.5 L 126 0 L 189 0 L 252 31.5 L 284 63 L 315 126 L 315 189 L 284 252 L 220 284 L 189 252 L 189 189 L 220 126 L 284 94.5 L 378 94.5 L 441 126 L 472 158"},"r":{"advance":410,"d":"M 31.5 158 L 94.5 252 L 126 315 L 126 252 L 220 252 L 252 220 L 252 158 L 220 63 L 220 31.5 L 252 0 L 284 0 L 346 31.5 L 378 63 L 441 158"},"s":{"advance":346,"d":"M 31.5 158 L 94.5 252 L 126 315 L 126 252 L 189 158 L 220 94.5 L 220 31.5 L 158 0 M 31.5 31.5 L 94.5 0 L 220 0 L 284 31.5 L 315 63 L 378 158"},"t":{"advance":284,"d":"M 31.5 158 L 94.5 252 L 158 378 M 252 662 L 63 94.5 L 63 31.5 L 94.5 0 L 158 0 L 220 31.5 L 252 63 L 315 158 M 63 410 L 284 410"},"v":{"advance":472,"d":"M 31.5 158 L 94.5 284 L 63 126 L 63 31.5 L 94.5 0 L 126 0 L 220 31.5 L 284 94.5 L 315 189 L 315 284 M 315 284 L 346 158 L 378 126 L 441 126 L 504 158"}};
  const lines=[
    {text:'love lots,',scale:.127,right:855,baseline:105,start:0,end:2350},
    {text:'Kenneth & Catherine',scale:.087,right:855,baseline:213,start:2700,end:7450}
  ];
  const totalDuration=7450;
  const strokes=[];
  let lastProgress=0,hasStarted=false,animationFrame=0,startTime=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  svg.setAttribute('viewBox','0 0 900 260');
  svg.replaceChildren();
  svg.setAttribute('role','presentation');

  // A little pigment travels beyond the main stroke into the paper fibers.
  const defs=create('defs');
  const bleedFilter=create('filter',{id:'signature-paper-bleed',x:'-35%',y:'-35%',width:'170%',height:'170%'});
  bleedFilter.appendChild(create('feTurbulence',{
    type:'fractalNoise',baseFrequency:'.032',numOctaves:'2',seed:'12',result:'paper-grain'
  }));
  bleedFilter.appendChild(create('feDisplacementMap',{
    in:'SourceGraphic',in2:'paper-grain',scale:'6',
    xChannelSelector:'R',yChannelSelector:'G'
  }));
  bleedFilter.appendChild(create('feGaussianBlur',{stdDeviation:'7'}));
  defs.appendChild(bleedFilter);
  svg.appendChild(defs);

  function splitPenStrokes(d){
    return d.match(/M\s*[^M]+/g)||[];
  }

  lines.forEach((line,lineIndex)=>{
    const totalAdvance=[...line.text].reduce((sum,char)=>sum+(glyphs[char]?.advance||378),0);
    const startX=line.right-totalAdvance*line.scale;
    const group=create('g',{
      class:'handwriting-line',
      transform:`translate(${startX.toFixed(2)} ${line.baseline}) scale(${line.scale} ${-line.scale})`
    });
    svg.appendChild(group);
    let x=0;
    const lineStrokes=[];
    for(let i=0;i<line.text.length;i++){
      const letter=line.text[i],data=glyphs[letter];
      if(!data){x+=378;continue;}
      if(data.d){
        const letterGroup=create('g',{transform:`translate(${x} 0)`});
        group.appendChild(letterGroup);
        const subpaths=splitPenStrokes(data.d);
        subpaths.forEach((d,j)=>{
          const seed=i*17+j*29+lineIndex*43;
          const width=23+(Math.sin(seed*1.38)+1)*3.4;
          const trace=create('g',{class:'handwriting-trace'});
          const bleed=create('path',{
            d,fill:'none',stroke:'#667a5c','stroke-width':(width*1.75).toFixed(2),
            'stroke-linecap':'round','stroke-linejoin':'round',
            opacity:'.22',filter:'url(#signature-paper-bleed)'
          });
          const ink=create('path',{
            d,fill:'none',stroke:'#3d503e','stroke-width':width.toFixed(2),
            'stroke-linecap':'round','stroke-linejoin':'round',opacity:'.96'
          });
          const dark=create('path',{
            d,fill:'none',stroke:'#2f4636','stroke-width':(width*.43).toFixed(2),
            'stroke-linecap':'round','stroke-linejoin':'round',opacity:'.18'
          });
          // Legacy V8.26 styles used `opacity:0` on all SVG paths.
          // Set explicit visibility on the actual strokes, not just SVG attributes.
          for (const path of [bleed, ink, dark]) {
            path.style.setProperty('opacity', path === bleed ? '.25' : path === dark ? '.28' : '1', 'important');
            path.style.setProperty('stroke-opacity', '1', 'important');
            path.style.setProperty('visibility', 'visible', 'important');
            path.style.setProperty('vector-effect', 'none', 'important');
            // The older global SVG rule also forced stroke-width:2.15px;
            // at our scaled glyph coordinates that becomes nearly invisible.
            path.style.setProperty('stroke-width', path.getAttribute('stroke-width'), 'important');
            path.style.setProperty('stroke', path.getAttribute('stroke'), 'important');
          }
          trace.append(bleed,ink,dark);
          letterGroup.appendChild(trace);
          lineStrokes.push({parts:[bleed,ink,dark],ink,letter,index:i});
        });
      }
      x+=data.advance;
    }
    // Allocate time to actual traced stroke length. Small pauses represent
    // the pen lifting, especially between words and before the second line.
    let sum=0;
    for(const stroke of lineStrokes){
      let length=1;
      try{length=stroke.ink.getTotalLength()||1;}catch(_error){}
      stroke.length=length;
      stroke.weight=Math.pow(Math.max(length,15),.70);
      stroke.pause=stroke.letter==='&'?30:12;
      sum+=stroke.weight;
    }
    const duration=line.end-line.start;
    const pauses=lineStrokes.reduce((acc,stroke)=>acc+stroke.pause,0);
    const drawingTime=Math.max(100,duration-pauses);
    let time=line.start;
    for(const stroke of lineStrokes){
      stroke.from=time;
      stroke.to=time+drawingTime*(stroke.weight/Math.max(1,sum));
      time=stroke.to+stroke.pause;
      for(const path of stroke.parts){
        path.style.strokeDasharray=`${stroke.length+2} ${stroke.length+2}`;
        path.style.strokeDashoffset=String(stroke.length+2);
      }
      strokes.push(stroke);
    }
  });

  // Ink marks only appear as the pen reaches their place on the signature.
  // Their softly irregular edges complement the subtle feathering above.
  const spots=create('g',{'class':'handwriting-ink-pools','aria-hidden':'true'});
  svg.appendChild(spots);
  const poolData=[
    [665,82,3.6,.24,1700],
    [842,105,2.3,.18,2150],
    [202,208,3.1,.18,3360],
    [367,224,4.6,.20,4230],
    [655,222,3.3,.18,6060],
    [834,225,2.6,.17,7200]
  ];
  const pools=poolData.map(([x,y,r,opacity,time],i)=>{
    const p=create('ellipse',{
      cx:x,cy:y,rx:r,ry:(r*(.65+(i%3)*.14)).toFixed(2),
      fill:'#42583d',opacity:'0',filter:'url(#signature-paper-bleed)'
    });
    spots.appendChild(p);
    return {p,opacity,time};
  });

  window.updateWeddingSignature=(progress)=>{
    lastProgress=reduced?1:clamp(progress);
    const ms=lastProgress*totalDuration;
    for(const stroke of strokes){
      const f=smooth((ms-stroke.from)/Math.max(1,stroke.to-stroke.from));
      const offset=(stroke.length+2)*(1-f);
      for(const path of stroke.parts){path.style.strokeDashoffset=offset.toFixed(2);}
    }
    for(const {p,opacity,time} of pools){
      p.setAttribute('opacity',(opacity*smooth((ms-time)/230)).toFixed(3));
    }
  };

  function tick(now){
    if(!hasStarted)return;
    window.updateWeddingSignature((now-startTime)/totalDuration);
    if(lastProgress<1)animationFrame=requestAnimationFrame(tick);
    else animationFrame=0;
  }
  // Start once, as the spotlight reaches the signature. This is time-based,
  // not tied to how quickly a guest scrolls: the writing moves naturally.
  window.startWeddingSignature=()=>{
    if(hasStarted)return;
    hasStarted=true;
    if(reduced){window.updateWeddingSignature(1);return;}
    startTime=performance.now();
    animationFrame=requestAnimationFrame(tick);
  };
  // V8.70: Wait until the signature is ACTUALLY visible on the screen.
  // On mobile, the ring scene's scroll progress alone can pass its trigger
  // while the letter/signature is still outside the viewport.
  const signature = svg.closest('.spotlight-invitation-signature');
  window.requestWeddingSignature = () => {
    if (hasStarted || !signature) return;
    if (reduced) { window.updateWeddingSignature(1); return; }
    const bounds = signature.getBoundingClientRect();
    const inViewport = bounds.bottom > 10 && bounds.top < innerHeight - 10;
    const opacity = parseFloat(getComputedStyle(signature).opacity) || 0;
    if (inViewport && opacity >= .78) window.startWeddingSignature();
  };

  // Mobile scroll can jump past the exact trigger point. Check again after
  // every scroll/resize and when the tab returns to the foreground.
  let visibilityFrame = 0;
  const checkSignature = () => {
    if (visibilityFrame || hasStarted) return;
    visibilityFrame = requestAnimationFrame(() => {
      visibilityFrame = 0;
      window.requestWeddingSignature();
    });
  };
  addEventListener('scroll', checkSignature, {passive:true});
  addEventListener('resize', checkSignature, {passive:true});
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkSignature();
  });

  window.updateWeddingSignature(reduced?1:0);
  console.info('[Kenneth & Catherine] Website v8.74.0 — Save the Date calendar and centered layout loaded');
})();

/* KENNETH & CATHERINE — V8: NATURAL TWO-RING TOSS */

// Countdown: 3 March 2027, 3 PM Philippine time.
(() => {
  const target = new Date("2027-03-03T15:00:00+08:00").getTime();
  const elements = ["days", "hours", "minutes", "seconds"].map(id => document.getElementById(id));
  if (elements.some(el => !el)) return;
  function update() {
    const ms = Math.max(0, target - Date.now());
    const values = [Math.floor(ms / 86400000), Math.floor(ms % 86400000 / 3600000), Math.floor(ms % 3600000 / 60000), Math.floor(ms % 60000 / 1000)];
    values.forEach((v, i) => {
      const text = String(v).padStart(i === 0 ? 3 : 2, "0");
      const element = elements[i];
      // Only change the DOM when this particular unit has actually ticked.
      // This prevents all four numbers from blinking every second.
      if (element.textContent === text) return;
      const hadValue = element.dataset.timerInitialized === 'true';
      element.textContent = text;
      element.dataset.timerInitialized = 'true';
      if (hadValue && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.classList.remove('is-ticking');
        void element.offsetWidth; // Restart only this changed number's animation.
        element.classList.add('is-ticking');
      }
    });
  }
  update();
  setInterval(update, 1000);
})();

// Entrance effects for the sections after the animated hero.
(() => {
  const nodes = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach(node => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  nodes.forEach(node => observer.observe(node));
})();

(() => {
  const section = document.querySelector(".ring-experience");
  const canvas = document.getElementById("wedding-rings");
  if (!section || !canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.THREE) {
    console.error("Three.js is missing. Keep assets/js/three.min.js in your project.");
    return;
  }

  const intro = section.querySelector(".ring-intro");
  const hint = section.querySelector(".ring-scroll-hint");
  const background = section.querySelector(".ring-background");
  const stage = section.querySelector(".ring-stage");
  const progressBar = document.getElementById("ring-progress-bar");
  // Measured ring/title spacing is calculated from actual rendered bounds.
  const ringBounds = new THREE.Box3();
  const ringCorner = new THREE.Vector3();
  // Preserve the responsive placement through takeoff to prevent a downward dip.
  let heldRingFit = 1;
  let heldRingShiftY = 0;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const phase = (p, start, end) => ease((p - start) / (end - start));
  const opacity = (el, value) => { if (el) el.style.opacity = String(clamp(value)); };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "default" });
  } catch (error) {
    console.error("WebGL is unavailable", error);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;

  // V8.21: Physical hardback cover (CSS 3D) replaces paper mesh.
  // Ring geometry and choreography remain unchanged.

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 14;
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  const key = new THREE.DirectionalLight(0xffffff, 3.5);
  key.position.set(-4, 5, 8); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9d9ff, 1.6);
  fill.position.set(5, -2, 5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffe8c8, 2.3);
  rim.position.set(1, 4, -5); scene.add(rim);

  const metal = new THREE.MeshStandardMaterial({
    color: 0xe8e9e8, metalness: 0.9, roughness: 0.18, side: THREE.DoubleSide
  });
  const stoneMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0.02, roughness: 0.05, clearcoat: 1
  });

  // Both rings belong to one group, so the toss always moves them together.
  const rings = new THREE.Group();
  scene.add(rings);
  const groom = new THREE.Group();
  groom.add(new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.23, 28, 112), metal));
  rings.add(groom);
  const bride = new THREE.Group();
  bride.add(new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.13, 24, 112), metal));
  const stoneGeometry = new THREE.OctahedronGeometry(0.085, 1);
  for (let i = 0; i < 17; i++) {
    const angle = Math.PI * (0.13 + 0.74 * i / 16);
    const gem = new THREE.Mesh(stoneGeometry, stoneMaterial);
    gem.position.set(Math.cos(angle) * 1.15, Math.sin(angle) * 1.15, 0.145);
    gem.rotation.z = angle;
    bride.add(gem);
  }
  rings.add(bride);

  function progress() {
    const rect = section.getBoundingClientRect();
    const distance = section.offsetHeight - window.innerHeight;
    return distance > 0 ? clamp(-rect.top / distance) : 0;
  }

  let viewportWidth = 0;
  let smooth = 0;
  let last = 0;
  let pointerX = 0;
  window.addEventListener("pointermove", event => {
    if (event.pointerType === "mouse") pointerX = (event.clientX / innerWidth - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    viewportWidth = width;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  function animate(time) {
    requestAnimationFrame(animate);
    if (document.hidden) { last = time; return; }
    const dt = last ? Math.min((time - last) / 1000, 0.05) : 0.016;
    last = time;
    smooth = mix(smooth, progress(), 1 - Math.exp(-8 * dt));
    const p = smooth;
    const seconds = time / 1000;

    // V8: independent flight paths, natural upward toss, perspective shrink.
    // Scroll progress is deterministic, so scrolling backward reverses the toss.
    const unite = phase(p, 0.07, 0.34);
    const hold = phase(p, 0.34, 0.46);
    const tossGroom = phase(p, 0.49, 0.91);
    const tossBride = phase(p, 0.53, 0.94);
    const reveal = phase(p, 0.945, 0.985);

    // Preserve the side-by-side overlapping infinity silhouette at rest.
    // Z separation keeps the metal bands from visually cutting through each other.
    const groomStartX = mix(-2.05, -0.88, unite);
    const brideStartX = mix(2.05, 0.88, unite);

    // A tossed object rises quickly, then slows as it approaches the apex.
    // Each ring has a different launch and rotation, like two separate objects.
    const flight = t => 1 - Math.pow(1 - t, 2.1);
    const groomLift = flight(tossGroom);
    const brideLift = flight(tossBride);
    const cameraDistance = viewportWidth < 600 ? 21 : 15;
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * cameraDistance;
    const idle = Math.sin(seconds * 0.7) * 0.045 * (1 - tossGroom);

    groom.position.set(
      groomStartX - 0.36 * tossGroom,
      mix(0.12, 0, unite) + idle + viewHeight * 0.95 * groomLift,
      -0.32 - 2.2 * tossGroom
    );
    bride.position.set(
      brideStartX + 0.50 * tossBride,
      mix(-0.12, 0, unite) - idle * 0.7 + viewHeight * 1.03 * brideLift,
      0.32 - 3.2 * tossBride
    );

    // Each band flips around its own center, at a different speed and angle.
    // Groom: ~1.25 rotations; bride: ~1.6 rotations.
    // The sideways wobble makes the toss feel less mechanically synchronized.
    groom.rotation.set(
      mix(-0.28, 0.025, unite) + tossGroom * Math.PI * 2.5,
      mix(-0.7, -0.04, unite) + Math.sin(tossGroom * Math.PI * 1.5) * 0.28,
      mix(-0.14, -0.1, unite) - tossGroom * 0.32
    );
    bride.rotation.set(
      mix(0.28, -0.025, unite) + tossBride * Math.PI * 3.2,
      mix(0.7, 0.04, unite) - Math.sin(tossBride * Math.PI * 1.6) * 0.36,
      mix(0.14, 0.1, unite) + tossBride * 0.42
    );

    // Rings shrink individually as they fly farther away.
    // This replaces the old camera zoom toward the rings.
    const baseScale = 0.87; // Constant size before tossing; no pre-toss zoom.
    groom.scale.setScalar(baseScale * mix(1, 0.22, phase(p, 0.55, 0.94)));
    bride.scale.setScalar(baseScale * mix(1, 0.16, phase(p, 0.59, 0.97)));

    rings.position.set(0, 0, 0);
    rings.rotation.set(0, 0, 0);
    rings.scale.setScalar(1);
    camera.position.set(0, 0, cameraDistance);
    camera.lookAt(0, 0, 0);

    key.position.x = -4 + Math.sin(seconds * 0.6) * 1.8;
    rim.position.x = 1 + Math.cos(seconds * 0.45) * 1.6;

    // V8.48: preserve the ring choreography above; let the SAME sticky stage
    // shift from olive into ivory as the separate spotlight finishes revealing.
    const blend = phase(p, 0.82, 0.985);
    const rgb = [
      Math.round(mix(25, 245, blend)),
      Math.round(mix(35, 240, blend)),
      Math.round(mix(28, 230, blend))
    ];
    if (stage) stage.style.backgroundColor = `rgb(${rgb.join(",")})`;
    if (background) opacity(background, 1 - phase(p, 0.76, 0.955));

    // Once the rings have exited above the viewport, they can fade away.
    opacity(canvas, phase(p, 0.08, 0.23) * (1 - phase(p, 0.94, 1)));
    // Opening title stays visible through the infinity formation.
    // Move DOWN gently while rings enter; leave the toss untouched.
    if (intro) {
      // Cap the downward title travel so the date never collides with
      // the bottom scroll hint, even on short laptop/mobile viewports.
      const titleMove = phase(p, 0.02, 0.34);
      const stageHeight = stage.clientHeight;
      const hintHeight = hint ? hint.getBoundingClientRect().height : 0;
      const titleHeight = intro.offsetHeight;
      const bottomReserved = Math.max(42, hintHeight + 34);
      const maximumDrop = Math.max(0,
        stageHeight - bottomReserved - (stageHeight / 2 + titleHeight / 2));
      const desiredDrop = Math.min(stageHeight * 0.17, maximumDrop);
      intro.style.setProperty("--title-drop", `${(titleMove * desiredDrop).toFixed(2)}px`);
    }
    opacity(intro, 1 - phase(p, 0.43, 0.55));
    opacity(hint, 1 - phase(p, 0, 0.12));
    if (progressBar) progressBar.style.width = `${Math.round(p * 100)}%`;

    // V8.6 — keep responsive placement steady until the rings have flown away.
    // Align the ring pair just above the title instead of at the top
    // of a large reserved area. No flight paths or rotations are edited.
    rings.position.set(0, 0, 0);
    rings.scale.setScalar(1);
    rings.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);

    if (intro && stage && p <= 0.46) {
      const titleRect = intro.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const w = stageRect.width;
      const h = stageRect.height;
      const gap = Math.max(18, Math.min(36, h * 0.035));
      const topMargin = Math.max(14, h * 0.05);
      const sideMargin = Math.max(14, w * 0.055);
      const titleTop = titleRect.top - stageRect.top;
      const availableHeight = Math.max(1, titleTop - gap - topMargin);

      ringBounds.setFromObject(rings);
      const lo = ringBounds.min;
      const hi = ringBounds.max;
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      for (const x of [lo.x, hi.x]) {
        for (const y of [lo.y, hi.y]) {
          for (const z of [lo.z, hi.z]) {
            ringCorner.set(x, y, z).project(camera);
            const sx = (ringCorner.x + 1) * w / 2;
            const sy = (1 - ringCorner.y) * h / 2;
            minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
            minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
          }
        }
      }
      const measuredWidth = Math.max(1, maxX - minX);
      const measuredHeight = Math.max(1, maxY - minY);
      const fit = Math.min(1, (w - sideMargin * 2) / measuredWidth,
        availableHeight / measuredHeight);
      // Place rings near the title while reserving an actual measured gap.
      // If space is very short, fitting takes precedence over centering.
      const projectedCenter = (minY + maxY) / 2;
      const projectedHalfHeight = measuredHeight * fit / 2;
      const targetCenter = Math.max(topMargin + projectedHalfHeight,
        titleTop - gap - projectedHalfHeight);
      const worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const worldShiftY = (projectedCenter - targetCenter) * worldHeight / h;

      // Cache the measured layout; the toss must not undo this offset.
      heldRingFit = fit;
      heldRingShiftY = worldShiftY;
    }

    // Do not return the rings toward their uncorrected center at takeoff.
    // Only release the layout adjustment after the toss is nearly complete.
    const correction = phase(p, 0.08, 0.23) *
      (1 - phase(p, 0.94, 1));
    rings.scale.setScalar(mix(1, heldRingFit, correction));
    rings.position.y = heldRingShiftY * correction;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();




/* V8.48 — scroll-scrubbed, minimal cinematic spotlight for the invitation.
   Deliberately separate from the approved Three.js ring animation. */
(() => {
  const section = document.querySelector('.ring-experience');
  const scene = document.querySelector('.spotlight-invitation');
  if (!section || !scene) return;

  const paper = scene.querySelector('.spotlight-ivory-paper');
  const darkness = scene.querySelector('.spotlight-darkness');
  const cone = scene.querySelector('.spotlight-light-cone');
  const pool = scene.querySelector('.spotlight-light-pool');
  const vignette = scene.querySelector('.spotlight-warm-vignette');
  const ornament = scene.querySelector('.spotlight-invitation-ornament');
  const forewordKicker = scene.querySelector('.foreword-kicker');
  const heading = scene.querySelector('.spotlight-invitation-heading');
  const message = scene.querySelector('.spotlight-invitation-message');
  const signoff = scene.querySelector('.spotlight-invitation-signature');
  const drawSignature = window.updateWeddingSignature || (() => {});
  const intro = section.querySelector('.ring-intro');
  const scrollHint = section.querySelector('.ring-scroll-hint');
  const progressBar = section.querySelector('#ring-progress-bar');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  const phase = (p, a, b) => ease((p - a) / (b - a));
  const alpha = (element, n) => { if (element) element.style.opacity = clamp(n).toFixed(4); };
  let queued = false;

  function render() {
    queued = false;
    if (reduced) {
      alpha(scene, 1);
      alpha(darkness, 0);
      alpha(cone, 0);
      alpha(pool, 0);
      alpha(paper, 1);
      if (paper) paper.style.webkitMaskImage = 'none';
      if (paper) paper.style.maskImage = 'none';
      alpha(vignette, 1);
      [forewordKicker, ornament, heading, message, signoff].forEach(el => alpha(el, 1));
      drawSignature(1);
      return;
    }

    const rect = section.getBoundingClientRect();
    const length = Math.max(1, section.offsetHeight - innerHeight);
    const p = clamp(-rect.top / length);
    // When local Three.js is missing, don't leave an old title on top of
    // the invitation. This fallback does nothing when the rings are available.
    if (!window.THREE) {
      alpha(intro, 1 - phase(p, .42, .56));
      alpha(scrollHint, 1 - phase(p, 0, .10));
      if (progressBar) progressBar.style.width = `${Math.round(p * 100)}%`;
    }
    const visible = phase(p, .77, .84);
    const light = phase(p, .79, .91);
    const spread = phase(p, .82, .973);
    const fadeOutBeam = 1 - phase(p, .925, .99);
    const finalPaper = phase(p, .91, .99);

    alpha(scene, visible);
    alpha(darkness, (1 - phase(p, .89, .985)) * .94);
    alpha(cone, phase(p, .79, .87) * fadeOutBeam * .78);
    alpha(pool, light * fadeOutBeam);
    alpha(vignette, phase(p, .87, .99) * .88);
    if (pool) pool.style.transform = `translate(-50%, -50%) scale(${(.37 + light * 2.1).toFixed(3)})`;

    // A wide, FEATHERED radial mask behaves like illuminated paper rather than
    // a hard-edged wipe. At full reveal, remove the mask for a seamless ivory page.
    if (paper) {
      alpha(paper, .35 + .65 * phase(p, .83, .942));
      if (spread > .9999) {
        paper.style.maskImage = 'none';
        paper.style.webkitMaskImage = 'none';
      } else {
        const core = (spread * 127).toFixed(2);
        const edge = (17 + spread * 150).toFixed(2);
        const mask = `radial-gradient(ellipse 70% 81% at 50% 46%, #000 0%, #000 ${core}%, transparent ${edge}%)`;
        paper.style.maskImage = mask;
        paper.style.webkitMaskImage = mask;
      }
    }

    // Cinematic opacity only: no page translation or letter sliding.
    alpha(forewordKicker, phase(p, .865, .932));
    alpha(ornament, phase(p, .865, .932));
    alpha(heading, phase(p, .873, .944));
    alpha(message, phase(p, .896, .966));
    alpha(signoff, phase(p, .929, .985));
    // V8.70: never start while the signature is still off-screen on mobile.
    if (p >= .945) window.requestWeddingSignature?.();
  }

  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(render);
    }
  };
  window.addEventListener('scroll', request, {passive:true});
  window.addEventListener('resize', request, {passive:true});
  render();
})();


/* V8.50 — Minimalist Timeless Countdown: scroll choreography only. Existing time
   calculations and every other animation above are intentionally unchanged. */
(() => {
  'use strict';
  const section = document.querySelector('.countdown-timeless');
  if (!section) return;

  const $ = (selector) => section.querySelector(selector);
  const eyebrow = $('[data-timeless-part="eyebrow"]');
  const heading = $('[data-timeless-part="heading"]');
  const subtitle = $('[data-timeless-part="subtitle"]');
  const lines = [...section.querySelectorAll('.timeless-rule-line')];
  const star = $('.timeless-rule-star');
  const units = [...section.querySelectorAll('.timeless-unit')];
  const scrollLabel = $('.timeless-scroll-label');
  const glow = $('.timeless-ambient-glow');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = t => { t = clamp(t); return t*t*(3-2*t); };
  const phase = (progress, a, b) => smooth((progress-a)/(b-a));
  const opacity = (node, t) => {
    if (node) node.style.opacity = String(clamp(t));
  };

  let framePending = false;
  function render() {
    framePending = false;
    // V8.63: all countdown typography stays fixed relative to its panel.
    if (section.closest('.video-countdown-transition')) return;
    if (reduced || window.matchMedia('(max-width: 900px)').matches) return;
    const wrapper = section.closest('.video-countdown-transition');
    const box = (wrapper || section).getBoundingClientRect();
    const distance = Math.max(1, (wrapper || section).offsetHeight - window.innerHeight);
    const raw = clamp(-box.top / distance);
    const p = wrapper ? clamp((raw - .46) / .50) : raw;

    // Deliberately fade-only, with no bounce, slide or viewport zoom.
    opacity(eyebrow, phase(p, .025, .18));
    opacity(heading, phase(p, .08, .30));
    opacity(subtitle, phase(p, .15, .36));
    const lineProgress = phase(p, .28, .49);
    for (const line of lines) line.style.transform = `scaleX(${lineProgress.toFixed(4)})`;
    opacity(star, phase(p, .32, .47));
    units.forEach((unit, index) => {
      opacity(unit, phase(p, .37 + index*.07, .61 + index*.07));
    });
    opacity(scrollLabel, phase(p, .86, .98));
    opacity(glow, .25 + .42 * phase(p,.15,.82));
  }
  function requestRender() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(render);
  }
  if (!reduced) {
    addEventListener('scroll', requestRender, {passive:true});
    addEventListener('resize', requestRender, {passive:true});
    render();
  }


})();


/* V8.52 — Scroll-controlled church → cutout type → ceremony details. */
(() => {
  const section=document.querySelector('.ceremony-cinema');
  if(!section)return;
  const hero=section.querySelector('.ceremony-cinema-hero');
  const art=section.querySelector('.ceremony-cinema-image');
  const word=section.querySelector('.ceremony-cinema-word');
  const wordText=section.querySelector('.ceremony-cinema-word span');
  const details=section.querySelector('.ceremony-cinema-details');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced)return;
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
  const phase=(p,a,b)=>ease((p-a)/(b-a));
  let queued=false;
  const update=()=>{
    queued=false;
    const rect=section.getBoundingClientRect();
    const max=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-rect.top/max);
    const entrance=phase(p,.01,.19);
    const shift=phase(p,.14,.62);
    const leave=phase(p,.50,.66);
    const reveal=phase(p,.59,.75)*(1-phase(p,.79,.95));
    const final=phase(p,.80,.975);
    hero.style.opacity=(entrance*(1-leave)).toFixed(4);
    art.style.setProperty('--church-rise',`${(58-65*shift).toFixed(2)}px`);
    art.style.setProperty('--church-rx',`${(8-7*shift).toFixed(2)}deg`);
    art.style.setProperty('--church-ry',`${(-8+11*shift).toFixed(2)}deg`);
    art.style.setProperty('--church-zoom',(.77+.26*shift).toFixed(4));
    word.style.opacity=reveal.toFixed(4);
    wordText.style.setProperty('--ceremony-word-scale',(.70+.44*phase(p,.57,.84)).toFixed(4));
    details.style.opacity=final.toFixed(4);
    details.style.pointerEvents=final>.85?'auto':'none';
  };
  const request=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request,{passive:true});
  update();
})();


/* V8.63 — One fixed ivory countdown sheet moves upward over the video.
   Text stays fixed inside the sheet. The film begins flush after Foreword. */
(() => {
  'use strict';
  const section = document.querySelector('.video-countdown-transition');
  if (!section) return;
  const sheet = section.querySelector('.countdown-timeless');
  const mobile = matchMedia('(max-width: 900px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = t => { t=clamp(t); return t*t*(3-2*t); };
  let framePending=false;

  function update() {
    framePending=false;
    if (!sheet || reduced.matches) return;
    const rect=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-rect.top/travel);
    if (mobile.matches) {
      const video=section.querySelector('.wedding-film');
      const videoHeight=video ? video.getBoundingClientRect().height : innerWidth*.74;
      // Initially the rounded sheet touches the bottom of the landscape film;
      // scrolling lifts the ENTIRE page, including its stationary typography.
      const rise=ease((p-.04)/.72);
      const initial=Math.max(0,videoHeight-12);
      sheet.style.setProperty('--panel-offset',`${(initial*(1-rise)).toFixed(2)}px`);
      sheet.style.setProperty('--countdown-shadow',`${(.12+.16*rise).toFixed(3)}`);
    } else {
      const reveal=ease((p-.28)/.47);
      sheet.style.setProperty('--countdown-rise',`${(105*(1-reveal)).toFixed(3)}%`);
      sheet.style.setProperty('--countdown-shadow',`${(.2+.28*Math.sin(Math.PI*reveal)).toFixed(3)}`);
    }
  }
  function request() {
    if(framePending)return;
    framePending=true;
    requestAnimationFrame(update);
  }
  if(!reduced.matches) {
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',request,{passive:true});
    mobile.addEventListener('change',request);
    update();
  }
})();

/* V8.59 — Straightforward MP4 playback.
   The MP4 is shipped with this package at assets/videos/wedding-film.mp4.
   No MOV fallback, no changing sources, no 12-second metadata timeout.
   All existing ring, foreword, countdown, and ceremony animations stay intact. */
(() => {
  'use strict';
  const section = document.querySelector('.video-countdown-transition');
  const video = document.getElementById('wedding-film');
  if (!section || !video) return;

  const playButton = section.querySelector('.film-play-button');
  const fallback = section.querySelector('.film-fallback-label');
  let inView = false;
  let attemptInProgress = false;
  let playbackFailed = false;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;

  function showPlayButton(show) {
    if (playButton) playButton.hidden = !show;
  }
  function showError(message) {
    playbackFailed = true;
    showPlayButton(false);
    if (fallback) {
      fallback.textContent = message;
      fallback.hidden = false;
    }
    console.warn('[Wedding video]', message);
  }
  function tryPlay() {
    if (!inView || playbackFailed || attemptInProgress || !video.paused) return;
    attemptInProgress = true;
    let promise;
    try { promise = video.play(); }
    catch (error) {
      attemptInProgress = false;
      showPlayButton(true);
      return;
    }
    if (promise && typeof promise.then === 'function') {
      promise.then(() => {
        attemptInProgress = false;
        showPlayButton(false);
      }).catch(error => {
        attemptInProgress = false;
        if (!inView || (error && error.name === 'AbortError')) return;
        if (error && error.name === 'NotSupportedError') {
          showError('This browser cannot decode the MP4. Please try Edge or Chrome.');
        } else {
          // Some browsers require a user tap even for muted autoplay.
          showPlayButton(true);
        }
      });
    } else {
      attemptInProgress = false;
      showPlayButton(false);
    }
  }
  video.addEventListener('playing', () => showPlayButton(false));
  video.addEventListener('error', () => {
    showError('The wedding video could not load. Check assets/videos/wedding-film.mp4.');
  });
  video.addEventListener('loadeddata', () => {
    if (fallback) fallback.hidden = true;
    if (inView) tryPlay();
  });
  if (playButton) {
    playButton.addEventListener('click', () => {
      inView = true;
      tryPlay();
    });
  }

  // Play when the film is actually on screen; pause when the countdown covers it.
  // IntersectionObserver avoids work on every scroll frame.
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const visible = entry.isIntersecting;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top / travel));
      const mobile = window.matchMedia('(max-width: 900px)').matches;
      const videoRect = video.getBoundingClientRect();
      inView = mobile
        ? visible && videoRect.bottom > 0 && videoRect.top < window.innerHeight
        : visible && p < .78;
      if (inView && !document.hidden) tryPlay();
      else {
        video.pause();
        showPlayButton(false);
      }
    }
  }, {threshold:0});
  observer.observe(section);

  let scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top / travel));
      const mobile = window.matchMedia('(max-width: 900px)').matches;
      const videoRect = video.getBoundingClientRect();
      const shouldPlay = mobile
        ? videoRect.bottom > 0 && videoRect.top < innerHeight
        : rect.top < innerHeight && rect.bottom > 0 && p < .78;
      if (shouldPlay !== inView) {
        inView = shouldPlay;
        if (shouldPlay && !document.hidden) tryPlay();
        else { video.pause(); showPlayButton(false); }
      }
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (inView) tryPlay();
  });
  onScroll();
})();



/* V8.62 — Four-link, compact persistent navigation.
   Home = film/countdown. Details = ceremony, save date, venue, attire.
   The header stays hidden throughout the original ring + Foreword scene. */
(() => {
  'use strict';
  const header = document.getElementById('site-header');
  const film = document.getElementById('film');
  const toggle = document.getElementById('site-menu-toggle');
  const nav = document.getElementById('site-navigation');
  const dropdown = document.getElementById('site-dropdown');
  if (!header || !film || !toggle || !nav || !dropdown) return;

  const allLinks = [...header.querySelectorAll('a[href^="#"]')];
  const mobile = matchMedia('(max-width: 900px)');
  const checkpoints = [
    ['film','film'],
    ['ceremony','details'],
    ['details','details'],
    ['venues','details'],
    ['what-to-wear','details'],
    ['entourage','entourage'],
    ['rsvp','rsvp']
  ];
  let menuOpen = false;
  let raf = 0;

  function setMenu(open) {
    menuOpen = Boolean(open && mobile.matches && header.classList.contains('is-visible'));
    header.classList.toggle('menu-open', menuOpen);
    toggle.setAttribute('aria-expanded', String(menuOpen));
    toggle.setAttribute('aria-label', menuOpen ? 'Close all sections' : 'Open all sections');
    dropdown.inert = !menuOpen;
  }

  function update() {
    raf = 0;
    // Show navigation only after the Save the Date sheet has fully risen.
    // The film stays distraction-free; the header persists for later pages.
    const sheet = film.querySelector('.countdown-interlude');
    const filmTop = film.getBoundingClientRect().top;
    const sheetTop = sheet ? sheet.getBoundingClientRect().top : Infinity;
    const visible = filmTop <= 0 && sheetTop <= 3;
    header.classList.toggle('is-visible', visible);
    header.classList.toggle('is-scrolled', visible && window.scrollY > film.offsetTop + 40);
    header.inert = !visible;
    if (!visible && menuOpen) setMenu(false);

    // Active white pill follows the section currently being viewed.
    const threshold = Math.max(header.offsetHeight + 12, innerHeight * .36);
    let current = 'film';
    for (const [sectionId, navId] of checkpoints) {
      const target = document.getElementById(sectionId);
      if (target && target.getBoundingClientRect().top <= threshold) current = navId;
    }
    for (const link of allLinks) {
      const active = link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function requestUpdate() {
    if (!raf) raf = requestAnimationFrame(update);
  }
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  header.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) setMenu(false);
  });
  document.addEventListener('pointerdown', event => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuOpen) {
      setMenu(false);
      toggle.focus();
    }
  });
  mobile.addEventListener('change', () => {setMenu(false);requestUpdate();});
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  setMenu(false);
  update();
})();


/* V8.64 — Load the couple's exact monogram when they place the PNG at
   assets/images/kc-monogram.png. Keep an accessible typographic fallback
   if that image isn't available; never substitute a fabricated logo. */
(() => {
  'use strict';
  const image = document.querySelector('.site-monogram');
  const brand = document.querySelector('.site-brand');
  if (!image || !brand) return;
  function loaded() {
    if (image.naturalWidth > 0) {
      image.hidden = false;
      brand.classList.add('has-monogram');
    }
  }
  function failed() {
    image.hidden = true;
    brand.classList.remove('has-monogram');
  }
  image.addEventListener('load', loaded);
  image.addEventListener('error', failed);
  if (image.complete) {
    if (image.naturalWidth) loaded(); else failed();
  }
})();



/* V8.75 — Spotify player stays embedded on Page 3. Its iframe is created
   once, never moved or destroyed, so audio can continue as guests scroll.
   Official Spotify IFrame API supplies pause/play for the tiny floating
   control when available. Spotify decides song/preview availability. */
(() => {
  'use strict';
  const PLAYLIST_ID = '6wj5VQjk7lsOiR09ja201V';
  const PLAYLIST_URI = `spotify:playlist:${PLAYLIST_ID}`;
  const open = document.getElementById('spotify-mini-open');
  const area = document.getElementById('spotify-inline-embed');
  const mount = document.getElementById('spotify-iframe-mount');
  const quick = document.getElementById('spotify-quick-control');
  const card = document.getElementById('spotify-playlist');
  if (!open || !area || !mount || !quick || !card) return;

  let controller = null;
  let started = false;
  let isPaused = true;
  let playerVisible = false;
  let opened = false;
  let apiRequested = false;
  let fallbackLoaded = false;

  const updateQuick = () => {
    // No floating UI while the inline Spotify player is visible, or before
    // the listener has actually started playback. The controller is needed
    // to provide an honest, functional pause/play button.
    quick.hidden = !started || !controller || playerVisible;
    quick.classList.toggle('is-paused', isPaused);
    quick.setAttribute('aria-label', isPaused ? 'Resume wedding playlist' : 'Pause wedding playlist');
    quick.title = isPaused ? 'Resume wedding playlist' : 'Pause wedding playlist';
    quick.setAttribute('aria-pressed', String(!isPaused));
  };

  // An iframe fallback remains usable if Spotify's control API is blocked.
  // It is never removed or replaced once mounted.
  function loadFallback() {
    if (controller || fallbackLoaded || mount.querySelector('iframe')) return;
    fallbackLoaded = true;
    const iframe = document.createElement('iframe');
    iframe.src = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;
    iframe.title = 'Our Wedding Playlist — Spotify';
    iframe.width = '100%';
    iframe.height = '152';
    iframe.loading = 'eager';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    mount.appendChild(iframe);
  }

  function createPlayer(API) {
    if (fallbackLoaded || controller || mount.querySelector('iframe')) return;
    API.createController(mount, {
      uri: PLAYLIST_URI,
      width: '100%',
      height: 152,
      theme: 0
    }, embedController => {
      controller = embedController;
      controller.addListener('playback_update', event => {
        const data = event && event.data ? event.data : {};
        if (typeof data.isPaused === 'boolean') {
          isPaused = data.isPaused;
          if (!isPaused) started = true;
          updateQuick();
        }
      });
      updateQuick();
    });
  }

  function requestSpotify() {
    if (apiRequested) return;
    apiRequested = true;
    // Spotify invokes this callback once the official API script is ready.
    window.onSpotifyIframeApiReady = API => {
      try { createPlayer(API); }
      catch (error) { loadFallback(); }
    };
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    script.onerror = loadFallback;
    document.head.appendChild(script);
    // Covers network filters that silently block the API script.
    window.setTimeout(() => { if (!controller && !mount.querySelector('iframe')) loadFallback(); }, 7000);
  }

  open.addEventListener('click', () => {
    if (opened) {
      area.scrollIntoView({behavior:'smooth',block:'nearest'});
      return;
    }
    opened = true;
    area.hidden = false;
    open.setAttribute('aria-expanded','true');
    open.innerHTML = '<span aria-hidden="true">♫</span> Playlist open';
    requestSpotify();
    updateQuick();
  });

  quick.addEventListener('click', () => {
    if (!controller) return;
    // togglePlay is the official controller method. The playback_update
    // event will sync the icon after Spotify confirms the change.
    controller.togglePlay();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      playerVisible = entries.some(entry => entry.isIntersecting);
      updateQuick();
    }, {threshold:0.25});
    observer.observe(card);
  } else {
    const onScroll = () => {
      const rect = card.getBoundingClientRect();
      playerVisible = rect.bottom > 0 && rect.top < innerHeight;
      updateQuick();
    };
    addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }
})();
