(() => {
  const sky = document.getElementById('sky');
  const message = document.querySelector('.message');
  const messages = [
    'sei la persona più preziosa che ho\n(clicca per continuare)',
    'ti voglio più bene di quanto tu possa immaginare\n(clicca per continuare)',
    'anche se a volte sono un po\' coglione e sbaglio\n(clicca per continuare)',
    'ti va di fare qualcosa insieme sta sera?'
  ];
  let currentMessage = 0;
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

  if (message) {
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    message.after(actions);

    let messageState = 'normal';

    const clearActions = () => {
      actions.innerHTML = '';
      actions.removeAttribute('data-phase');
      actions.classList.remove('has-actions');
    };

    const renderMessage = (text, state = 'normal') => {
      messageState = state;
      clearActions();
      message.classList.remove('is-appearing');
      void message.offsetWidth;
      message.textContent = text;
      message.classList.add('is-appearing');
    };

    const showMessage = (index) => {
      currentMessage = index;
      renderMessage(messages[currentMessage], 'normal');
    };

    const showAnswerButtons = () => {
      if (messageState === 'awaitingResponse') return;
      messageState = 'awaitingResponse';
      clearActions();
      actions.dataset.phase = 'choices';
      actions.classList.add('has-actions');

      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'button-group';

      const yesButton = document.createElement('button');
      yesButton.type = 'button';
      yesButton.textContent = 'Sì';
      yesButton.addEventListener('click', showYesResponse);

      const noButton = document.createElement('button');
      noButton.type = 'button';
      noButton.textContent = 'No';
      noButton.addEventListener('click', showNoResponse);

      buttonGroup.append(noButton, yesButton);
      actions.append(buttonGroup);
      yesButton.focus();
    };

    const showNoResponse = () => {
      renderMessage('ah... va bene non fa niente, sarà per la prossima volta', 'done');
    };

    const showYesResponse = () => {
      renderMessage('yeeee, cosa vuoi fare? e a che ora?\n(inserisci le risposte qui sotto)', 'done');
      showResponseFields();
    };

    const showResponseFields = () => {
      clearActions();
      actions.dataset.phase = 'response';
      actions.classList.add('has-actions');

      const timeLabel = document.createElement('label');
      timeLabel.textContent = 'Orario';
      const timeSelect = document.createElement('select');
      timeSelect.name = 'meeting-time';
      ['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00'].forEach((time) => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.append(option);
      });
      timeLabel.appendChild(timeSelect);

      const responseLabel = document.createElement('label');
      responseLabel.textContent = 'Risposta';
      const responseInput = document.createElement('input');
      responseInput.type = 'text';
      responseInput.name = 'meeting-response';
      responseInput.placeholder = 'Inserisci qui la tua risposta';
      responseInput.autocomplete = 'off';
      responseLabel.appendChild(responseInput);

      const submitButton = document.createElement('button');
      submitButton.type = 'button';
      submitButton.textContent = 'Invia';
      submitButton.className = 'submit-response';
      submitButton.addEventListener('click', () => submitResponse(timeSelect, responseInput, submitButton));

      actions.append(timeLabel, responseLabel, submitButton);
      responseInput.focus();
    };

    const submitResponse = (timeSelect, responseInput, submitButton) => {
      const answer = responseInput.value.trim();
      const time = timeSelect.value;

      if (!answer) {
        responseInput.focus();
        responseInput.setCustomValidity('Per favore inserisci la tua risposta');
        responseInput.reportValidity();
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Invio in corso...';

      fetch('https://formspree.io/f/mdaqdqpv', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'ora': time,
          'attività': answer
        })
      })
      .then((response) => {
        if (!response.ok) throw new Error('Errore invio');
        return response.json();
      })
      .then(() => {
        renderMessage('Grazieeeee! ci sentiamo sta sera :D', 'done');
      })
      .catch(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Invia';
        renderMessage('Qualcosa è andato storto. Riprova tra un momento.', 'done');
      });
    };

    const advanceMessage = () => {
      showMessage((currentMessage + 1) % messages.length);
    };

    const handleMessageActivation = () => {
      if (currentMessage === messages.length - 1 && messageState === 'normal') {
        showAnswerButtons();
        return;
      }
      if (messageState === 'awaitingResponse') return;
      advanceMessage();
    };

    showMessage(0);

    message.addEventListener('click', handleMessageActivation);
    message.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleMessageActivation();
      }
    });
  }

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
