/* V8.39 — naturally varied overlapping ink stains; ring and cover unchanged. */
(() => {
  const svg=document.querySelector('.ink-signature');
  if(!svg)return;
  const NS='http://www.w3.org/2000/svg';
  const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
  svg.setAttribute('viewBox','0 0 900 260');svg.replaceChildren();
  const ink='#485a40', glyphs=[], splashes=[];
  // Ink is confined to the handwritten note, not the invitation background.
  // Organic blots are soft-edged, asymmetric liquid stains, not pointed polygons.
  const random=(seed)=>{const x=Math.sin(seed*127.1+78.233)*43758.5453;return x-Math.floor(x);};
  const note=document.querySelector('.handwritten-names');
  const oldPaper=document.querySelector('.paper-ink-splashes');
  if(oldPaper)oldPaper.remove();
  const splashCanvas=make('svg',{'class':'signature-ink-splashes',viewBox:'0 0 900 260',preserveAspectRatio:'xMidYMid meet','aria-hidden':'true'});
  if(note)note.appendChild(splashCanvas);
  const defs=make('defs');
  const soft=make('filter',{id:'signature-ink-soften',x:'-35%',y:'-35%',width:'170%',height:'170%'});
  soft.appendChild(make('feGaussianBlur',{stdDeviation:'0.9'}));
  defs.appendChild(soft);splashCanvas.appendChild(defs);
  // Organic, asymmetrical clusters: a few broad absorbed pools, smaller stains,
  // and occasional overlapping wet marks. No evenly spaced dot pattern.
  const clusters=[
    {x:597,y:112,r:17,line:0,position:.25,opacity:.35},
    {x:616,y:119,r:9,line:0,position:.30,opacity:.27},
    {x:842,y:123,r:5,line:0,position:.85,opacity:.29},
    {x:167,y:168,r:6,line:1,position:.07,opacity:.32},
    {x:279,y:230,r:21,line:1,position:.24,opacity:.39},
    {x:293,y:235,r:10,line:1,position:.28,opacity:.30},
    {x:468,y:241,r:4,line:1,position:.47,opacity:.26},
    {x:665,y:226,r:15,line:1,position:.74,opacity:.38},
    {x:678,y:234,r:7,line:1,position:.77,opacity:.29},
    {x:861,y:164,r:11,line:1,position:.96,opacity:.34}
  ];
  clusters.forEach(({x:cx,y:cy,r:base,line,position,opacity},i)=>{
    const x=cx+(random(i*41+3)-.5)*13;
    const y=cy+(random(i*37+9)-.5)*13;
    const r=base*(.82+random(i*19+7)*.39);
    const g=make('g',{'class':'signature-ink-blot',transform:`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${Math.round(random(i*13+8)*360)})`});
    g.style.setProperty('opacity','0','important');
    const n=18,coords=[];
    for(let j=0;j<n;j++){
      const a=j*2*Math.PI/n;
      const radius=r*(.79+random(i*137+j*23+11)*.40);
      coords.push([Math.cos(a)*radius,Math.sin(a)*radius*(.75+random(i*31+j*7)*.45)]);
    }
    const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
    const first=mid(coords[n-1],coords[0]);
    let d=`M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`;
    for(let j=0;j<n;j++){
      const next=mid(coords[j],coords[(j+1)%n]);
      d+=` Q ${coords[j][0].toFixed(2)} ${coords[j][1].toFixed(2)} ${next[0].toFixed(2)} ${next[1].toFixed(2)}`;
    }
    d+=' Z';
    // A dark uneven center with a translucent bleed halo; overlapping shapes
    // naturally become darker because they are rendered separately.
    g.appendChild(make('path',{d,fill:ink,opacity:opacity.toFixed(3),filter:'url(#signature-ink-soften)'}));
    g.appendChild(make('ellipse',{
      cx:(r*.08).toFixed(2),cy:(r*.12).toFixed(2),
      rx:(r*.72).toFixed(2),ry:(r*.55).toFixed(2),
      fill:ink,opacity:(opacity*.25).toFixed(3),filter:'url(#signature-ink-soften)'
    }));
    // Only occasional tiny satellite droplets, never identical rings of dots.
    const drops=base>=15?3:base>=9?2:1;
    for(let j=0;j<drops;j++){
      const a=random(i*83+j*17+1)*Math.PI*2;
      const distance=r*(1.10+random(i*47+j*9+5)*.83);
      const size=.55+random(i*19+j*31+8)*(base>=15?2.9:1.7);
      g.appendChild(make('ellipse',{
        cx:(Math.cos(a)*distance).toFixed(2),cy:(Math.sin(a)*distance).toFixed(2),
        rx:size.toFixed(2),ry:(size*(.65+random(i*71+j+4)*.65)).toFixed(2),
        fill:ink,opacity:(opacity*.68).toFixed(3),filter:'url(#signature-ink-soften)'
      }));
    }
    splashCanvas.appendChild(g);
    splashes.push({node:g,line,position,start:0,duration:.023+random(i*29+12)*.035});
  });
  const lines=[{content:'love lots,',y:88,fontSize:68,index:0},{content:'Kenneth & Catherine',y:193,fontSize:84,index:1}];
  function build(){
    glyphs.length=0;svg.querySelectorAll('.signature-line').forEach(e=>e.remove());
    const ctx=document.createElement('canvas').getContext('2d');
    lines.forEach(({content,y,fontSize,index})=>{
      const group=make('g',{'class':'signature-line'});svg.appendChild(group);
      ctx.font=`${fontSize}px Allura, "URW Chancery L", cursive`;
      const letters=[...content],widths=letters.map(c=>ctx.measureText(c).width);
      const advances=widths.map((w,i)=>w*(letters[i]===' '? .9:.94));
      const total=advances.reduce((a,b)=>a+b,0),fit=Math.min(1,620/Math.max(total,1));
      let x=0;group.setAttribute('transform',`translate(${(855-total*fit).toFixed(2)} 0) scale(${fit.toFixed(5)} 1)`);
      letters.forEach((letter,i)=>{
        const v=random(i*19+index*47+1),v2=random(i*31+index*59+3);
        const rise=(v-.5)*3.1,angle=(v2-.5)*5.0;
        const skew=(random(i*43+index*11+6)-.5)*3.4;
        const node=make('text',{x:x.toFixed(2),y:(y+rise).toFixed(2),'class':'signature-glyph','font-size':fontSize,transform:`rotate(${angle.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}) skewX(${skew.toFixed(2)})`});
        node.textContent=letter;group.appendChild(node);
        if(letter.trim())glyphs.push({node,weight:Math.max(8,widths[i])});
        x+=advances[i];
      });
    });
  }
  // Match the splash to the real handwriting progress (measured glyph widths),
  // so changes in font loading also update the timing consistently.
  function syncSplashTiming(){
    const firstLineLetters=[...'love lots,'].filter(c=>c.trim()).length;
    const firstWeight=glyphs.slice(0,firstLineLetters).reduce((a,g)=>a+g.weight,0);
    const allWeight=glyphs.reduce((a,g)=>a+g.weight,0)||1;
    const split=firstWeight/allWeight;
    splashes.forEach((s,i)=>{
      const within=s.line===0 ? split*s.position : split+(1-split)*s.position;
      s.start=Math.max(.02,Math.min(.965,within+(random(i*59+23)-.5)*.027));
    });
  }
  let currentProgress=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.updateWeddingSignature=(progress)=>{
    currentProgress=Math.max(0,Math.min(1,progress));
    const t=reduced?1:currentProgress,total=glyphs.reduce((a,c)=>a+c.weight,0);
    let previous=0;
    glyphs.forEach(({node,weight})=>{
      const f=Math.max(0,Math.min(1,(t*total-previous)/weight));
      node.style.strokeDasharray='230 230';node.style.strokeDashoffset=String(230*(1-f));
      node.style.strokeOpacity=String(Math.min(1,f*2.7));
      node.style.fillOpacity=String(Math.max(0,Math.min(1,(f-.45)/.55)));
      previous+=weight;
    });
    splashes.forEach(({node,start,duration})=>{
      const f=Math.max(0,Math.min(1,(t-start)/duration));
      // Preserve the SVG translate/rotate positioning. CSS transform here would
      // collapse every ink mark toward the SVG origin on some browsers.
      node.style.setProperty('opacity',f.toFixed(3),'important');
    });
  };
  build();syncSplashTiming();window.updateWeddingSignature(0);
  if(document.fonts?.load){document.fonts.load('84px Allura').then(()=>{build();syncSplashTiming();window.updateWeddingSignature(currentProgress);}).catch(()=>{});}
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
    values.forEach((v, i) => { elements[i].textContent = String(v).padStart(i === 0 ? 3 : 2, "0"); });
    const seeYou=document.getElementById("see-you-days");
    if(seeYou)seeYou.textContent=String(values[0]);
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
    drawSignature(phase(p, .941, .998));
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

  // The original V8.48 countdown function updates the real numbers once per
  // second. Observe only changes to these text nodes and give each changed
  // value a restrained ink-like crossfade; never interfere with its values.
  if (reduced || !('MutationObserver' in window)) return;
  const values = [...section.querySelectorAll('.timeless-value')];
  const observer = new MutationObserver(records => {
    const changed = new Set();
    for (const record of records) {
      const number = record.target.nodeType === 3
        ? record.target.parentElement : record.target;
      if (number && number.matches && number.matches('.timeless-value')) changed.add(number);
    }
    // Never animate initial hidden numbers or offscreen values.
    if (section.getBoundingClientRect().bottom <= 0 ||
        section.getBoundingClientRect().top >= window.innerHeight) return;
    for (const number of changed) {
      if (getComputedStyle(number.parentElement).opacity === '0') continue;
      number.classList.remove('is-ticking');
      void number.offsetWidth; // restart only this digit's gentle crossfade
      number.classList.add('is-ticking');
    }
  });
  for (const number of values) {
    observer.observe(number, {childList:true,characterData:true,subtree:true});
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
    // Show navigation only after the countdown sheet has fully risen.
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


/* V8.65 — Optional, user-initiated wedding music.
   The copyrighted song is not included; add a licensed local MP3 at the
   path in index.html. Browser autoplay rules are respected. */
(() => {
  'use strict';
  const player = document.getElementById('foreword-music');
  const button = document.getElementById('foreword-music-toggle');
  const audio = document.getElementById('foreword-audio');
  const feedback = document.getElementById('foreword-music-feedback');
  if (!player || !button || !audio) return;

  function update() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + ' I Get to Love You by Ruelle');
    const kicker = player.querySelector('.foreword-music-kicker');
    if (kicker) kicker.textContent = playing ? 'OUR SONG · NOW PLAYING' : 'OUR SONG · TAP TO LISTEN';
  }

  button.addEventListener('click', async () => {
    if (!audio.paused) {
      audio.pause();
      if (feedback) feedback.textContent = '';
      return;
    }
    if (feedback) feedback.textContent = '';
    try {
      await audio.play();
    } catch (error) {
      if (feedback) feedback.textContent = 'Add your licensed MP3 to assets/audio/i-get-to-love-you-ruelle.mp3 to play this song.';
      update();
    }
  });
  audio.addEventListener('playing', update);
  audio.addEventListener('pause', update);
  audio.addEventListener('ended', update);
  audio.addEventListener('error', () => {
    if (feedback) feedback.textContent = 'Music file not found. Add your licensed MP3 to assets/audio/i-get-to-love-you-ruelle.mp3.';
    update();
  });
  update();
})();
