/* L3x · main.js — animación, navegación y transición de página en JS vanilla, sin dependencias. */
(() => {
  const root = document.documentElement;
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const curtain = document.querySelector('.curtain');
  const label = curtain && curtain.querySelector('.curtain-label');
  // Contenedores .reveal cuyos hijos entran escalonados (stagger) en vez de aparecer en bloque.
  const STAGGER = '.hero-copy,.narrow,.section-heading,.content-stack,.cta-grid,.service-grid,.feature-grid,.process-grid,.check-grid,.language-grid,.faq-list,.link-list,.skill-rows,.timeline,.activity';
  const NAMES = { '': 'L3x', 'index.html': 'L3x', 'sobre-l3x.html': 'Sobre mí', 'habilidades.html': 'Habilidades', 'formacion.html': 'Formación', 'proyectos.html': 'Proyectos', 'experiencia.html': 'Experiencia', 'contacto.html': 'Contacto', 'recursos.html': 'FAQ', 'servicios.html': 'Experiencia' };

  /* 1 · Preparación: titulares por palabra (entrada enmascarada) y stagger */
  $$('h1,h2').forEach((h) => {
    const text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.textContent = '';
    text.split(/\s+/).forEach((word, i) => {
      const mask = document.createElement('span');
      const inner = document.createElement('span');
      mask.className = 'w';
      mask.setAttribute('aria-hidden', 'true');
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      mask.append(inner);
      h.append(mask, ' ');
    });
  });
  $$('.reveal').filter((el) => el.matches(STAGGER)).forEach((el) => {
    el.dataset.stagger = '';
    [...el.children].forEach((child, i) => child.style.setProperty('--i', i));
  });

  /* 2 · Entrada de página y revelado al hacer scroll */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  const start = () => {
    root.classList.add('is-ready');
    setTimeout(() => $$('.reveal').forEach((el) => io.observe(el)), reduce ? 0 : 400);
  };
  const intro = root.classList.contains('is-intro') && !reduce;
  const loader = document.querySelector('.loader');
  const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  const fonts = Promise.race([document.fonts && document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]);

  /* Sonido (assets/audio/loading.mp3)
     · Se intenta reproducir al entrar (primera visita de la sesión).
     · Si el navegador lo bloquea, queda en espera y arranca con la primera interacción, sin errores ni cortes.
     · El control flotante permite pausar, reanudar y silenciar; el silencio se recuerda en localStorage. */
  const SOUND_S = 3.8; // duración de loading.mp3 en segundos
  // Envolvente de volumen de loading.mp3 (48 tramos). Si cambias el audio, hay que regenerarla.
  const WAVE = [0.40,0.57,0.62,0.77,0.85,0.86,0.95,0.92,0.98,0.92,0.90,0.94,0.92,1.00,0.89,0.89,1.00,0.94,0.86,0.95,0.91,0.93,0.95,0.90,0.98,0.94,0.93,0.94,0.91,0.88,0.40,0.15,0.24,0.35,0.45,0.49,0.56,0.63,0.72,0.80,0.87,0.97,0.36,0.00,0.00,0.00,0.00,0.00];
  let T = 0; // duración de la línea de tiempo de la pantalla de carga (s)
  let tRun = 0; // instante en que arrancó
  let synced = false;
  let fx = null;
  let muted = false;
  try { muted = localStorage.getItem('l3x-sound') === 'off'; } catch (e) { /* sin almacenamiento */ }
  root.dataset.sound = 'idle'; // idle | playing | paused | pending (autoplay bloqueado, a la espera de interacción)
  root.classList.toggle('sound-muted', muted);
  const ui = document.createElement('div');
  ui.className = 'sound';
  ui.setAttribute('role', 'group');
  ui.setAttribute('aria-label', 'Sonido');
  ui.innerHTML = '<button type="button" class="sound-btn" data-sound-act="toggle"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg></button>'
    + '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>'
    + '<span class="sound-label" aria-hidden="true">Pulsa para activar el sonido</span>'
    + '<button type="button" class="sound-btn" data-sound-act="mute"><svg class="i-vol" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11" fill="none"/></svg><svg class="i-mute" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9.5l4 5M21 9.5l-4 5" fill="none"/></svg></button>';
  document.body.append(ui);
  // La barra de progreso de la pantalla de carga es la forma de onda del audio: cada barra se enciende en el
  // instante en que suena ese fragmento (misma línea de tiempo que el audio, no un temporizador aparte).
  const bar = loader && loader.querySelector('.ld-bar');
  if (bar) {
    bar.replaceChildren(...WAVE.map((h, i) => {
      const tick = document.createElement('i');
      tick.style.setProperty('--h', h);
      tick.style.setProperty('--k', (i / WAVE.length).toFixed(3));
      return tick;
    }));
  }
  const run = (seconds) => { // arranca la línea de tiempo de la pantalla de carga
    if (!loader || loader.classList.contains('is-run')) return;
    T = seconds;
    tRun = performance.now();
    loader.style.setProperty('--ld-t', seconds + 's');
    loader.classList.add('is-run');
  };
  const snd = document.createElement('button'); // lectura del sonido dentro de la propia pantalla de carga
  snd.type = 'button';
  snd.className = 'ld-snd';
  snd.tabIndex = -1;
  snd.innerHTML = '<i></i><span></span>';
  if (loader) loader.querySelector('.ld-center').append(snd);
  const syncUI = () => {
    const [toggleBtn, muteBtn] = ui.querySelectorAll('.sound-btn');
    toggleBtn.setAttribute('aria-label', root.dataset.sound === 'playing' ? 'Pausar sonido' : 'Reproducir sonido');
    muteBtn.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar sonido');
    muteBtn.setAttribute('aria-pressed', String(muted));
    snd.lastChild.textContent = muted ? 'Sonido silenciado · Activar' : ({ playing: 'Sonido activo · Silenciar', pending: 'Pulsa para activar el sonido', paused: 'Sonido en pausa · Reanudar' }[root.dataset.sound] || '');
  };
  const setSound = (state) => { root.dataset.sound = state; syncUI(); };
  const EVENTS = ['pointerdown', 'pointerup', 'click', 'touchend', 'keydown'];
  const unlock = (e) => {
    if (muted || (e.target.closest && e.target.closest('a[href], .sound, .ld-snd'))) return; // ni el silencio, ni los enlaces, ni el propio control
    play();
  };
  const arm = () => EVENTS.forEach((ev) => addEventListener(ev, unlock, true));
  const disarm = () => EVENTS.forEach((ev) => removeEventListener(ev, unlock, true));
  const getFx = () => {
    if (!fx) {
      fx = new Audio('assets/audio/loading.mp3');
      fx.preload = 'auto';
      fx.volume = 0.8;
      fx.addEventListener('playing', () => {
        setSound('playing');
        disarm();
        if (!synced && tRun && !root.classList.contains('is-ready')) { // si llega tarde, se une en sincronía con la barra
          const elapsed = (performance.now() - tRun) / 1000;
          if (elapsed - fx.currentTime > 0.3) fx.currentTime = Math.min(elapsed, (fx.duration || SOUND_S) - 0.25);
        }
        synced = true;
      });
      fx.addEventListener('pause', () => setSound('paused'));
      fx.addEventListener('ended', () => setSound('paused'));
    }
    fx.muted = muted;
    return fx;
  };
  const play = () => {
    const audio = getFx();
    if (audio.ended) audio.currentTime = 0;
    return audio.play().then(() => 'ok', (err) => {
      if (err && err.name === 'NotAllowedError') return 'blocked';
      ui.hidden = true; // archivo ausente o formato no compatible: se oculta el control, sin avisos
      disarm();
      return 'error';
    });
  };
  const setMuted = (value) => {
    muted = value;
    if (fx) fx.muted = value;
    root.classList.toggle('sound-muted', value);
    try { localStorage.setItem('l3x-sound', value ? 'off' : 'on'); } catch (e) { /* sin almacenamiento */ }
    syncUI();
    if (!value && (!fx || fx.paused || fx.ended)) play();
  };
  ui.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sound-act]');
    if (!btn) return;
    if (btn.dataset.soundAct === 'mute') return setMuted(!muted);
    if (muted) return setMuted(false);
    const audio = getFx();
    if (audio.paused || audio.ended) play(); else audio.pause();
  });
  snd.addEventListener('click', () => {
    if (muted) setMuted(false);
    else if (root.dataset.sound === 'playing') setMuted(true);
    else play();
  });
  syncUI();
  if (intro && !muted) {
    play().then((result) => {
      run(result === 'error' ? 1.4 : (fx.duration || SOUND_S));
      if (result === 'blocked') { setSound('pending'); arm(); }
    });
  }
  setTimeout(() => run(muted ? 1.4 : SOUND_S), 400); // por si el navegador tarda en responder
  setTimeout(() => ui.classList.add('is-quiet'), 7000); // el aviso se recoge solo; el control sigue visible
  const stopSound = () => { // si aún suena al retirarse la pantalla de carga: se desvanece y se detiene
    if (!fx || fx.paused || fx.ended) return;
    const t0 = performance.now();
    const v0 = fx.volume;
    const fade = (now) => {
      const k = Math.min(1, (now - t0) / 500);
      fx.volume = v0 * (1 - k);
      if (k < 1) requestAnimationFrame(fade); else { fx.pause(); fx.volume = v0; }
    };
    requestAnimationFrame(fade);
  };

  const ready = async () => {
    await (intro ? Promise.all([loaded, fonts, new Promise((r) => setTimeout(r, 450))]) : fonts);
    if (intro && tRun) { // la pantalla de carga dura lo que la línea de tiempo del audio
      const left = tRun + (T - 0.25) * 1000 - performance.now();
      if (left > 0) await new Promise((r) => setTimeout(r, left));
    }
    // si el sonido sigue sonando (salvo su cola final), se espera a que termine
    if (fx && !fx.paused && !fx.ended && fx.duration - fx.currentTime > 0.5) await new Promise((r) => { fx.addEventListener('ended', r, { once: true }); setTimeout(r, 3600); });
  };
  // La pantalla de carga se retira cuando la página, las fuentes y el audio han terminado (tope de seguridad: 5,5 s).
  Promise.race([ready(), new Promise((r) => setTimeout(r, 5500))]).then(() => {
    if (intro && loader) loader.classList.add('is-done');
    setTimeout(() => { stopSound(); start(); }, intro ? 350 : 60);
  });

  /* 3 · Navegación: estado sticky, menú móvil accesible */
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('main-menu');
  if (toggle && menu) {
    $$('li', menu).forEach((li, i) => li.style.setProperty('--i', i));
    var setMenu = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    matchMedia('(min-width: 1001px)').addEventListener('change', (e) => e.matches && setMenu(false));
  }

  /* 4 · Scroll: cabecera compacta y parallax sutil (un único listener, throttled con rAF) */
  const hero = document.querySelector('.hero, .page-hero');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (hero && !reduce && y < innerHeight * 1.3) hero.style.setProperty('--sy', y);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* 5 · Foco de luz que sigue al puntero (solo dispositivos con ratón) */
  if (hero && !reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let frame = 0;
    hero.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', e.clientX - r.left + 'px');
        hero.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
  }

  /* 6 · Banda de servicios en bucle */
  const strip = document.querySelector('.signal-grid');
  if (strip && !reduce) {
    [...strip.children].forEach((c) => { const copy = c.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); strip.append(copy); });
    strip.classList.add('is-loop');
  }

  /* 7 · FAQ: apertura y cierre animados */
  $$('details').forEach((d) => {
    const sum = d.querySelector('summary');
    d.classList.toggle('is-open', d.open);
    sum.addEventListener('click', (e) => {
      if (reduce) return;
      e.preventDefault();
      if (d.anim) return;
      const from = d.offsetHeight;
      const closing = d.open;
      if (!closing) d.open = true;
      d.classList.toggle('is-open', !closing);
      const to = closing ? sum.offsetHeight : d.scrollHeight;
      d.anim = d.animate({ height: [from + 'px', to + 'px'] }, { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
      d.anim.onfinish = () => { if (closing) d.open = false; d.anim = null; };
    });
  });

  /* 8 · Transición entre páginas: cortinilla que sube al salir y se retira al entrar */
  addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !curtain || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.href === location.href || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    if (typeof setMenu === 'function') setMenu(false);
    label.textContent = NAMES[url.pathname.split('/').pop()] || 'L3x';
    curtain.style.transition = 'none';
    curtain.style.transform = 'translateY(100%)';
    curtain.offsetHeight; // fuerza reflow para que la animación parta desde abajo
    curtain.style.transition = 'transform .65s cubic-bezier(.76,0,.24,1)';
    curtain.style.transform = 'translateY(0)';
    setTimeout(() => { location.href = url.href; }, 650);
  });
  addEventListener('pageshow', (e) => { if (e.persisted && curtain) { curtain.style.cssText = ''; root.classList.add('is-ready'); } });

  /* 9 · Modo claro / oscuro: el atributo inicial lo fija un script en <head> (sin parpadeo); aquí se gestiona el botón */
  const themeBtn = document.querySelector('.theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (mode) => {
    root.dataset.theme = mode;
    if (metaTheme) metaTheme.content = mode === 'light' ? '#ffffff' : '#070707';
    if (themeBtn) themeBtn.setAttribute('aria-label', mode === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  };
  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.classList.add('theme-anim');
    applyTheme(next);
    try { localStorage.setItem('l3x-theme', next); } catch (e) { /* almacenamiento no disponible */ }
    setTimeout(() => root.classList.remove('theme-anim'), 600);
  });
  addEventListener('storage', (e) => { if (e.key === 'l3x-theme') applyTheme(e.newValue === 'light' ? 'light' : 'dark'); });

  $$('[data-year]').forEach((n) => { n.textContent = new Date().getFullYear(); });
})();
