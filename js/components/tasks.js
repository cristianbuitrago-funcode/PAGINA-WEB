/**
 * TAREAS PRÁCTICAS con simulador + lista de requisitos que se revisa sola.
 * Se usan en los retos de las lecciones, en la sección Retos, en el laboratorio
 * y en los proyectos finales.
 *
 * task = {
 *   type: 'word' | 'excel',
 *   instructions: ['paso 1', 'paso 2'] | 'html',
 *   sim: { ...opciones del simulador },
 *   checks: [ ...requisitos (ver engine/word-checks.js y engine/excel-checks.js) ],
 *   expected: 'html con el resultado esperado' (opcional),
 *   success: 'mensaje al terminar' (opcional)
 * }
 * opts = { onComplete(sim), onChange(sim), restore: datos guardados, submitLabel, compact }
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;

  function render(container, task, opts = {}) {
    let completed = false;
    let revealed = false;
    const wrap = document.createElement('div');
    wrap.className = 'task' + (opts.compact ? ' task-wide' : '');
    const instr = Array.isArray(task.instructions)
      ? `<ol>${task.instructions.map((i) => `<li>${i}</li>`).join('')}</ol>`
      : task.instructions || '';
    wrap.innerHTML = `
      <div data-sim></div>
      <aside class="task-side">
        <div class="task-instructions"><h4>🎯 ${esc(task.heading || 'Tu misión')}</h4>${instr}</div>
        <div class="card" style="padding:14px">
          <div class="row-between" style="margin-bottom:10px"><b>✅ Requisitos</b><span class="pill pill-purple" data-count>0/${task.checks.length}</span></div>
          <ul class="checklist">${task.checks.map((c, i) => `<li data-i="${i}"><span class="ck"></span><div>${c.label}<small data-msg></small></div></li>`).join('')}</ul>
          <div class="row" style="margin-top:12px">
            <button class="btn btn-green btn-block" data-check>${esc(opts.submitLabel || 'Comprobar mi trabajo')}</button>
          </div>
          <div class="row" style="margin-top:8px;justify-content:center">
            ${task.expected ? '<button class="btn btn-ghost btn-sm" data-expected>👀 Ver resultado esperado</button>' : ''}
            <button class="btn btn-ghost btn-sm" data-reset>↺ Reiniciar</button>
          </div>
          <div data-fb></div>
        </div>
      </aside>`;
    container.innerHTML = '';
    container.appendChild(wrap);

    const simHost = $('[data-sim]', wrap);
    const fb = $('[data-fb]', wrap);
    let sim;

    function makeSim() {
      const simOpts = Object.assign({}, task.sim, { onChange: onChange });
      sim = task.type === 'excel' ? O9.ExcelSim.create(simHost, simOpts) : O9.WordSim.create(simHost, simOpts);
      return sim;
    }

    function run() {
      return task.type === 'excel' ? O9.checks.excel.run(sim, task.checks) : O9.checks.word.run(sim, task.checks);
    }

    /** Actualiza la lista de requisitos (en vivo). */
    function paint(results, showHints) {
      let ok = 0;
      results.forEach((r, i) => {
        const li = $(`li[data-i="${i}"]`, wrap);
        li.classList.toggle('ok', r.ok);
        li.classList.toggle('fail', !r.ok && showHints);
        $('.ck', li).textContent = r.ok ? '✓' : '';
        const small = $('[data-msg]', li);
        if (r.ok) { small.innerHTML = task.type === 'excel' && r.msg && showHints ? r.msg : ''; ok++; }
        else if (showHints) small.innerHTML = r.msg || (r.hint ? '💡 ' + r.hint : '');
        else small.innerHTML = '';
      });
      $('[data-count]', wrap).textContent = `${ok}/${results.length}`;
      return ok === results.length;
    }

    function onChange(s) {
      if (s) sim = s; // el simulador puede avisar antes de terminar de crearse
      if (!sim) return;
      const res = run();
      paint(res, revealed);
      if (opts.onChange) opts.onChange(sim);
    }

    $('[data-check]', wrap).onclick = () => {
      revealed = true;
      const res = run();
      const all = paint(res, true);
      if (task.type === 'excel') {
        sim.clearMarks();
        res.forEach((r) => { if (r.cells && r.cells.length && r.cells.length <= 12) sim.mark(r.cells, r.ok); });
      }
      if (all) {
        fb.innerHTML = `<div class="feedback ok"><h4>🎉 ¡Lo lograste!</h4><p>${task.success || 'Cumpliste todos los requisitos. Así mismo se hace en Word y Excel de verdad.'}</p></div>`;
        if (!completed) {
          completed = true;
          O9.game.recordAnswer(true);
          O9.ui.confetti(90);
          if (opts.onComplete) opts.onComplete(sim);
        }
      } else {
        const missing = res.filter((r) => !r.ok).length;
        O9.game.recordAnswer(false);
        fb.innerHTML = `<div class="feedback bad"><h4>Te ${missing === 1 ? 'falta 1 requisito' : `faltan ${missing} requisitos`}</h4><p>Mira las pistas en rojo debajo de cada requisito. ¡Equivocarse es parte de aprender!</p></div>`;
      }
    };

    const exp = $('[data-expected]', wrap);
    if (exp) exp.onclick = () => {
      O9.ui.modal({ emoji: '👀', title: 'Resultado esperado', html: `<div style="text-align:left">${task.expected}</div>`, actions: [{ label: 'Entendido', cls: 'btn-purple' }] });
    };
    $('[data-reset]', wrap).onclick = async () => {
      if (!(await O9.ui.confirm('¿Reiniciar la actividad?', 'Se borrará lo que hiciste en esta actividad.', 'Reiniciar'))) return;
      revealed = false;
      fb.innerHTML = '';
      makeSim();
      onChange();
      if (opts.onReset) opts.onReset();
    };

    makeSim();
    if (opts.restore) sim.load(opts.restore);
    onChange();
    return { get sim() { return sim; }, run, wrap };
  }

  O9.tasks = { render };
})(window.O9);
