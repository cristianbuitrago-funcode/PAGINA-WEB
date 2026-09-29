/**
 * ENRUTADOR por hash (#/ruta).
 * Funciona sin servidor: se puede abrir index.html directamente.
 *
 *  #/                    Inicio
 *  #/word  #/excel       Módulos
 *  #/leccion/:id         Tema (Aprende → Practica → Reto → Recompensa)
 *  #/retos  #/reto/:id   Retos
 *  #/progreso            Progreso
 *  #/perfil              Perfil
 *  #/diagnostico         Diagnóstico inicial
 *  #/laboratorio/:app    Aprende haciendo (word | excel)
 *  #/proyectos  #/proyecto/:id   Proyectos finales
 *  #/final               Certificado de curso completo
 *  #/cuenta              Registro / inicio de sesión (Firebase)
 */
(function (O9) {
  'use strict';

  const { $, $$ } = O9.util;

  // [patrón, vista, sección del menú, título]
  const ROUTES = [
    [/^$/, 'home', 'home', 'Inicio'],
    [/^(word|excel)$/, 'module', (m) => m[1], (m) => (m[1] === 'word' ? 'Word' : 'Excel')],
    [/^leccion\/([\w-]+)$/, 'lesson', (m) => (m[1].startsWith('w') ? 'word' : 'excel'), 'Lección'],
    [/^retos$/, 'challenges', 'retos', 'Retos'],
    [/^reto\/([\w-]+)$/, 'challenge', 'retos', 'Reto'],
    [/^progreso$/, 'progress', 'progreso', 'Mi progreso'],
    [/^perfil$/, 'profile', 'perfil', 'Mi perfil'],
    [/^diagnostico$/, 'diagnostic', 'home', 'Diagnóstico'],
    [/^laboratorio(?:\/(word|excel))?$/, 'lab', (m) => m[1] || 'word', 'Laboratorio'],
    [/^proyectos$/, 'projects', 'retos', 'Proyectos finales'],
    [/^proyecto\/([\w-]+)$/, 'project', 'retos', 'Proyecto final'],
    [/^final$/, 'final', 'progreso', '¡Curso completado!'],
    [/^cuenta$/, 'account', 'perfil', 'Mi cuenta']
  ];

  function parse() {
    const path = decodeURIComponent(location.hash.replace(/^#\/?/, '')).replace(/\/$/, '');
    for (const [re, view, nav, title] of ROUTES) {
      const m = re.exec(path);
      if (m) {
        const params = { id: m[1], app: m[1] };
        return { view, params, nav: typeof nav === 'function' ? nav(m) : nav, title: typeof title === 'function' ? title(m) : title };
      }
    }
    return null;
  }

  function navigate() {
    const root = $('#app');
    const route = parse();
    if (!route) { location.replace('#/'); return; }

    // Si el docente exige registro, sin sesión solo se puede ver la pantalla de cuenta
    const c = O9.cloud;
    if (c && c.enabled && c.requireLogin && c.ready && !c.user && route.view !== 'account') {
      location.replace('#/cuenta');
      return;
    }

    // Marca la sección activa en ambos menús
    $$('[data-nav]').forEach((a) => {
      const on = a.dataset.nav === route.nav;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    document.title = route.title === 'Inicio' ? 'Ofimática 9°' : `${route.title} · Ofimática 9°`;
    root.classList.remove('app'); void root.offsetWidth; root.classList.add('app'); // reinicia la animación
    window.scrollTo(0, 0);

    try {
      O9.views[route.view].render(root, route.params);
    } catch (err) {
      console.error(err);
      root.innerHTML = `<div class="empty"><div class="big">😵</div><h2>Ups, algo salió mal</h2><p>Recarga la página. Tu progreso está guardado.</p><a class="btn" href="#/">Volver al inicio</a></div>`;
    }
    root.focus({ preventScroll: true });
  }

  O9.router = {
    start() {
      window.addEventListener('hashchange', navigate);
      navigate();
    },
    refresh: navigate
  };
})(window.O9);
