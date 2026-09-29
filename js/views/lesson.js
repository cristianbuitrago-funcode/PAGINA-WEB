/**
 * VISTA: LECCIÓN (un tema)
 * Ciclo de aprendizaje:  📚 Aprende → 🎯 Practica → 🧠 Reto → 🏆 Recompensa
 *
 * - Aprende: bloques de contenido (texto, ejemplos, simuladores...)
 * - Practica: preguntas con pistas y repaso si el estudiante se equivoca
 * - Reto: tarea en el simulador o preguntas más exigentes
 * - Recompensa: XP, insignias y paso siguiente
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;
  const R = () => O9.data.rewards;

  function render(root, params) {
    const entry = O9.progress.find(params.id);
    if (!entry) {
      root.innerHTML = `<div class="empty"><div class="big">🤷</div><p>No encontramos ese tema.</p><a class="btn" href="#/">Volver al inicio</a></div>`;
      return;
    }
    const { topic, level, module: mod } = entry;
    let sessionXP = 0;
    const award = (key, kind, reason) => { sessionXP += O9.game.reward(kind, key, reason); };

    O9.progress.setLastRoute('#/leccion/' + topic.id);

    const prev = O9.progress.before(topic.id);
    const next = O9.progress.after(topic.id);

    root.innerHTML = `
      <div class="breadcrumb"><a href="#/">Inicio</a> › <a href="#/${mod.id}">${mod.name}</a> › <span>Nivel ${level.num}: ${esc(level.title)}</span></div>
      <header class="lesson-head">
        <span class="lh-icon">${topic.icon}</span>
        <div style="flex:1;min-width:220px">
          <h1>${esc(topic.title)}</h1>
          <div class="row" style="gap:6px;margin-top:6px">
            <span class="pill ${mod.id === 'word' ? '' : 'pill-green'}">${mod.icon} ${mod.name} · Nivel ${level.num}</span>
            <span class="pill pill-gray">⏱️ ${topic.minutes} min</span>
            <span data-status></span>
          </div>
        </div>
      </header>
      <nav class="stepper" aria-label="Etapas del tema">
        ${O9.ui.STAGES.map((s) => `<button class="step" data-stage="${s.id}"><span class="step-ico">${s.icon}</span><span>${s.label}</span></button>`).join('')}
      </nav>
      <section class="card lesson-pane" data-pane></section>
      <div class="lesson-nav">
        ${prev ? `<a class="btn btn-ghost" href="#/leccion/${prev.topic.id}">← ${esc(prev.topic.title)}</a>` : '<span></span>'}
        ${next ? `<a class="btn btn-ghost" href="#/leccion/${next.topic.id}">${esc(next.topic.title)} →</a>` : `<a class="btn btn-ghost" href="#/${mod.id}">Volver a ${mod.name} →</a>`}
      </div>`;

    const pane = $('[data-pane]', root);

    /** ¿Qué etapas se pueden abrir? (la navegación se desbloquea al avanzar) */
    function reachable(stage) {
      const t = O9.progress.topicState(topic.id);
      if (stage === 'learn') return true;
      if (stage === 'practice') return t.learn;
      if (stage === 'challenge') return t.practice;
      return t.challenge;
    }

    function paintStepper(current) {
      const t = O9.progress.topicState(topic.id);
      const done = { learn: t.learn, practice: t.practice, challenge: t.challenge, reward: t.done };
      $$('.step', root).forEach((b) => {
        const st = b.dataset.stage;
        b.classList.toggle('active', st === current);
        b.classList.toggle('done', done[st] && st !== current);
        b.disabled = !reachable(st);
        b.title = b.disabled ? 'Completa la etapa anterior para desbloquear' : '';
      });
      $('[data-status]', root).innerHTML = t.done ? '<span class="pill pill-green">✅ Completado</span>' : t.learn ? '<span class="pill pill-purple">◐ En progreso</span>' : '';
    }

    $$('.step', root).forEach((b) => (b.onclick = () => { if (!b.disabled) go(b.dataset.stage); }));

    function go(stage) {
      paintStepper(stage);
      pane.classList.remove('lesson-pane'); void pane.offsetWidth; pane.classList.add('lesson-pane');
      ({ learn: showLearn, practice: showPractice, challenge: showChallenge, reward: showReward })[stage]();
      const top = root.querySelector('.stepper').getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }

    /* ---------- 📚 Aprende ---------- */
    function showLearn() {
      pane.innerHTML = `<div class="pane-title"><span class="ico">📚</span><h2>Aprende</h2></div><div data-blocks></div>
        <div class="block-key" style="margin-top:18px"><span class="block-ico">📌</span><div><span class="block-label">En pocas palabras</span>${topic.summary}</div></div>
        <div class="row" style="margin-top:20px;justify-content:flex-end"><button class="btn btn-purple btn-lg" data-next>¡Entendido! Vamos a practicar 🎯</button></div>`;
      O9.blocks.render($('[data-blocks]', pane), topic.learn);
      $('[data-next]', pane).onclick = () => {
        if (!O9.progress.topicState(topic.id).learn) O9.progress.mark(topic.id, 'learn');
        award('learn:' + topic.id, 'learn', 'Lección leída');
        go('practice');
      };
    }

    /* ---------- 🎯 Practica ---------- */
    function showPractice() {
      pane.innerHTML = `<div class="pane-title"><span class="ico">🎯</span><h2>Practica</h2></div>
        <p class="muted">Responde con calma. Si te equivocas, te daremos una pista y un repaso. ¡Equivocarse también es aprender!</p><div data-quiz></div>`;
      O9.ex.renderQuiz($('[data-quiz]', pane), topic.practice, {
        review: topic.summary,
        doneLabel: 'Ver resultado ➜',
        onWrong: () => O9.progress.addError(topic.id),
        onAnswer: (q, res, i) => {
          if (res.correct) award(`practice:${topic.id}:${i}`, res.firstTry ? 'practiceFirstTry' : 'practiceRetry', res.firstTry ? '¡A la primera!' : 'Respuesta correcta');
        },
        onComplete: (sum) => {
          O9.progress.mark(topic.id, 'practice');
          const perfect = sum.firstTry === sum.total;
          pane.innerHTML = `<div class="pane-title"><span class="ico">🎯</span><h2>Práctica terminada</h2></div>
            <div class="reward" style="padding:6px 0">
              <div style="font-size:3.4rem">${perfect ? '🌟' : sum.correct === sum.total ? '👍' : '💪'}</div>
              <h3>${perfect ? '¡Perfecto, todo a la primera!' : `Acertaste ${sum.correct} de ${sum.total}`}</h3>
              <p class="muted">${perfect ? 'Estás listo para el reto.' : sum.correct === sum.total ? 'Algunas te costaron, pero lo lograste. ¡Así se aprende!' : 'Algunas preguntas necesitaron la solución. Si quieres, repasa la lección antes del reto.'}</p>
              <div class="row" style="justify-content:center">
                ${sum.correct < sum.total ? '<button class="btn btn-light" data-review>📚 Repasar la lección</button><button class="btn btn-light" data-again>🔁 Practicar otra vez</button>' : ''}
                <button class="btn btn-purple btn-lg" data-next>Ir al reto 🧠</button>
              </div>
            </div>`;
          $('[data-next]', pane).onclick = () => go('challenge');
          const rv = $('[data-review]', pane); if (rv) rv.onclick = () => go('learn');
          const ag = $('[data-again]', pane); if (ag) ag.onclick = () => go('practice');
        }
      });
    }

    /* ---------- 🧠 Reto ---------- */
    function showChallenge() {
      const ch = topic.challenge;
      pane.innerHTML = `<div class="pane-title"><span class="ico">🧠</span><h2>Reto</h2></div>
        <p class="muted">${ch.task ? 'Ahora hazlo tú en el simulador. La lista de requisitos se marca sola cuando los cumples.' : 'Estas preguntas son un poco más difíciles. ¡Tú puedes!'}</p>
        <div data-challenge></div><div data-after></div>`;
      const host = $('[data-challenge]', pane);
      const after = $('[data-after]', pane);
      const win = () => {
        O9.progress.mark(topic.id, 'challenge');
        award('challenge:' + topic.id, 'challenge', 'Reto superado');
        paintStepper('challenge');
        after.innerHTML = `<div class="row" style="justify-content:center;margin-top:18px"><button class="btn btn-gold btn-lg" data-reward>Reclamar recompensa 🏆</button></div>`;
        $('[data-reward]', after).onclick = () => go('reward');
        $('[data-reward]', after).scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      if (ch.task) {
        O9.tasks.render(host, ch.task, { onComplete: win });
      } else {
        O9.ex.renderQuiz(host, ch.questions, {
          review: topic.summary,
          doneLabel: 'Ver resultado ➜',
          onWrong: () => O9.progress.addError(topic.id),
          onComplete: (sum) => {
            const need = Math.ceil(sum.total * 0.6);
            if (sum.correct >= need) {
              host.innerHTML = `<div class="feedback ok"><h4>🎉 ¡Reto superado!</h4><p>Acertaste ${sum.correct} de ${sum.total}.</p></div>`;
              win();
            } else {
              host.innerHTML = `<div class="feedback review"><h4>Casi lo logras 💪</h4><p>Acertaste ${sum.correct} de ${sum.total}. Necesitas ${need} para superar el reto. Repasa la idea clave y vuelve a intentarlo: no pierdes nada.</p><p><b>📌 Recuerda:</b> ${topic.summary}</p></div>
                <div class="row" style="margin-top:12px"><button class="btn btn-light" data-review>📚 Repasar</button><button class="btn btn-purple" data-retry>🔁 Intentar de nuevo</button></div>`;
              $('[data-review]', host).onclick = () => go('learn');
              $('[data-retry]', host).onclick = () => showChallenge();
            }
          }
        });
      }
    }

    /* ---------- 🏆 Recompensa ---------- */
    function showReward() {
      const firstTime = !O9.progress.isDone(topic.id);
      if (firstTime) {
        O9.progress.mark(topic.id, 'done');
        O9.progress.log(topic.icon, `Completaste "${topic.title}"`);
      }
      award('topic:' + topic.id, 'topicComplete', 'Tema completado');
      O9.game.checkBadges();
      paintStepper('reward');
      const ls = O9.progress.levelStats(level);
      const info = O9.game.levelInfo();
      const recentBadges = O9.data.badges.filter((b) => { const d = O9.store.get().badges[b.id]; return d && Date.now() - d < 15000; });
      pane.innerHTML = `<div class="reward">
          <div class="reward-trophy">🏆</div>
          <h2>¡Tema completado!</h2>
          <p class="muted">${esc(topic.title)}</p>
          <div class="reward-xp">⭐ +${sessionXP} XP</div>
          ${recentBadges.length ? `<p><b>Nuevas insignias:</b></p><div class="reward-list">${recentBadges.map((b) => `<span class="pill pill-gold">${b.icon} ${esc(b.name)}</span>`).join('')}</div>` : ''}
          <div class="card" style="max-width:460px;margin:0 auto 18px;text-align:left">
            <div class="progress-label"><span>Nivel ${level.num}: ${esc(level.title)}</span><span>${ls.done}/${ls.total}</span></div>
            ${O9.ui.bar(ls.pct)}
            <div class="progress-label" style="margin-top:12px"><span>Tú: Nivel ${info.level.n} · ${esc(info.level.name)}</span><span>${info.pct}%</span></div>
            ${O9.ui.bar(info.pct, 'progress-purple')}
          </div>
          ${ls.complete && firstTime ? `<div class="feedback ok" style="max-width:460px;margin:0 auto 18px"><h4>🎉 ¡Terminaste el Nivel ${level.num} de ${mod.name}!</h4></div>` : ''}
          <div class="row" style="justify-content:center">
            <button class="btn btn-light" data-again>🔁 Repasar este tema</button>
            <a class="btn btn-light" href="#/${mod.id}">📚 Ver ${mod.name}</a>
            ${next ? `<a class="btn btn-green btn-lg" href="#/leccion/${next.topic.id}">Siguiente tema ➜</a>` : `<a class="btn btn-gold btn-lg" href="#/proyecto/${mod.id}">🏆 Ir al proyecto final</a>`}
          </div>
        </div>`;
      $('[data-again]', pane).onclick = () => go('learn');
      O9.ui.animateBars(pane);
      if (firstTime) O9.ui.confetti(140);
      if (next) O9.progress.setLastRoute('#/leccion/' + next.topic.id);
    }

    // Empezar en la primera etapa pendiente
    const t = O9.progress.topicState(topic.id);
    go(t.done || !t.learn ? 'learn' : !t.practice ? 'practice' : !t.challenge ? 'challenge' : 'reward');
  }

  O9.views.lesson = { render };
})(window.O9);
