/**
 * VISTA: RETOS ⚔️
 * Lista de desafíos (con filtros) y pantalla para jugar cada reto:
 * tareas en simulador, cuestionarios y el modo contrarreloj.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$, shuffle } = O9.util;
  const KIND = { task: '🛠️ Práctica en simulador', quiz: '❓ Cuestionario', timed: '⏱️ Contra el reloj' };
  const MOD = { word: '📝 Word', excel: '📊 Excel', mixto: '🎮 Mixto' };
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

  /* ================== LISTA ================== */
  function renderList(root) {
    let filter = 'all';
    const draw = () => {
      const s = O9.store.get();
      const list = O9.data.challenges.filter((c) => filter === 'all' || c.module === filter);
      const done = O9.progress.challengesDone();
      root.innerHTML = `
        <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Retos</span></div>
        <div class="row-between"><div><h1>⚔️ Retos</h1><p class="muted" style="margin:0">Pon a prueba lo que sabes. Cada reto te da <b>XP</b>, <b>puntos</b>, una <b>insignia</b> y avanza tu progreso.</p></div>
          <div class="stat" style="min-width:180px"><span class="stat-value">${done}/${O9.data.challenges.length}</span><span class="stat-label">Retos superados · ${s.points} puntos ⭐</span></div></div>
        <div class="tabs section" role="tablist" style="margin-top:16px">
          ${[['all', 'Todos'], ['word', '📝 Word'], ['excel', '📊 Excel'], ['mixto', '🎮 Mixtos']].map(([k, l]) => `<button class="tab-btn ${filter === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}
        </div>
        <div class="grid grid-auto">
          ${list.map((c) => card(c, s.challenges[c.id])).join('')}
        </div>
        <section class="section">
          <div class="section-title"><h2>🏆 Proyectos finales</h2></div>
          <div class="grid grid-2">${O9.data.projects.map((p) => `<a class="card card-hover challenge-card ${O9.progress.projectDone(p.id) ? 'done' : ''}" href="#/proyecto/${p.id}">
            <div class="cc-top"><span class="cc-icon">${p.icon}</span><div><h3>${esc(p.title)}</h3><span class="muted" style="font-size:.85rem">${esc(p.subtitle)}</span></div></div>
            <div class="cc-rewards"><span class="pill pill-gold">+${p.xp} XP</span><span class="pill pill-purple">+${p.points} pts</span>${O9.progress.projectDone(p.id) ? '<span class="pill pill-green">✅ Entregado</span>' : ''}</div></a>`).join('')}</div>
        </section>`;
      $$('[data-f]', root).forEach((b) => (b.onclick = () => { filter = b.dataset.f; draw(); }));
    };
    draw();
  }

  function card(c, st) {
    const done = st && st.done;
    const cls = c.module === 'mixto' ? 'game' : c.module;
    return `<a class="card card-hover challenge-card ${cls} ${done ? 'done' : ''}" href="#/reto/${c.id}">
      <div class="cc-top"><span class="cc-icon">${c.icon}</span><div><h3>${esc(c.title)}</h3>
        <span class="muted" style="font-size:.8rem;font-weight:700">${MOD[c.module]} · <span class="diff" title="Dificultad">${stars(c.difficulty)}</span></span></div></div>
      <p>${esc(c.desc)}</p>
      <div class="muted" style="font-size:.8rem;font-weight:700">${KIND[c.kind]}</div>
      <div class="cc-rewards">
        <span class="pill pill-gold">+${c.xp} XP</span><span class="pill pill-purple">+${c.points} pts</span>
        <span class="pill ${done ? 'pill-green' : 'pill-gray'}">${c.badge.icon} ${esc(c.badge.name)}</span>
      </div>
      ${done ? `<div class="pill pill-green" style="align-self:flex-start">✅ Superado${c.kind !== 'task' ? ` · mejor: ${st.best}` : ''}</div>` : ''}
    </a>`;
  }

  /* ================== JUGAR UN RETO ================== */
  function renderPlay(root, params) {
    const c = O9.data.challenges.find((x) => x.id === params.id);
    if (!c) { root.innerHTML = '<div class="empty"><div class="big">🤷</div><p>Reto no encontrado.</p><a class="btn" href="#/retos">Ver retos</a></div>'; return; }
    O9.progress.setLastRoute('#/reto/' + c.id);
    const st = O9.store.get().challenges[c.id];

    root.innerHTML = `
      <div class="breadcrumb"><a href="#/">Inicio</a> › <a href="#/retos">Retos</a> › <span>${esc(c.title)}</span></div>
      <header class="lesson-head">
        <span class="lh-icon">${c.icon}</span>
        <div style="flex:1;min-width:220px"><h1>${esc(c.title)}</h1><p class="muted" style="margin:4px 0 0">${esc(c.desc)}</p>
          <div class="row" style="gap:6px;margin-top:8px">
            <span class="pill pill-gold">+${c.xp} XP</span><span class="pill pill-purple">+${c.points} puntos</span>
            <span class="pill pill-gray">${c.badge.icon} Insignia: ${esc(c.badge.name)}</span>
            <span class="pill pill-gray">Dificultad <span class="diff">${stars(c.difficulty)}</span></span>
            ${st && st.done ? '<span class="pill pill-green">✅ Ya lo superaste</span>' : ''}
          </div></div>
      </header>
      <section class="card section" data-play></section>`;
    const host = $('[data-play]', root);

    if (c.kind === 'task') {
      O9.tasks.render(host, c.task, { onComplete: () => complete(c, 100) });
    } else if (c.kind === 'quiz') {
      playQuiz(host, c);
    } else if (c.kind === 'timed') {
      timedIntro(host, c);
    }
  }

  function playQuiz(host, c) {
    O9.ex.renderQuiz(host, c.questions, {
      doneLabel: 'Ver resultado ➜',
      onComplete: (sum) => {
        const ok = sum.correct >= c.minScore;
        host.innerHTML = `<div class="reward"><div style="font-size:3.5rem">${ok ? '🏆' : '💪'}</div>
          <h2>${ok ? '¡Reto superado!' : 'Casi lo logras'}</h2>
          <p class="muted">Acertaste <b>${sum.correct} de ${sum.total}</b>. ${ok ? '' : `Necesitas ${c.minScore} para superarlo. ¡Inténtalo de nuevo!`}</p>
          <div class="row" style="justify-content:center"><button class="btn btn-light" data-retry>🔁 Jugar otra vez</button><a class="btn" href="#/retos">Ver más retos</a></div></div>`;
        $('[data-retry]', host).onclick = () => playQuiz(host, c);
        if (ok) complete(c, sum.correct);
      }
    });
  }

  /* ---------- Contrarreloj ---------- */
  function timedIntro(host, c) {
    const best = (O9.store.get().challenges[c.id] || {}).best || 0;
    host.innerHTML = `<div class="reward"><div style="font-size:4rem">⏱️</div><h2>¿List@?</h2>
      <p>Tienes <b>${c.seconds} segundos</b>. Responde tantas preguntas como puedas. Necesitas <b>${c.minScore} aciertos</b> para superar el reto.</p>
      <p class="muted">Aquí no hay segundo intento: si fallas, pasa a la siguiente. ${best ? `Tu récord: <b>${best}</b> aciertos.` : ''}</p>
      <button class="btn btn-gold btn-lg" data-go>¡Comenzar!</button></div>`;
    $('[data-go]', host).onclick = () => playTimed(host, c);
  }

  function playTimed(host, c) {
    const pool = shuffle(c.pool);
    let i = 0, correct = 0, answered = 0, left = c.seconds, over = false;
    host.innerHTML = `<div class="row-between" style="margin-bottom:12px"><span class="timer" data-t>⏱️ ${left}s</span>
      <span class="pill pill-green" data-score>✅ 0</span></div>
      <div class="progress progress-gold" style="margin-bottom:16px"><span data-bar style="width:100%;transition:width 1s linear"></span></div><div data-q></div>`;
    const tEl = $('[data-t]', host), bar = $('[data-bar]', host), qHost = $('[data-q]', host), score = $('[data-score]', host);
    const timer = setInterval(() => {
      if (!document.body.contains(host)) return clearInterval(timer);
      left--;
      tEl.textContent = `⏱️ ${left}s`;
      tEl.classList.toggle('low', left <= 10);
      bar.style.width = (left / c.seconds) * 100 + '%';
      if (left <= 0) finish();
    }, 1000);
    function nextQ() {
      if (over) return;
      if (i >= pool.length) return finish();
      O9.ex.renderQuestion(qHost, pool[i], {
        noRetry: true, autoNext: true, index: i, total: 1,
        onDone: (res) => {
          answered++;
          if (res.correct) correct++;
          score.textContent = `✅ ${correct}`;
          i++;
          setTimeout(nextQ, res.correct ? 450 : 1100);
        }
      });
    }
    function finish() {
      if (over) return;
      over = true;
      clearInterval(timer);
      const ok = correct >= c.minScore;
      host.innerHTML = `<div class="reward"><div style="font-size:3.5rem">${ok ? '⚡' : '⏰'}</div><h2>${ok ? '¡Reto superado!' : '¡Se acabó el tiempo!'}</h2>
        <p>Respondiste <b>${answered}</b> preguntas y acertaste <b>${correct}</b>.</p>
        <p class="muted">${ok ? '¡Eres rapidísimo!' : `Necesitas ${c.minScore} aciertos. Cada intento te hace más rápido.`}</p>
        <div class="row" style="justify-content:center"><button class="btn btn-gold" data-retry>🔁 Otra vez</button><a class="btn btn-light" href="#/retos">Ver retos</a></div></div>`;
      $('[data-retry]', host).onclick = () => playTimed(host, c);
      O9.store.update((s) => { const x = (s.challenges[c.id] = s.challenges[c.id] || { done: false, best: 0 }); x.best = Math.max(x.best || 0, correct); });
      if (ok) complete(c, correct);
    }
    nextQ();
  }

  /** Entrega las recompensas del reto (solo la primera vez da XP). */
  function complete(c, score) {
    const first = !(O9.store.get().challenges[c.id] || {}).done;
    O9.progress.markChallenge(c.id, score);
    const xp = O9.game.award('challenge-reto:' + c.id, c.xp, c.points, `Reto: ${c.title}`);
    if (first) O9.progress.log(c.icon, `Superaste el reto "${c.title}"`);
    O9.game.checkBadges();
    O9.ui.confetti(140);
    if (first && xp) {
      setTimeout(() => O9.ui.modal({
        emoji: c.badge.icon, title: '¡Reto superado!',
        html: `<p>Ganaste <b>+${c.xp} XP</b>, <b>+${c.points} puntos</b> y la insignia <b>${esc(c.badge.name)}</b>.</p>`,
        actions: [{ label: 'Seguir aquí', cls: 'btn-light' }, { label: 'Más retos ⚔️', cls: 'btn-gold', onClick: () => (location.hash = '#/retos') }]
      }), 600);
    }
  }

  O9.views.challenges = { render: renderList };
  O9.views.challenge = { render: renderPlay };
})(window.O9);
