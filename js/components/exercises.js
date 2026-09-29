/**
 * EJERCICIOS con retroalimentación.
 *
 * Tipos de pregunta:
 *  - mcq   : opción múltiple        { q, options:[html], answer:idx, why?:[html], explain }
 *  - tf    : verdadero / falso      { q, answer:true|false, explain }
 *  - fill  : escribir la respuesta  { q, accept:[...], mode:'formula'|'text'|'number', sheet?, expect?, requireFn? }
 *  - order : ordenar pasos          { q, items:[en orden correcto], explain }
 *  - match : relacionar columnas    { q, pairs:[[izq, der]], explain }
 *
 * Campos opcionales comunes: hint (pista tras el 1.er error), review (repaso tras el 2.º),
 * table (mini hoja de contexto), chart (gráfico de contexto), context (html).
 *
 * La filosofía: equivocarse está permitido. Después de cada error se da una pista,
 * luego un repaso del concepto y, al tercer intento, se muestra la solución explicada.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$, shuffle, norm } = O9.util;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const PRAISE = ['¡Correcto! 🎉', '¡Excelente! 🌟', '¡Muy bien! 💪', '¡Así se hace! 🚀', '¡Perfecto! ✅'];
  const ENCOURAGE = ['Casi... ¡inténtalo otra vez! 💡', 'No pasa nada, equivocarse es parte de aprender.', 'Revisa la pista y vuelve a intentarlo.'];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Normalización de fórmulas ---------- */
  const EN = { SUM: 'SUMA', AVERAGE: 'PROMEDIO', COUNT: 'CONTAR', COUNTA: 'CONTARA', IF: 'SI', COUNTIF: 'CONTAR.SI' };
  function normFormula(s) {
    let t = String(s || '').toUpperCase().replace(/\s+/g, '').replace(/\$/g, '').replace(/,/g, ';');
    t = t.replace(/[A-Z.]+(?=\()/g, (n) => EN[n] || n);
    if (t && !t.startsWith('=')) t = '=' + t;
    return t;
  }

  /** Construye una hoja a partir de filas (para evaluar fórmulas del estudiante). */
  function sheetFrom(rows) {
    const sh = new O9.formula.Sheet(rows.length + 2, Math.max(...rows.map((r) => r.length)) + 1);
    rows.forEach((r, ri) => r.forEach((v, ci) => sh.setRaw(O9.formula.refName(ci + 1, ri + 1), v == null ? '' : v)));
    return sh;
  }

  /** Revisa una respuesta de tipo "fill" y devuelve { ok, msg }. */
  function checkFill(q, answer) {
    const mode = q.mode || 'text';
    const raw = String(answer || '').trim();
    if (!raw) return { ok: false, msg: 'Escribe una respuesta antes de comprobar.' , empty: true };

    if (mode === 'formula') {
      const user = normFormula(raw);
      if (!raw.startsWith('=')) {
        // Si solo le faltó el "=", se lo explicamos
        if ((q.accept || []).some((a) => normFormula(a) === user)) {
          return { ok: false, msg: 'Tu fórmula está casi perfecta, pero <b>toda fórmula en Excel empieza con el signo =</b>. Sin él, Excel lo toma como texto.' };
        }
      }
      if ((q.accept || []).some((a) => normFormula(a) === user)) return { ok: true };
      // Evaluación flexible: otra fórmula que dé el mismo resultado también vale
      if (q.sheet && q.expect != null && raw.startsWith('=')) {
        const sh = sheetFrom(q.sheet);
        sh.setRaw('Z99', raw);
        const v = sh.value('Z99');
        if (O9.formula.isErr(v)) return { ok: false, msg: `Excel mostraría <b>${esc(v.code)}</b>. ${esc(v.msg)}` };
        const info = O9.formula.analyze(raw);
        if (typeof v === 'number' && Math.abs(v - q.expect) < 0.011) {
          if (q.requireFn && !info.functions.includes(q.requireFn)) {
            return { ok: false, msg: `Tu fórmula da el resultado correcto (${O9.util.fmtNum(v)}) 👏, pero en este ejercicio debes usar la función <b>${q.requireFn}</b>. Es más rápida y funciona aunque haya muchas celdas.` };
          }
          return { ok: true };
        }
        if (typeof v === 'number') {
          return { ok: false, msg: `Tu fórmula da <b>${O9.util.fmtNum(v)}</b>, pero el resultado esperado es <b>${O9.util.fmtNum(q.expect)}</b>. Revisa las celdas o el rango que usaste.` };
        }
      }
      return { ok: false, msg: raw.startsWith('=') ? 'Esa fórmula no es la correcta.' : 'Recuerda que las fórmulas empiezan con <b>=</b>.' };
    }

    if (mode === 'number') {
      const lit = O9.formula.parseLiteral(raw);
      const n = lit.kind === 'number' ? lit.value : NaN;
      const ok = (q.accept || []).some((a) => Math.abs(Number(a) - n) < (q.tolerance || 0.011));
      return { ok, msg: ok ? '' : isNaN(n) ? 'Escribe solo un número.' : `${O9.util.fmtNum(n)} no es el resultado correcto.` };
    }

    const ok = (q.accept || []).some((a) => norm(a) === norm(raw));
    return { ok, msg: ok ? '' : 'Esa no es la respuesta esperada.' };
  }

  /* ---------- Contexto visual de la pregunta ---------- */
  function contextHTML(q) {
    let html = '';
    if (q.context) html += `<div class="question-context">${q.context}</div>`;
    return html;
  }
  function renderContextBlocks(el, q) {
    const host = el.querySelector('[data-ctx]');
    if (!host) return;
    const list = [];
    if (q.table) list.push(Object.assign({ type: 'sheet' }, q.table));
    if (q.chart) list.push(Object.assign({ type: 'chart' }, q.chart));
    if (q.sheet && q.showSheet !== false && !q.table) list.push({ type: 'sheet', rows: q.sheet, hl: q.target ? [q.target] : [] });
    if (q.blocks) list.push(...q.blocks);
    if (list.length) O9.blocks.render(host, list);
  }

  /**
   * Pinta una pregunta. Llama a opts.onDone({ correct, firstTry, attempts }) al terminar.
   */
  function renderQuestion(container, q, opts = {}) {
    let attempts = 0;
    let finished = false;
    const el = document.createElement('div');
    el.className = 'question';
    const count = opts.total > 1 ? `<div class="question-count">Pregunta ${opts.index + 1} de ${opts.total}</div>` : '';
    el.innerHTML = `${count}<div class="question-text">${q.q}</div>${contextHTML(q)}<div data-ctx class="question-context"></div>
      <div data-body></div><div data-fb></div><div data-next class="row" style="margin-top:14px"></div>`;
    container.innerHTML = '';
    container.appendChild(el);
    renderContextBlocks(el, q);
    const body = $('[data-body]', el);
    const fb = $('[data-fb]', el);
    const next = $('[data-next]', el);

    /** Muestra retroalimentación tras cada intento. */
    function feedback(ok, specific) {
      attempts++;
      O9.game.recordAnswer(ok);
      if (ok) {
        fb.innerHTML = `<div class="feedback ok"><h4>${pick(PRAISE)}</h4>${q.explain ? `<p>${q.explain}</p>` : ''}</div>`;
        finish(true);
        return;
      }
      if (opts.onWrong) opts.onWrong(q);
      let html = `<div class="feedback bad"><h4>${attempts === 1 ? pick(ENCOURAGE) : 'Todavía no es correcto'}</h4>${specific ? `<p>${specific}</p>` : ''}`;
      if (attempts === 1 && q.hint) html += `<p>💡 <b>Pista:</b> ${q.hint}</p>`;
      html += '</div>';
      if (attempts === 2) {
        const rev = q.review || opts.review;
        if (rev) html += `<div class="feedback review"><h4>🔁 Repasemos</h4><p>${rev}</p></div>`;
        else if (q.hint) html += `<div class="feedback review"><p>💡 <b>Pista:</b> ${q.hint}</p></div>`;
      }
      if (attempts >= 3 || opts.noRetry) {
        html += `<div class="feedback info"><h4>✅ La respuesta correcta es:</h4><p>${solutionText()}</p>${q.explain ? `<p>${q.explain}</p>` : ''}
          <p class="muted" style="font-size:.9rem">Tranquilo: ahora que viste la explicación, en el próximo ejercicio te irá mejor.</p></div>`;
        fb.innerHTML = html;
        revealSolution();
        finish(false);
        return;
      }
      fb.innerHTML = html;
    }

    function finish(ok) {
      if (finished) return;
      finished = true;
      const res = { correct: ok, firstTry: ok && attempts === 1, attempts };
      if (opts.autoNext) { opts.onDone && opts.onDone(res); return; }
      const b = document.createElement('button');
      b.className = 'btn btn-purple';
      b.textContent = opts.nextLabel || 'Continuar ➜';
      b.onclick = () => opts.onDone && opts.onDone(res);
      next.appendChild(b);
      setTimeout(() => b.focus({ preventScroll: true }), 50);
    }

    let solutionText = () => '';
    let revealSolution = () => {};

    /* ----- Opción múltiple y verdadero/falso ----- */
    if (q.type === 'mcq' || q.type === 'tf' || !q.type) {
      let options, answerIdx, why;
      if (q.type === 'tf') {
        options = ['✔️ Verdadero', '❌ Falso'];
        answerIdx = q.answer ? 0 : 1;
        why = [];
      } else {
        const order = q.fixed ? q.options.map((_, i) => i) : shuffle(q.options.map((_, i) => i));
        options = order.map((i) => q.options[i]);
        answerIdx = order.indexOf(q.answer);
        why = order.map((i) => (q.why || [])[i]);
      }
      body.innerHTML = `<div class="options ${options.length === 2 || q.cols ? 'two-cols' : ''}">${options
        .map((o, i) => `<button class="option" data-i="${i}"><span class="opt-key">${LETTERS[i]}</span><span>${o}</span></button>`).join('')}</div>`;
      solutionText = () => options[answerIdx];
      revealSolution = () => {
        $$('.option', body).forEach((b) => (b.disabled = true));
        $(`.option[data-i="${answerIdx}"]`, body).classList.add('correct');
      };
      $$('.option', body).forEach((btn) => {
        btn.onclick = () => {
          if (finished) return;
          const i = +btn.dataset.i;
          if (i === answerIdx) {
            btn.classList.add('correct');
            $$('.option', body).forEach((b) => (b.disabled = true));
            feedback(true);
          } else {
            btn.classList.add('wrong');
            btn.disabled = true;
            feedback(false, why[i]);
          }
        };
      });
    }

    /* ----- Completar (texto, número o fórmula) ----- */
    else if (q.type === 'fill') {
      const isF = q.mode === 'formula';
      body.innerHTML = `<div class="fill-row">
        <input class="input ${isF ? 'mono' : ''}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
          placeholder="${esc(q.placeholder || (isF ? 'Escribe la fórmula, por ejemplo =...' : 'Escribe tu respuesta'))}" aria-label="Tu respuesta">
        <button class="btn">Comprobar</button></div>`;
      const input = $('input', body);
      const btn = $('button', body);
      solutionText = () => `<code>${esc(q.accept[0])}</code>`;
      revealSolution = () => { input.value = q.accept[0]; input.disabled = true; btn.disabled = true; input.classList.add('correct'); };
      const go = () => {
        if (finished) return;
        const r = checkFill(q, input.value);
        if (r.empty) { input.focus(); fb.innerHTML = `<div class="feedback info"><p>${r.msg}</p></div>`; return; }
        input.classList.remove('wrong', 'correct');
        void input.offsetWidth;
        if (r.ok) { input.classList.add('correct'); input.disabled = true; btn.disabled = true; feedback(true); }
        else { input.classList.add('wrong'); feedback(false, r.msg); }
      };
      btn.onclick = go;
      input.onkeydown = (e) => { if (e.key === 'Enter') go(); };
    }

    /* ----- Ordenar pasos ----- */
    else if (q.type === 'order') {
      let items = shuffle(q.items.map((t, i) => ({ t, i })));
      if (items.every((x, k) => x.i === k)) items = items.reverse();
      const draw = (marks) => {
        body.innerHTML = `<ol class="order-list">${items.map((it, k) => `<li class="order-item ${marks ? (it.i === k ? 'correct' : 'wrong') : ''}">
          <span class="order-num">${k + 1}</span><span class="order-text">${it.t}</span>
          <span class="order-btns"><button data-up="${k}" aria-label="Subir" ${k === 0 ? 'disabled' : ''}>▲</button><button data-down="${k}" aria-label="Bajar" ${k === items.length - 1 ? 'disabled' : ''}>▼</button></span></li>`).join('')}</ol>
          <div class="row" style="margin-top:12px"><button class="btn" data-check>Comprobar orden</button></div>`;
        $$('[data-up]', body).forEach((b) => (b.onclick = () => { const k = +b.dataset.up; [items[k - 1], items[k]] = [items[k], items[k - 1]]; draw(); }));
        $$('[data-down]', body).forEach((b) => (b.onclick = () => { const k = +b.dataset.down; [items[k + 1], items[k]] = [items[k], items[k + 1]]; draw(); }));
        $('[data-check]', body).onclick = () => {
          if (finished) return;
          const ok = items.every((it, k) => it.i === k);
          const good = items.filter((it, k) => it.i === k).length;
          draw(true);
          if (ok) { $$('button', body).forEach((b) => (b.disabled = true)); }
          feedback(ok, ok ? '' : `Tienes ${good} de ${items.length} en la posición correcta (en verde). Mueve los que están en rojo.`);
        };
      };
      solutionText = () => `<ol style="margin:0;padding-left:20px">${q.items.map((t) => `<li>${t}</li>`).join('')}</ol>`;
      revealSolution = () => { items = q.items.map((t, i) => ({ t, i })); draw(true); $$('button', body).forEach((b) => (b.disabled = true)); };
      draw();
    }

    /* ----- Relacionar columnas ----- */
    else if (q.type === 'match') {
      const rights = shuffle(q.pairs.map((p) => p[1]));
      body.innerHTML = `<div>${q.pairs.map((p, i) => `<div class="match-row"><div class="match-left">${p[0]}</div>
        <select class="input" data-i="${i}"><option value="">Elige...</option>${rights.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select></div>`).join('')}</div>
        <div class="row" style="margin-top:12px"><button class="btn" data-check>Comprobar</button></div>`;
      solutionText = () => `<ul style="margin:0;padding-left:20px">${q.pairs.map((p) => `<li>${p[0]} → <b>${esc(p[1])}</b></li>`).join('')}</ul>`;
      revealSolution = () => $$('select', body).forEach((s) => { s.value = q.pairs[+s.dataset.i][1]; s.disabled = true; s.className = 'input correct'; });
      $('[data-check]', body).onclick = () => {
        if (finished) return;
        let good = 0, empty = false;
        $$('select', body).forEach((s) => {
          const ok = s.value === q.pairs[+s.dataset.i][1];
          if (!s.value) empty = true;
          if (ok) good++;
          s.className = 'input ' + (ok ? 'correct' : 'wrong');
        });
        if (empty && good < q.pairs.length) { fb.innerHTML = '<div class="feedback info"><p>Completa todas las parejas antes de comprobar.</p></div>'; return; }
        const ok = good === q.pairs.length;
        if (ok) $$('select, button', body).forEach((s) => (s.disabled = true));
        feedback(ok, ok ? '' : `Tienes ${good} de ${q.pairs.length} parejas correctas.`);
      };
    }
    return el;
  }

  /**
   * Serie de preguntas. opts: { onAnswer(q, res, i), onComplete(summary), review, doneLabel }
   */
  function renderQuiz(container, questions, opts = {}) {
    let i = 0;
    const results = [];
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="progress progress-sm progress-purple" style="margin-bottom:16px"><span style="width:0"></span></div><div data-q></div>`;
    container.innerHTML = '';
    container.appendChild(wrap);
    const bar = $('.progress > span', wrap);
    const host = $('[data-q]', wrap);
    const show = () => {
      bar.style.width = (i / questions.length) * 100 + '%';
      renderQuestion(host, questions[i], {
        index: i, total: questions.length, review: opts.review, onWrong: opts.onWrong,
        nextLabel: i === questions.length - 1 ? (opts.doneLabel || 'Terminar ➜') : 'Siguiente pregunta ➜',
        onDone: (res) => {
          results.push(res);
          if (opts.onAnswer) opts.onAnswer(questions[i], res, i);
          i++;
          if (i < questions.length) { show(); host.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
          else {
            bar.style.width = '100%';
            const summary = {
              total: questions.length,
              correct: results.filter((r) => r.correct).length,
              firstTry: results.filter((r) => r.firstTry).length,
              results
            };
            opts.onComplete && opts.onComplete(summary);
          }
        }
      });
    };
    show();
  }

  O9.ex = { renderQuestion, renderQuiz, checkFill, normFormula };
})(window.O9);
