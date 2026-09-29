/**
 * VISTAS: PROYECTOS FINALES y CERTIFICADO
 *  - #/proyectos      → los dos proyectos y su estado
 *  - #/proyecto/:id   → trabajar en un proyecto (se guarda el borrador)
 *  - #/final          → "¡Has completado el curso de Ofimática 9°!"
 */
(function (O9) {
  'use strict';

  const { esc, $ } = O9.util;

  /* ================== LISTA ================== */
  function renderList(root) {
    const both = O9.data.projects.every((p) => O9.progress.projectDone(p.id));
    root.innerHTML = `
      <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Proyectos finales</span></div>
      <h1>🏆 Proyectos finales</h1>
      <p class="muted">Aquí demuestras todo lo que aprendiste. Al entregar los dos proyectos completas el curso y obtienes tu certificado.</p>
      ${both ? '<a class="banner section" href="#/final" style="text-decoration:none;color:inherit"><span class="b-ico">🎓</span><div class="b-text"><b>¡Completaste el curso!</b><span class="muted">Mira tu certificado.</span></div><span class="btn btn-gold">Ver certificado</span></a>' : ''}
      <div class="grid grid-2 section">
        ${O9.data.projects.map((p) => {
          const done = O9.progress.projectDone(p.id);
          const draft = (O9.store.get().projects[p.id] || {}).data;
          const recs = p.recommended.map((id) => O9.data.modules[p.module].levels.find((l) => l.id === id));
          return `<article class="card challenge-card ${p.module} ${done ? 'done' : ''}">
            <div class="cc-top"><span class="cc-icon">${p.icon}</span><div><h3>${esc(p.title)}</h3><b style="color:var(--purple)">${esc(p.subtitle)}</b></div></div>
            <p>${esc(p.desc)}</p>
            <div><b style="font-size:.85rem">Debe incluir:</b>
              <div class="row" style="gap:6px;margin-top:6px">${p.task.checks.map((c) => `<span class="pill pill-gray">${c.label.split('(')[0].trim()}</span>`).join('')}</div></div>
            <div><b style="font-size:.85rem">Te ayudan estos niveles:</b>
              ${recs.map((l) => { const ls = O9.progress.levelStats(l); return `<div class="lvl-row" style="grid-template-columns:1fr 90px 44px"><span>${l.icon} ${esc(l.title)}</span>${O9.ui.bar(ls.pct, 'progress-sm')}<span>${ls.pct}%</span></div>`; }).join('')}</div>
            <div class="cc-rewards"><span class="pill pill-gold">+${p.xp} XP</span><span class="pill pill-purple">+${p.points} pts</span>${done ? '<span class="pill pill-green">✅ Entregado</span>' : ''}</div>
            <a class="btn ${done ? 'btn-light' : 'btn-gold'}" href="#/proyecto/${p.id}">${done ? 'Ver / mejorar mi proyecto' : draft ? '▶️ Continuar proyecto' : '🚀 Empezar proyecto'}</a>
          </article>`;
        }).join('')}
      </div>`;
    O9.ui.animateBars(root);
  }

  /* ================== TRABAJAR EN UN PROYECTO ================== */
  function renderProject(root, params) {
    const p = O9.data.projects.find((x) => x.id === params.id);
    if (!p) { root.innerHTML = '<div class="empty"><div class="big">🤷</div><p>Proyecto no encontrado.</p><a class="btn" href="#/proyectos">Ver proyectos</a></div>'; return; }
    O9.progress.setLastRoute('#/proyecto/' + p.id);
    const saved = O9.store.get().projects[p.id] || {};
    root.innerHTML = `
      <div class="breadcrumb"><a href="#/">Inicio</a> › <a href="#/proyectos">Proyectos finales</a> › <span>${esc(p.title)}</span></div>
      <header class="lesson-head">
        <span class="lh-icon">${p.icon}</span>
        <div style="flex:1;min-width:220px"><h1>${esc(p.subtitle)}</h1><p class="muted" style="margin:4px 0 0">${esc(p.desc)}</p>
          <div class="row" style="gap:6px;margin-top:8px"><span class="pill pill-gold">+${p.xp} XP</span><span class="pill pill-purple">+${p.points} puntos</span>
          ${saved.done ? '<span class="pill pill-green">✅ Entregado</span>' : '<span class="pill pill-gray">💾 Tu avance se guarda automáticamente</span>'}</div></div>
      </header>
      <section class="section" data-task></section>`;

    const saveDraft = O9.util.debounce((sim) => {
      O9.store.update((s) => { s.projects[p.id] = Object.assign(s.projects[p.id] || {}, { data: sim.serialize() }); });
    }, 600);

    O9.tasks.render($('[data-task]', root), p.task, {
      restore: saved.data,
      submitLabel: '📤 Entregar proyecto',
      onChange: saveDraft,
      onReset: () => O9.store.update((s) => { if (s.projects[p.id]) s.projects[p.id].data = null; }),
      onComplete: (sim) => {
        const first = !O9.progress.projectDone(p.id);
        O9.store.update((s) => { s.projects[p.id] = { done: true, date: Date.now(), data: sim.serialize() }; });
        O9.game.award('project:' + p.id, p.xp, p.points, p.title);
        if (first) O9.progress.log(p.icon, `Entregaste el ${p.title.toLowerCase()}`);
        const fresh = O9.game.checkBadges();
        const courseDone = O9.data.projects.every((x) => O9.progress.projectDone(x.id));
        if (courseDone) O9.store.update((s) => { s.courseComplete = true; });
        O9.ui.confetti(200);
        if (!first) return;
        setTimeout(() => {
          if (courseDone) {
            O9.ui.modal({
              emoji: '🏆', title: '¡Has completado el curso de Ofimática 9°!',
              html: '<p>Entregaste los dos proyectos finales. Ahora puedes hacer tus trabajos en Word y Excel <b>tú solo</b>.</p>',
              actions: [{ label: 'Ver mi certificado 🎓', cls: 'btn-gold', onClick: () => (location.hash = '#/final') }]
            });
          } else {
            const other = O9.data.projects.find((x) => !O9.progress.projectDone(x.id));
            O9.ui.modal({
              emoji: p.icon, title: '¡Proyecto entregado!',
              html: `<p>Ganaste <b>+${p.xp} XP</b> y <b>+${p.points} puntos</b>${fresh.length ? ' y una nueva insignia' : ''}.</p>${other ? `<p>Te falta el <b>${esc(other.title)}</b> para completar el curso.</p>` : ''}`,
              actions: [{ label: 'Quedarme aquí', cls: 'btn-light' }].concat(other ? [{ label: `Ir al ${other.title.replace('Proyecto final de ', 'proyecto de ')} ➜`, cls: 'btn-gold', onClick: () => (location.hash = '#/proyecto/' + other.id) }] : [])
            });
          }
        }, 700);
      }
    });
  }

  /* ================== CERTIFICADO FINAL ================== */
  function renderFinal(root) {
    const s = O9.store.get();
    const done = O9.data.projects.every((p) => O9.progress.projectDone(p.id));
    if (!done) {
      root.innerHTML = `<div class="empty"><div class="big">🏁</div><h2>¡Ya casi!</h2>
        <p>Para completar el curso debes entregar los dos proyectos finales.</p>
        <div class="row" style="justify-content:center">${O9.data.projects.map((p) => `<a class="btn ${O9.progress.projectDone(p.id) ? 'btn-light' : 'btn-gold'}" href="#/proyecto/${p.id}">${O9.progress.projectDone(p.id) ? '✅' : p.icon} ${esc(p.title)}</a>`).join('')}</div></div>`;
      return;
    }
    const info = O9.game.levelInfo();
    const ov = O9.progress.overall();
    root.innerHTML = `
      <div class="certificate">
        <div class="trophy">🏆</div>
        <h1>¡Has completado el curso de Ofimática 9°!</h1>
        <p class="muted" style="font-weight:800;letter-spacing:.08em">CERTIFICADO DE LOGRO OTORGADO A</p>
        <div class="who">${s.profile.avatar} ${esc(s.profile.name || 'Estudiante de 9°')}</div>
        <p>${esc(s.profile.course || '9°')} · Nivel ${info.level.n}: <b>${esc(info.level.name)}</b></p>
        <p class="quote">"Antes no sabía usar Word y Excel, pero ahora sí puedo hacer mis trabajos solo."</p>
        <div class="grid grid-4" style="margin:20px 0">
          <div class="stat"><span class="stat-value">${O9.util.fmtNum(s.xp, 0)}</span><span class="stat-label">XP</span></div>
          <div class="stat"><span class="stat-value">${ov.topicsDone}</span><span class="stat-label">Temas</span></div>
          <div class="stat"><span class="stat-value">${ov.challengesDone}</span><span class="stat-label">Retos</span></div>
          <div class="stat"><span class="stat-value">${O9.game.badgeCount()}</span><span class="stat-label">Insignias</span></div>
        </div>
        <p class="muted">Word ✔️ Excel ✔️ · ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div class="row no-print" style="justify-content:center;margin-top:16px">
          <button class="btn btn-purple" data-print>🖨️ Imprimir o guardar como PDF</button>
          <a class="btn btn-light" href="#/perfil">✏️ Cambiar nombre</a>
          <a class="btn btn-light" href="#/retos">⚔️ Seguir con retos</a>
        </div>
      </div>`;
    $('[data-print]', root).onclick = () => window.print();
    O9.ui.confetti(220);
  }

  O9.views.projects = { render: renderList };
  O9.views.project = { render: renderProject };
  O9.views.final = { render: renderFinal };
})(window.O9);
