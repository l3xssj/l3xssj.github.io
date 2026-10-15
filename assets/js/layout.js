/* L3x · componentes compartidos: cortinilla, pantalla de carga, cabecera y pie de página.
   Para añadir una página al menú basta con editar PAGES: se actualiza en todo el sitio. */
(() => {
  const PAGES = [ // [id de página, archivo, texto del menú, texto de la cortinilla]
    ['inicio', 'index.html', 'Inicio', 'L3x'],
    ['sobre', 'sobre-l3x.html', 'Sobre mí', 'Sobre mí'],
    ['habilidades', 'habilidades.html', 'Habilidades', 'Habilidades'],
    ['formacion', 'formacion.html', 'Formación', 'Formación'],
    ['proyectos', 'proyectos.html', 'Proyectos', 'Proyectos'],
    ['experiencia', 'experiencia.html', 'Experiencia', 'Experiencia'],
    ['contacto', 'contacto.html', 'Contacto', 'Contacto'], // la última se muestra como botón destacado
  ];
  const LINKEDIN = 'https://www.linkedin.com/in/alex-gonz%C3%A1lez-martos-838162229/';
  const EXT = 'target="_blank" rel="noopener noreferrer"';
  const page = document.body.dataset.page || '';
  const names = { '': 'L3x', 'recursos.html': 'FAQ', 'servicios.html': 'Experiencia' };
  PAGES.forEach(([, file, , curtain]) => { names[file] = curtain; });
  const here = PAGES.find(([id]) => id === page);
  const curtainText = here ? here[3] : (names[page + '.html'] || 'L3x');
  const current = (id) => (id === page ? ' aria-current="page"' : '');
  const item = ([id, file, label]) => `<li><a href="${file}"${current(id)}>${label}</a></li>`;
  const cta = PAGES[PAGES.length - 1];

  const curtain = `<div class="curtain" aria-hidden="true"><span class="curtain-label">${curtainText}</span></div>`;
  const loader = `<div class="loader" aria-hidden="true">
    <span class="ld-corner tl"></span><span class="ld-corner tr"></span><span class="ld-corner bl"></span><span class="ld-corner br"></span>
    <span class="ld-tech tl">L3x / Portfolio</span><span class="ld-tech tr">Alex González Martos</span>
    <span class="ld-tech bl">Informática · Audiovisual</span><span class="ld-tech br">ES / CA / EN B2</span>
    <div class="ld-center">
      <div class="ld-mark"><span>L3x</span></div>
      <p class="ld-init"><i></i>Iniciando entorno</p>
      <div class="ld-row"><div class="ld-bar"></div><span class="ld-pct"></span></div>
    </div>
  </div>`;
  const header = `<header class="site-header">
    <nav class="nav" aria-label="Navegación principal">
      <a class="brand" href="index.html" aria-label="Inicio de Lex"><span class="brand-mark">L3x</span><span class="brand-copy"><strong>Lex</strong><small>Alex González Martos</small></span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-menu" aria-label="Abrir menú"><span></span><span></span><span></span></button>
      <ul class="nav-links" id="main-menu">${PAGES.slice(0, -1).map(item).join('')}<li><a class="nav-cta" href="${cta[1]}"${current(cta[0])}>${cta[2]}</a></li></ul>
      <button class="theme-toggle" type="button" aria-label="Cambiar a modo claro"><svg viewBox="0 0 24 24" aria-hidden="true"><g class="i-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></g><path class="i-moon" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></button>
    </nav>
  </header>`;
  const footer = `<footer class="site-footer">
    <div class="container footer-grid">
      <div><strong>L3x</strong><p>Informática, audiovisual y proyectos digitales.</p></div>
      <nav aria-label="Navegación secundaria">
        ${PAGES.map(([, file, label]) => `<a href="${file}">${label}</a>`).join('')}
        <a href="recursos.html">FAQ y recursos</a>
        <a href="${LINKEDIN}" ${EXT}>LinkedIn</a>
        <a href="https://github.com/L3xATM" ${EXT}>GitHub</a>
        <a href="mailto:contactol3x@gmail.com">contactol3x@gmail.com</a>
      </nav>
    </div>
    <div class="container footer-base"><span>&copy; <span data-year>2026</span> Lex &middot; Alex González Martos</span><a href="#top">Volver arriba &uarr;</a></div>
  </footer>`;

  document.currentScript.insertAdjacentHTML('beforebegin', curtain + loader + header);
  window.L3X = { names, mountFooter: () => document.querySelector('main').insertAdjacentHTML('afterend', footer) };
})();
