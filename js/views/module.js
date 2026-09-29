/**
 * VISTA: MÓDULO (Word o Excel)
 * Muestra los niveles con sus temas, el avance de cada uno
 * y el nivel recomendado por el diagnóstico.
 */
(function (O9) {
  'use strict';

  const { esc } = O9.util;

  function render(root, params) {
    const mod = O9.data.modules[params.id];
    const s = O9.store.get();
    const st = O9.progress.moduleStats(mod.id);
    const rec = s.diagnostic && s.diagnostic.recommend ? s.diagnostic.recommend[mod.id] : null;
    const next = O9.progress.nextTopic(mod.id);
    const project = O9.data.projects.find((p) => p.module === mod.id);

    root.innerHTML = `
      <div class="breadcrumb"><a href="#/">Inicio</a> › <span>${mod.name}</span></div>
      <header class="module-head ${mod.id}">
        <span class="mh-icon">${mod.icon}</span>
        <div class="mh-text">
          <h1>${mod.name}</h1>
          <p>${mod.tagline} ${mod.description}</p>
          <div class="mh-actions">
            ${next ? `<a class="btn btn-gold btn-sm" href="#/leccion/${next.topic.id}">${st.done ? '▶️ Continuar' : '🚀 Empezar'}: ${esc(next.topic.title)}</a>` : '<span class="pill pill-gold">🎉 ¡Módulo completo!</span>'}
            <a class="btn btn-light btn-sm" href="#/laboratorio/${mod.id}">🧪 Laboratorio de ${mod.name}</a>
          </div>
        </div>
        <div class="mh-progress">
          <div class="progress-label" style="color:#fff"><span>Progreso del módulo</span><span>${st.pct}%</span></div>
          ${O9.ui.bar(st.pct, 'progress-lg')}
          <div style="margin-top:6px;font-weight:800;font-size:.9rem">${st.done} de ${st.total} temas completados</div>
        </div>
      </header>

      ${!s.diagnostic ? `<div class="banner section" style="margin-top:16px"><span class="b-ico">🩺</span><div class="b-text"><b>¿No sabes por dónde empezar?</b><span class="muted">El diagnóstico te recomienda el nivel ideal para ti.</span></div><a class="btn btn-purple btn-sm" href="#/diagnostico">Hacer diagnóstico</a></div>` : ''}

      <div class="stack section" style="margin-top:20px">
        ${mod.levels.map((lvl, i) => levelCard(mod, lvl, i, rec, next)).join('')}
      </div>

      ${project ? `
      <section class="section">
        <a class="card card-hover quick" href="#/proyecto/${project.id}" style="border:2px dashed var(--gold)">
          <span class="card-icon" style="background:var(--gold-50)">${project.icon}</span>
          <div style="flex:1"><div class="muted" style="font-size:.8rem;font-weight:800">PROYECTO FINAL</div><b>${esc(project.subtitle)}</b>
          <div class="muted" style="font-size:.9rem">${esc(project.desc)}</div></div>
          <span class="pill ${O9.progress.projectDone(project.id) ? 'pill-green">✅ Entregado' : 'pill-gold">+' + project.xp + ' XP'}</span>
        </a>
      </section>` : ''}`;
    O9.ui.animateBars(root);
  }

  function levelCard(mod, lvl, i, rec, next) {
    const ls = O9.progress.levelStats(lvl);
    const prev = i > 0 ? O9.progress.levelStats(mod.levels[i - 1]) : null;
    const isRec = rec === lvl.id;
    const suggestPrev = prev && prev.pct < 50 && !isRec && ls.done === 0;
    return `<article class="level-card ${mod.id} ${ls.complete ? 'complete' : ''} ${isRec ? 'recommended' : ''}">
      <div class="level-card-head">
        <span class="level-num">${lvl.icon}</span>
        <div class="level-info">
          <div class="row" style="gap:6px">
            <span class="pill pill-gray">Nivel ${lvl.num}</span>
            ${isRec ? '<span class="pill pill-gold">⭐ Recomendado para ti</span>' : ''}
            ${ls.complete ? '<span class="pill pill-green">✅ Completo</span>' : ''}
            ${suggestPrev ? '<span class="pill pill-gray">💡 Mejor después del nivel anterior</span>' : ''}
          </div>
          <h3 style="margin-top:6px">${esc(lvl.title)}</h3>
          <p>${esc(lvl.desc)}</p>
        </div>
        <div class="level-side">
          <div class="progress-label"><span>${ls.done}/${ls.total} temas</span><span>${ls.pct}%</span></div>
          ${O9.ui.bar(ls.pct)}
        </div>
      </div>
      <ul class="topic-list">
        ${lvl.topics.map((t) => {
          const ts = O9.progress.topicState(t.id);
          const isNext = next && next.topic.id === t.id;
          const cls = ts.done ? 'done' : ts.learn ? 'started' : '';
          const icon = ts.done ? '✓' : ts.learn ? '◐' : t.icon;
          return `<li><a class="topic-link ${cls} ${isNext ? 'next' : ''}" href="#/leccion/${t.id}">
            <span class="topic-status">${icon}</span><span class="t-title">${esc(t.title)}</span>
            <span class="t-meta">${isNext ? '▶️ Sigue aquí · ' : ''}⏱️ ${t.minutes} min</span></a></li>`;
        }).join('')}
      </ul>
    </article>`;
  }

  O9.views.module = { render };
})(window.O9);
