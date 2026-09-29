/**
 * VISTA: DIAGNÓSTICO INICIAL
 * Preguntas cortas → nivel general (Básico / Intermedio / Avanzado)
 * y recomendación automática del nivel por donde empezar en Word y en Excel.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;

  function render(root) {
    const D = O9.data.diagnostic;
    const answers = [];
    let i = 0;

    function intro() {
      root.innerHTML = `<div class="diag-wrap">
        <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Diagnóstico</span></div>
        <section class="card center" style="padding:32px 24px">
          <div style="font-size:4rem">🩺</div>
          <h1>Diagnóstico inicial</h1>
          <p style="font-size:1.1rem">Son <b>${D.questions.length} preguntas cortas</b> sobre Word y Excel. Responde con sinceridad: <b>no es un examen</b> y no afecta ninguna nota.</p>
          <p class="muted">Al final te diremos tu nivel y por dónde te conviene comenzar.</p>
          <button class="btn btn-purple btn-lg" data-start>Comenzar 🚀</button>
        </section></div>`;
      $('[data-start]', root).onclick = question;
    }

    function question() {
      const q = D.questions[i];
      const mod = q.level.startsWith('w') ? '📝 Word' : '📊 Excel';
      root.innerHTML = `<div class="diag-wrap">
        <div class="progress-label"><span>Pregunta ${i + 1} de ${D.questions.length}</span><span>${mod}</span></div>
        ${O9.ui.bar(Math.round((i / D.questions.length) * 100), 'progress-purple')}
        <section class="card section question">
          <div class="question-text" style="font-size:1.25rem">${q.q}</div>
          ${q.kind === 'self'
            ? `<div class="scale">${D.scale.map((o) => `<button class="option" data-v="${o.value}"><span class="emo">${o.emoji}</span><span>${o.label}</span></button>`).join('')}</div>`
            : `<p class="muted" style="margin-top:-6px">🧩 Pregunta para comprobar</p><div class="options">${q.options.map((o, k) => `<button class="option" data-k="${k}"><span class="opt-key">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>`}
          <div class="row" style="margin-top:16px;justify-content:space-between">
            ${i > 0 ? '<button class="btn btn-ghost btn-sm" data-back>← Anterior</button>' : '<span></span>'}
          </div>
        </section></div>`;
      $$('[data-v]', root).forEach((b) => (b.onclick = () => answer(+b.dataset.v, b)));
      $$('[data-k]', root).forEach((b) => (b.onclick = () => answer(+b.dataset.k === q.answer ? 2 : 0, b)));
      const back = $('[data-back]', root);
      if (back) back.onclick = () => { i--; answers.pop(); question(); };
    }

    function answer(value, btn) {
      btn.classList.add('picked');
      answers[i] = { level: D.questions[i].level, value };
      i++;
      setTimeout(() => (i < D.questions.length ? question() : result()), 220);
    }

    function result() {
      // Puntaje por nivel (0 a 2)
      const byLevel = {};
      answers.forEach((a) => { (byLevel[a.level] = byLevel[a.level] || []).push(a.value); });
      const avg = (id) => (byLevel[id] ? byLevel[id].reduce((x, y) => x + y, 0) / byLevel[id].length : null);
      const recommend = {};
      const mastered = [], toImprove = [];
      ['word', 'excel'].forEach((m) => {
        let prevScore = 0;
        const levels = O9.data.modules[m].levels;
        levels.forEach((l) => {
          let sc = avg(l.id);
          if (sc === null) sc = prevScore; // nivel sin preguntas: se asume igual al anterior
          prevScore = sc;
          if (sc >= 1.5) mastered.push(l); else toImprove.push(l);
          if (!recommend[m] && sc < 1.5) recommend[m] = l.id;
        });
        if (!recommend[m]) recommend[m] = levels[levels.length - 1].id;
      });
      const total = answers.reduce((a, b) => a + b.value, 0);
      const pct = Math.round((total / (answers.length * 2)) * 100);
      const band = D.bands.filter((b) => pct >= b.min).pop();
      const scoreOf = (m) => answers.filter((a) => a.level[0] === m[0]).reduce((x, y) => x + y.value, 0) / Math.max(1, answers.filter((a) => a.level[0] === m[0]).length);
      const firstModule = scoreOf('word') <= scoreOf('excel') ? 'word' : 'excel';

      O9.store.update((s) => { s.diagnostic = { date: Date.now(), pct, band: band.name, recommend, firstModule }; });
      O9.progress.log('🩺', `Diagnóstico: nivel ${band.name}`);
      O9.game.reward('diagnostic', 'diagnostic', 'Diagnóstico completado');
      O9.game.checkBadges();

      const lvl = (m) => O9.data.modules[m].levels.find((l) => l.id === recommend[m]);
      const rec = (m) => {
        const l = lvl(m);
        const mod = O9.data.modules[m];
        return `<div class="card">
          <div class="row" style="gap:10px"><span class="card-icon" style="background:${m === 'word' ? 'var(--word-soft)' : 'var(--excel-soft)'}">${mod.icon}</span>
            <div><div class="muted" style="font-size:.8rem;font-weight:800">${mod.name.toUpperCase()}: EMPIEZA EN</div><b>Nivel ${l.num} · ${esc(l.title)}</b></div></div>
          <p class="muted" style="font-size:.9rem;margin:10px 0">${esc(l.desc)}</p>
          <a class="btn btn-sm ${m === 'word' ? '' : 'btn-green'}" href="#/leccion/${l.topics[0].id}">Empezar: ${esc(l.topics[0].title)} ➜</a></div>`;
      };

      root.innerHTML = `<div class="diag-wrap">
        <section class="card center" style="padding:28px 20px">
          <div style="font-size:4rem">${band.icon}</div>
          <p class="muted" style="font-weight:800;margin:0">TU NIVEL ACTUAL ES:</p>
          <div class="result-level">${band.name}</div>
          <p style="font-size:1.05rem;max-width:520px;margin:10px auto">${band.text}</p>
          ${O9.ui.bar(pct, 'progress-purple')}
          <p class="muted" style="margin-top:6px">Puntaje: ${pct}%</p>
        </section>
        <h2 class="section">📍 Te recomendamos empezar por aquí</h2>
        <div class="grid grid-2">${rec(firstModule)}${rec(firstModule === 'word' ? 'excel' : 'word')}</div>
        <div class="grid grid-2 section">
          <div class="card"><h3>💪 Ya dominas</h3>${mastered.length ? `<ul>${mastered.map((l) => `<li>${l.id.startsWith('w') ? 'Word' : 'Excel'} · ${esc(l.title)}</li>`).join('')}</ul>` : '<p class="muted">¡Todo está por descubrir! Empezaremos desde lo más básico.</p>'}</div>
          <div class="card"><h3>🎯 Vamos a reforzar</h3>${toImprove.length ? `<ul>${toImprove.map((l) => `<li>${l.id.startsWith('w') ? 'Word' : 'Excel'} · ${esc(l.title)}</li>`).join('')}</ul>` : '<p class="muted">Nada: ¡ve directo a los retos y proyectos finales!</p>'}</div>
        </div>
        <div class="row section" style="justify-content:center"><a class="btn btn-light" href="#/">Ir al inicio</a><a class="btn btn-gold" href="#/retos">Ver retos ⚔️</a></div>
      </div>`;
      O9.ui.animateBars(root);
      O9.ui.confetti(100);
    }

    intro();
  }

  O9.views.diagnostic = { render };
})(window.O9);
