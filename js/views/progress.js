/**
 * VISTA: PROGRESO
 * Nivel y XP, estadísticas, avance por módulo y nivel, insignias,
 * proyectos, diagnóstico e historial de actividad.
 */
(function (O9) {
  'use strict';

  const { esc, fmtNum, timeAgo } = O9.util;

  function render(root) {
    const s = O9.store.get();
    const info = O9.game.levelInfo();
    const ov = O9.progress.overall();
    const total = s.stats.correct + s.stats.wrong;
    const accuracy = total ? Math.round((s.stats.correct / total) * 100) : 0;
    const earned = O9.data.badges.filter((b) => s.badges[b.id]);
    const locked = O9.data.badges.filter((b) => !s.badges[b.id]);

    root.innerHTML = `
      <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Progreso</span></div>
      <h1>📈 Mi progreso</h1>

      <section class="card">
        <div class="level-hero">
          <div class="level-medal">${info.level.icon}</div>
          <div class="lh-body">
            <div class="muted" style="font-weight:800">NIVEL ${info.level.n}</div>
            <h2 style="margin:0 0 8px">${esc(info.level.name)}</h2>
            ${O9.ui.levelBlock()}
          </div>
        </div>
        <div class="level-steps">
          ${O9.data.levels.map((l) => `<div class="level-step ${l.n === info.level.n ? 'current' : l.n < info.level.n ? 'reached' : ''}"><b>${l.icon}</b>Nv ${l.n}<br>${esc(l.name)}<br><small>${fmtNum(l.min, 0)} XP</small></div>`).join('')}
        </div>
      </section>

      <section class="section grid grid-4">
        ${stat('⭐', fmtNum(s.xp, 0), 'XP total')}
        ${stat('🪙', fmtNum(s.points, 0), 'Puntos')}
        ${stat('📊', ov.pct + '%', 'Progreso del curso')}
        ${stat('📚', `${ov.topicsDone}/${ov.topicsTotal}`, 'Temas completados')}
        ${stat('⚔️', `${ov.challengesDone}/${ov.challengesTotal}`, 'Retos superados')}
        ${stat('🎯', accuracy + '%', `Precisión (${s.stats.correct} de ${total})`)}
        ${stat('🔥', s.stats.bestStreak, 'Mejor racha')}
        ${stat('🏅', `${earned.length}/${O9.data.badges.length}`, 'Insignias')}
      </section>

      ${s.courseComplete ? `<a class="banner section" href="#/final" style="text-decoration:none;color:inherit;border-color:var(--gold)"><span class="b-ico">🏆</span><div class="b-text"><b>¡Has completado el curso de Ofimática 9°!</b><span class="muted">Mira y descarga tu certificado.</span></div><span class="btn btn-gold">Ver certificado</span></a>` : ''}

      <section class="section grid grid-2">
        ${['word', 'excel'].map(moduleBox).join('')}
      </section>

      <section class="section">
        <div class="section-title"><h2>🏅 Insignias</h2><span class="pill pill-gold">${earned.length} conseguidas</span></div>
        <div class="grid grid-auto" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
          ${earned.concat(locked).map((b) => `<div class="badge-tile ${s.badges[b.id] ? '' : 'locked'}" title="${esc(b.desc)}">
            <div class="badge-medal">${s.badges[b.id] ? b.icon : '🔒'}</div>
            <div class="badge-name">${esc(b.name)}</div><div class="badge-desc">${esc(b.desc)}</div></div>`).join('')}
        </div>
      </section>

      <section class="section grid grid-2">
        <div class="card">
          <h3>🏆 Proyectos finales</h3>
          ${O9.data.projects.map((p) => `<a class="topic-link ${O9.progress.projectDone(p.id) ? 'done' : ''}" href="#/proyecto/${p.id}" style="margin-top:8px">
            <span class="topic-status">${O9.progress.projectDone(p.id) ? '✓' : p.icon}</span><span class="t-title">${esc(p.subtitle)}</span>
            <span class="t-meta">${O9.progress.projectDone(p.id) ? 'Entregado' : 'Pendiente'}</span></a>`).join('')}
          <h3 style="margin-top:20px">🩺 Diagnóstico</h3>
          ${s.diagnostic ? `<p>Resultado: <b>${esc(s.diagnostic.band)}</b> (${s.diagnostic.pct}%) · ${new Date(s.diagnostic.date).toLocaleDateString('es-CO')}</p>
            <p class="muted" style="font-size:.9rem">Recomendación: Word desde el <b>Nivel ${levelNum(s.diagnostic.recommend.word)}</b> y Excel desde el <b>Nivel ${levelNum(s.diagnostic.recommend.excel)}</b>.</p>
            <a class="btn btn-sm btn-light" href="#/diagnostico">Repetir diagnóstico</a>`
          : '<p class="muted">Aún no lo has hecho.</p><a class="btn btn-sm btn-purple" href="#/diagnostico">Hacer diagnóstico</a>'}
        </div>
        <div class="card">
          <h3>🕒 Actividad reciente</h3>
          ${s.activity.length ? `<ul class="activity">${s.activity.slice(0, 12).map((a) => `<li><span>${a.icon}</span><span>${esc(a.text)}</span><span class="when">${timeAgo(a.at)}</span></li>`).join('')}</ul>`
          : '<div class="empty"><div class="big">🌱</div><p>Todavía no hay actividad. ¡Empieza tu primer tema!</p></div>'}
        </div>
      </section>`;
    O9.ui.animateBars(root);
  }

  const stat = (icon, value, label) => `<div class="stat"><span class="stat-icon">${icon}</span><span class="stat-value">${value}</span><span class="stat-label">${esc(label)}</span></div>`;
  const levelNum = (id) => (id ? id.replace(/\D/g, '') : '1');

  function moduleBox(id) {
    const mod = O9.data.modules[id];
    const st = O9.progress.moduleStats(id);
    return `<div class="card">
      <div class="row-between"><h3 style="margin:0">${mod.icon} ${mod.name}</h3><span class="pill ${id === 'word' ? '' : 'pill-green'}">${st.pct}%</span></div>
      <div style="margin:10px 0 14px">${O9.ui.bar(st.pct, 'progress-lg')}</div>
      ${mod.levels.map((l) => { const ls = O9.progress.levelStats(l); return `<div class="lvl-row"><span>${l.icon} Nivel ${l.num}: ${esc(l.title)}</span>${O9.ui.bar(ls.pct, 'progress-sm')}<span>${ls.done}/${ls.total}</span></div>`; }).join('')}
      <a class="btn btn-sm btn-light" style="margin-top:10px" href="#/${id}">Ir a ${mod.name}</a>
    </div>`;
  }

  O9.views.progress = { render };
})(window.O9);
