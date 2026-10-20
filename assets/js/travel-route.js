/* V9.12 — the original compact illustrated map, with an animated road route
   traced from the couple's screenshot and stylized to fit the artwork.
   The path and vehicle share the same position and timing. No map API. */
(() => {
  'use strict';
  const card = document.getElementById('venue-travel');
  if (!card) return;
  const svgs = [...card.querySelectorAll('.travel-route-svg')];
  const scenes = svgs.map(svg => {
    const path = svg.querySelector('defs > path[id$="-path"]');
    const line = svg.querySelector('.travel-route-draw');
    const vehicle = svg.querySelector('.travel-route-vehicle');
    if (!path || !line || !vehicle) return null;
    const length = path.getTotalLength();
    line.style.strokeDasharray = `${length} ${length}`;
    return {path,line,vehicle,length};
  }).filter(Boolean);
  if (!scenes.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 8400;
  let raf = 0;
  let start = 0;
  let inView = false;
  let progress = 0;
  function draw(fraction) {
    progress = Math.min(1,Math.max(0,fraction));
    for (const {path,line,vehicle,length} of scenes) {
      const distance = progress * length;
      line.style.strokeDashoffset = String(length-distance);
      const p = path.getPointAtLength(distance);
      vehicle.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    }
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function tick(now) {
    if (!start) start=now;
    const t=Math.min(1,(now-start)/duration);
    const ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    draw(ease);
    if(t<1) raf=requestAnimationFrame(tick);
    else raf=0;
  }
  function play() {
    stop(); start=0; draw(0);
    card.classList.add('travel-route-playing');
    if (reducedMotion) {draw(1);return;}
    raf=requestAnimationFrame(tick);
  }
  draw(reducedMotion?1:0);
  if (reducedMotion) return;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && !inView) {inView=true;play();}
        else if (!entry.isIntersecting && inView) {inView=false;stop();}
      }
    },{threshold:0.22});
    observer.observe(card);
  } else play();
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) stop();
    else if(inView && progress<1) play();
  });
  window.KCTravelRoute=Object.freeze({replay:play,getProgress:()=>Math.round(progress*100)});
})();
