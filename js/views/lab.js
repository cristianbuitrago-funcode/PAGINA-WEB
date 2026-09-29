/**
 * VISTA: LABORATORIO — modo "Aprende haciendo"
 * Simuladores completos de Word y Excel para practicar libremente,
 * con misiones cortas que se completan solas al cumplirlas.
 * Lo que el estudiante hace se guarda automáticamente.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;

  function render(root, params) {
    const app = params.app === 'excel' ? 'excel' : 'word';
    const missions = O9.data.lab[app];

    root.innerHTML = `
      <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Laboratorio</span></div>
      <div class="row-between">
        <div><h1>🧪 Laboratorio: aprende haciendo</h1>
        <p class="muted" style="margin:0">Practica sin miedo: aquí no hay notas. Todo lo que hagas se guarda solo. Completa misiones para ganar XP.</p></div>
      </div>
      <div class="tabs section" style="margin-top:14px">
        <a class="tab-btn ${app === 'word' ? 'on' : ''}" href="#/laboratorio/word" style="text-decoration:none">📝 Mini Word</a>
        <a class="tab-btn ${app === 'excel' ? 'on' : ''}" href="#/laboratorio/excel" style="text-decoration:none">📊 Mini Excel</a>
      </div>
      <div class="task">
        <div data-sim></div>
        <aside class="task-side">
          <div class="card" style="padding:14px">
            <div class="row-between" style="margin-bottom:10px"><b>🎯 Misiones</b><span class="pill pill-purple" data-count></span></div>
            <div class="lab-missions" data-missions></div>
            <div data-detail style="margin-top:12px"></div>
          </div>
          <div class="card" style="padding:14px;margin-top:12px">
            <b>${app === 'word' ? '💡 Ideas para practicar' : '💡 Prueba estas fórmulas'}</b>
            ${app === 'word'
              ? '<ul style="margin:8px 0 0;padding-left:18px;font-size:.9rem"><li>Escribe un cuento corto y dale formato.</li><li>Haz la portada de tu próximo trabajo.</li><li>Arma tu horario en una tabla.</li></ul>'
              : '<ul style="margin:8px 0 0;padding-left:18px;font-size:.9rem"><li><code>=SUMA(A1:A5)</code></li><li><code>=PROMEDIO(B2:D2)</code></li><li><code>=MAX(A1:A10)</code> · <code>=MIN(A1:A10)</code></li><li><code>=B2*20%</code></li><li><code>=SI(A1>=3;"Aprobó";"Reprobó")</code></li></ul>'}
            <button class="btn btn-sm btn-light" style="margin-top:12px" data-clear>🧽 Empezar en blanco</button>
          </div>
        </aside>
      </div>`;

    let selected = missions[0].id;
    const saveSoon = O9.util.debounce((sim) => O9.store.update((s) => { s.lab[app] = sim.serialize(); }), 500);

    const simOpts = app === 'word'
      ? { tabs: ['inicio', 'insertar', 'disposicion'], showHF: true, tall: true, title: 'Laboratorio', placeholder: 'Escribe lo que quieras y experimenta con los botones de arriba...', onChange: onChange }
      : { rows: 15, cols: 8, charts: true, title: 'Laboratorio', onChange: onChange };

    let sim = null;
    function onChange(s) {
      if (s) sim = s;
      if (!sim) return;
      saveSoon(sim);
      evaluate();
    }

    function run(m) {
      return app === 'word' ? O9.checks.word.run(sim, m.checks) : O9.checks.excel.run(sim, m.checks);
    }

    /** Revisa las misiones; las que se cumplan se completan y dan XP (una sola vez). */
    function evaluate() {
      missions.forEach((m) => {
        if (O9.store.get().lab.missions[m.id]) return;
        if (run(m).every((r) => r.ok)) {
          O9.store.update((s) => { s.lab.missions[m.id] = Date.now(); });
          O9.game.reward('labMission', 'lab:' + m.id, `Misión: ${m.title}`);
          O9.progress.log('🧪', `Misión del laboratorio: ${m.title}`);
          O9.game.checkBadges();
          O9.ui.confetti(60);
        }
      });
      paint();
    }

    function paint() {
      const done = O9.store.get().lab.missions;
      $('[data-count]', root).textContent = `${missions.filter((m) => done[m.id]).length}/${missions.length}`;
      $('[data-missions]', root).innerHTML = missions.map((m) => `<button class="mission ${done[m.id] ? 'done' : ''} ${m.id === selected ? 'on' : ''}" data-m="${m.id}">
        <span class="m-state">${done[m.id] ? '✓' : ''}</span><span>${m.icon} ${esc(m.title)}</span></button>`).join('');
      $$('[data-m]', root).forEach((b) => (b.onclick = () => { selected = b.dataset.m; paint(); }));
      const m = missions.find((x) => x.id === selected);
      const res = sim ? run(m) : [];
      $('[data-detail]', root).innerHTML = `<div class="task-instructions" style="margin:0"><h4>${m.icon} ${esc(m.title)}</h4><p style="margin:0 0 8px">${m.text}</p>
        <ul class="checklist">${res.map((r) => `<li class="${r.ok ? 'ok' : ''}"><span class="ck">${r.ok ? '✓' : ''}</span><div>${r.label}</div></li>`).join('')}</ul>
        ${done[m.id] ? '<p style="margin:8px 0 0;font-weight:800;color:var(--green)">✅ ¡Misión cumplida! +15 XP</p>' : ''}</div>`;
    }

    const host = $('[data-sim]', root);
    sim = app === 'word' ? O9.WordSim.create(host, simOpts) : O9.ExcelSim.create(host, simOpts);
    const saved = O9.store.get().lab[app];
    if (saved) sim.load(saved);
    paint();

    $('[data-clear]', root).onclick = async () => {
      if (!(await O9.ui.confirm('¿Empezar en blanco?', 'Se borrará lo que tienes en el laboratorio de ' + (app === 'word' ? 'Word' : 'Excel') + '.', 'Sí, limpiar'))) return;
      sim.clear();
      O9.store.update((s) => { s.lab[app] = null; });
      paint();
    };
  }

  O9.views.lab = { render };
})(window.O9);
