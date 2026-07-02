(() => {
  const sky = document.getElementById('sky');
  const maxActive = 30;
  const spawnInterval = 650; // ms, densità media
  let active = 0;

  const sunflowerSVG = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g id="petals" fill="#f7d230">
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(0 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(30 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(60 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(90 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(120 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(150 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(180 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(210 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(240 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(270 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(300 50 50)"/>
      <ellipse cx="50" cy="18" rx="10" ry="18" transform="rotate(330 50 50)"/>
    </g>
    <circle cx="50" cy="50" r="14" fill="#a2541a" />
    <circle cx="50" cy="50" r="7" fill="#6b3f1a" />
  </svg>`;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rand(min, max){ return Math.random()*(max-min)+min }

  function createSunflower(){
    if(active >= maxActive) return;
    active++;

    const wrapper = document.createElement('div');
    wrapper.className = 'sunflower';

    const size = Math.round(rand(38,86));
    wrapper.style.width = size + 'px';
    wrapper.style.left = Math.random()*100 + '%';

    const fall = Math.round(rand(9,14)); // medium-low speed -> longer duration
    const sway = Math.round(rand(5,9));
    const rot = Math.round(rand(8,16));

    wrapper.style.setProperty('--fall-duration', fall + 's');
    wrapper.style.setProperty('--sway-duration', sway + 's');
    wrapper.style.setProperty('--rot-duration', rot + 's');

    const inner = document.createElement('div');
    inner.className = 'flower';
    inner.innerHTML = sunflowerSVG;
    wrapper.appendChild(inner);

    // allow pointer interactions on wrappers
    wrapper.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      explode(wrapper);
    });

    // clean up when fall animation ends
    wrapper.addEventListener('animationend', (ev) => {
      if(ev.animationName === 'fall'){
        wrapper.remove();
        active = Math.max(0, active-1);
      }
    });

    // If reduced motion, don't animate — place them sparsely and let them fade slowly
    if(prefersReduced){
      wrapper.style.opacity = '0.95';
      wrapper.style.top = (rand(0,60)) + 'vh';
      wrapper.style.transition = 'opacity 6s linear';
      sky.appendChild(wrapper);
      setTimeout(()=>{ wrapper.style.opacity = '0'; wrapper.remove(); active = Math.max(0, active-1); }, 8000);
      return;
    }

    sky.appendChild(wrapper);
  }

  function explode(node){
    const rect = node.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const petals = 10;
    for(let i=0;i<petals;i++){
      const p = document.createElement('div');
      p.className = 'petal';
      const s = rand(6,14);
      p.style.width = s + 'px';
      p.style.height = (s*0.6) + 'px';
      p.style.left = (cx - s/2) + 'px';
      p.style.top = (cy - s/2) + 'px';
      p.style.background = (Math.random()>.6) ? 'var(--sunflower)' : 'var(--ochre)';
      p.style.border = '1px solid rgba(0,0,0,0.06)';
      p.style.zIndex = 3;
      p.style.position = 'fixed';
      p.style.opacity = '1';

      sky.appendChild(p);

      // animate using rAF and CSS transitions
      const angle = rand(0, Math.PI*2);
      const dist = rand(30,120);
      const dx = Math.cos(angle)*dist;
      const dy = Math.sin(angle)*dist;
      p.animate([
        { transform: 'translate(0,0) scale(1)', opacity:1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${rand(0.6,1.4)})`, opacity:0 }
      ], { duration: 700+Math.random()*500, easing: 'cubic-bezier(.1,.8,.2,1)' });

      setTimeout(()=> p.remove(), 1400);
    }

    // remove the flower immediately
    node.remove();
    active = Math.max(0, active-1);
  }

  // spawn loop
  const spawner = setInterval(createSunflower, spawnInterval);

  // stop spawning when page hidden to be polite
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden) clearInterval(spawner);
  });

  // initial burst
  for(let i=0;i<6;i++) setTimeout(createSunflower, i*200);

})();
