/* L3x · arranque (se ejecuta antes de pintar): modo claro/oscuro guardado y primera visita de la sesión (pantalla de carga). */
(function (r, s) {
  r.classList.add('js');
  try { s = localStorage.getItem('l3x-theme'); } catch (e) { /* sin almacenamiento */ }
  r.dataset.theme = s === 'light' ? 'light' : 'dark';
  try { if (!sessionStorage.getItem('l3x')) { r.classList.add('is-intro'); sessionStorage.setItem('l3x', '1'); } } catch (e) { /* sin almacenamiento */ }
})(document.documentElement);
