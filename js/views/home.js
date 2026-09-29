/**
 * VISTA: INICIO
 * Presentación, resumen del estudiante (nivel, XP, progreso, retos, insignias),
 * los dos grandes módulos y accesos rápidos.
 */
(function (O9) {
  'use strict';

  const { esc, fmtNum } = O9.util;

  /** Ruta para "Continuar aprendizaje": último lugar visitado o siguiente tema. */
  function continueRoute() {
    const s = O9.store.get();
    if (s.lastRoute) return s.lastRoute;
    const next = O9.progress.nextTopic('word') || O9.progress.nextTopic('excel');
    return next ? '#/leccion/' + next.topic.id : '#/retos';
  }

  function render(root) {
    const s = O9.store.get();
    const info = O9.game.levelInfo();
    const ov = O9.progress.overall();
    const badges = O9.game.badgeCount();
    const name = s.profile.name ? esc(s.profile.name) : 'estudiante';
    const wStats = O9.progress.moduleStats('word');
    const xStats = O9.progress.moduleStats('excel');
    const startHref = s.diagnostic ? '#/' + (s.diagnostic.firstModule || 'word') : '#/diagnostico';
    const nextW = O9.progress.nextTopic('word');
    const nextX = O9.progress.nextTopic('excel');

    root.innerHTML = `
      <section class="hero">
        <div class="hero-grid">
          <div>
            <h1>Ofimática 9°</h1>
            <p class="hero-tagline">Aprende Word y Excel haciendo, practicando y superando retos.</p>
            <p class="hero-text">Una plataforma para aprender paso a paso, con ejemplos del colegio, simuladores para practicar sin miedo a equivocarte, retos, insignias y niveles. Al final vas a poder hacer tus trabajos <b>tú solo</b>.</p>
            <div class="hero-actions">
              <a class="btn btn-gold btn-lg" href="${startHref}">🚀 Empezar a aprender</a>
              <a class="btn btn-light" href="${continueRoute()}">▶️ Continuar aprendizaje</a>
              <a class="btn btn-light" href="#/progreso">📈 Ver mi progreso</a>
            </div>
          </div>
          <div class="hero-card">
            <div class="row" style="gap:12px;margin-bottom:10px">
              <span class="avatar-big">${s.profile.avatar}</span>
              <div><div class="hello">¡Hola, ${name}!</div><div class="lvl-name">${info.level.icon} Nivel ${info.level.n}: ${esc(info.level.name)}</div></div>
            </div>
            ${O9.ui.bar(info.pct, 'progress-lg')}
            <div class="row-between" style="margin-top:6px;font-weight:800;font-size:.9rem">
              <span class="progress-text">${O9.util.textBar(info.pct)} ${info.pct}%</span>
              <span>${fmtNum(s.xp, 0)} XP</span>
            </div>
            <p style="margin:8px 0 0;font-size:.9rem;opacity:.9">${info.next ? `Te faltan <b>${info.toNext} XP</b> para ser <b>${esc(info.next.name)}</b>.` : '¡Alcanzaste el nivel máximo!'}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="grid grid-5">
          ${stat('🎖️', `Nv ${info.level.n}`, info.level.name)}
          ${stat('⭐', fmtNum(s.xp, 0), 'XP obtenida')}
          ${stat('📊', ov.pct + '%', 'Progreso del curso')}
          ${stat('⚔️', `${ov.challengesDone}/${ov.challengesTotal}`, 'Retos completados')}
          ${stat('🏅', `${badges}/${O9.data.badges.length}`, 'Insignias conseguidas')}
        </div>
      </section>

      ${O9.cloud.enabled && O9.cloud.ready && !O9.cloud.user ? `
      <section class="section">
        <div class="banner" style="border-color:var(--blue-100);background:linear-gradient(90deg,var(--blue-50),#fff)">
          <span class="b-ico">☁️</span>
          <div class="b-text"><b>Crea tu cuenta gratis</b>
          <span class="muted">Guarda tu progreso en la nube y continúa desde cualquier computador o celular.</span></div>
          <a class="btn" href="#/cuenta">Registrarme</a>
        </div>
      </section>` : ''}

      ${!s.diagnostic ? `
      <section class="section">
        <div class="banner">
          <span class="b-ico">🩺</span>
          <div class="b-text"><b>Antes de empezar: haz el diagnóstico (3 minutos)</b>
          <span class="muted">Te haremos unas preguntas para saber qué ya sabes y recomendarte por dónde comenzar.</span></div>
          <a class="btn btn-purple" href="#/diagnostico">Hacer diagnóstico</a>
        </div>
      </section>` : ''}

      <section class="section">
        <div class="section-title"><h2>Elige un módulo</h2></div>
        <div class="grid grid-2">
          ${moduleCard('word', '📝', 'WORD', 'Aprende a crear documentos profesionales.', wStats)}
          ${moduleCard('excel', '📊', 'EXCEL', 'Aprende a organizar datos, utilizar fórmulas y crear gráficos.', xStats)}
        </div>
      </section>

      ${nextW || nextX ? `
      <section class="section">
        <div class="section-title"><h2>▶️ Tu siguiente paso</h2></div>
        <div class="grid grid-2">
          ${nextW ? nextCard(nextW) : ''}
          ${nextX ? nextCard(nextX) : ''}
        </div>
      </section>` : ''}

      <section class="section">
        <div class="section-title"><h2>¿Cómo se aprende aquí?</h2></div>
        <div class="flow">
          <div class="flow-step"><div class="ico">📚</div><b>Aprende</b><small>Explicaciones cortas con ejemplos del colegio</small></div>
          <div class="flow-step"><div class="ico">🎯</div><b>Practica</b><small>Preguntas con pistas si te equivocas</small></div>
          <div class="flow-step"><div class="ico">🧠</div><b>Reto</b><small>Hazlo tú en el simulador de Word o Excel</small></div>
          <div class="flow-step"><div class="ico">🏆</div><b>Recompensa</b><small>Gana XP, sube de nivel y consigue insignias</small></div>
        </div>
      </section>

      <section class="section">
        <div class="grid grid-4">
          ${quick('#/laboratorio', '🧪', 'Laboratorio', 'Practica libre en el mini Word y el mini Excel, con misiones.')}
          ${quick('#/retos', '⚔️', 'Retos', 'Desafíos para ganar XP, puntos e insignias.')}
          ${quick('#/proyectos', '🏆', 'Proyectos finales', 'Un informe en Word y un sistema de notas en Excel.')}
          ${quick('#/ayuda', '❓', 'Ayuda', 'Preguntas frecuentes sobre la plataforma y las tareas.')}
        </div>
      </section>`;
    O9.ui.animateBars(root);

    // Aviso de tareas pendientes (solo estudiantes con sesión)
    const c = O9.cloud;
    if (c.enabled && c.user && c.role === 'student' && O9.homework) {
      O9.homework.pendingCount().then((n) => {
        if (!n || !document.body.contains(root)) return;
        const hero = root.querySelector('.hero');
        if (!hero) return;
        hero.insertAdjacentHTML('afterend', `<section class="section"><a class="banner" href="#/tareas" style="text-decoration:none;color:inherit;border-color:var(--purple-100);background:linear-gradient(90deg,var(--purple-50),#fff)">
          <span class="b-ico">📋</span><div class="b-text"><b>Tienes ${n} tarea${n === 1 ? '' : 's'} por entregar</b><span class="muted">Revisa las instrucciones, descarga el material y entrega tus archivos.</span></div>
          <span class="btn btn-purple">Ver mis tareas</span></a></section>`);
      }).catch(() => {});
    }
  }

  const stat = (icon, value, label) => `<div class="stat"><span class="stat-icon">${icon}</span><span class="stat-value">${value}</span><span class="stat-label">${esc(label)}</span></div>`;

  function moduleCard(id, icon, name, text, st) {
    return `<a class="module-card ${id}" href="#/${id}">
      <span class="m-bg" aria-hidden="true">${icon}</span>
      <span class="m-icon">${icon}</span>
      <h3>${name}</h3>
      <p>${text}</p>
      <div class="m-meta"><span>${st.done}/${st.total} temas</span><span>${st.pct}%</span></div>
      ${O9.ui.bar(st.pct)}
    </a>`;
  }

  function nextCard(e) {
    return `<a class="card card-hover quick" href="#/leccion/${e.topic.id}">
      <span class="card-icon" style="background:${e.module.id === 'word' ? 'var(--word-soft)' : 'var(--excel-soft)'}">${e.topic.icon}</span>
      <div style="flex:1"><div class="muted" style="font-size:.8rem;font-weight:800">${e.module.name.toUpperCase()} · NIVEL ${e.level.num}</div><b>${esc(e.topic.title)}</b></div>
      <span class="pill pill-purple">Seguir ➜</span></a>`;
  }

  const quick = (href, icon, title, text) => `<a class="card card-hover quick" href="${href}"><span class="card-icon">${icon}</span><div><b>${title}</b><div class="muted" style="font-size:.9rem">${text}</div></div></a>`;

  O9.views.home = { render, continueRoute };
})(window.O9);
