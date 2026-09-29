/**
 * VISTA: PANEL DEL DOCENTE (#/docente)
 * Avance de todos los estudiantes registrados en Firebase:
 * resumen del grupo, gráficos por curso y nivel, temas más difíciles,
 * tabla ordenable con filtros, detalle por estudiante y exportación a CSV.
 *
 * Acceso: solo cuentas que estén en la colección "docentes" de Firestore
 * (lo exigen las reglas de seguridad, no solo esta pantalla).
 * Incluye un modo de demostración con datos inventados para conocer el panel.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$, fmtNum, timeAgo } = O9.util;
  const DAY = 86400000;

  /* ---------- Cálculos a partir del estado guardado de cada estudiante ---------- */
  const allTopics = () => ['word', 'excel'].flatMap((m) => O9.data.modules[m].levels.flatMap((l) => l.topics.map((t) => ({ t, l, m }))));

  function levelPct(state, level) {
    if (!state) return 0;
    const done = level.topics.filter((t) => (state.topics[t.id] || {}).done).length;
    return Math.round((done / level.topics.length) * 100);
  }

  /** Temas con más errores en el grupo (dónde reforzar en clase). */
  function hardTopics(students) {
    const stats = {};
    students.forEach((s) => {
      if (!s.state) return;
      Object.entries(s.state.topics || {}).forEach(([id, t]) => {
        const x = (stats[id] = stats[id] || { errors: 0, tried: 0, done: 0 });
        x.tried++;
        x.errors += t.errors || 0;
        if (t.done) x.done++;
      });
    });
    const byId = Object.fromEntries(allTopics().map((x) => [x.t.id, x]));
    return Object.entries(stats)
      .filter(([id, x]) => byId[id] && x.tried > 0)
      .map(([id, x]) => Object.assign({ id, avg: x.errors / x.tried }, x, byId[id]))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6);
  }

  /* ---------- Datos de demostración ---------- */
  function demoStudents() {
    const names = ['Valentina Rojas', 'Santiago Pérez', 'Mariana López', 'Juan David Gómez', 'Isabella Torres', 'Samuel Castro', 'Sofía Ramírez', 'Mateo Herrera', 'Luciana Díaz', 'Tomás Vargas', 'Gabriela Moreno', 'Nicolás Ruiz', 'Antonella Suárez', 'Emiliano Ortiz', 'Sara Jiménez', 'Daniel Mendoza', 'Camila Restrepo', 'Andrés Cárdenas'];
    const topics = allTopics();
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    return names.map((name, i) => {
      const course = i % 2 ? '9°B' : '9°A';
      const reach = Math.floor(rnd() * topics.length);
      const state = { topics: {}, challenges: {}, badges: {}, projects: {}, profile: { name, course }, xp: 0, points: 0, diagnostic: null };
      topics.forEach((x, k) => {
        if (k < reach) {
          const hard = /x3-7|x2-5|w2-5|x4-2|w3-3|x3-6/.test(x.t.id);
          state.topics[x.t.id] = { learn: true, practice: true, challenge: true, done: true, errors: Math.floor(rnd() * (hard ? 6 : 2)) };
        } else if (k === reach) state.topics[x.t.id] = { learn: true, errors: Math.floor(rnd() * 3) };
      });
      const chDone = Math.min(10, Math.floor((reach / topics.length) * 10 + rnd() * 2));
      O9.data.challenges.slice(0, chDone).forEach((c) => (state.challenges[c.id] = { done: true }));
      const pw = reach > 40, pe = reach > 46;
      if (pw) state.projects.word = { done: true };
      if (pe) state.projects.excel = { done: true };
      state.xp = reach * 62 + chDone * 80 + (pw ? 300 : 0) + (pe ? 300 : 0);
      state.points = Math.round(state.xp * 0.7);
      for (let b = 0; b < Math.floor(reach / 4) + chDone; b++) state.badges['b' + b] = 1;
      state.diagnostic = { band: ['Básico', 'Intermedio', 'Avanzado'][Math.floor(rnd() * 3)] };
      const pct = Math.round((reach / topics.length) * 80 + (chDone / 10) * 10 + ((pw ? 1 : 0) + (pe ? 1 : 0)) * 5);
      return {
        uid: 'demo' + i, name, course, email: O9.util.norm(name.split(' ')[0]) + '@colegio.edu.co',
        xp: state.xp, points: state.points, level: O9.game.levelInfo(state.xp).level.n, progress: pct,
        topicsDone: reach, challengesDone: chDone, badges: Object.keys(state.badges).length,
        courseComplete: pw && pe, projectWord: pw, projectExcel: pe, diagnostic: state.diagnostic.band,
        updatedAt: Date.now() - Math.floor(rnd() * 12) * DAY - Math.floor(rnd() * 20) * 3600000, state
      };
    });
  }

  /* ---------- Vista ---------- */
  function render(root, params) {
    const demo = params && params.id === 'demo';
    const cloud = O9.cloud;
    const head = (extra = '') => `<div class="breadcrumb"><a href="#/">Inicio</a> › <span>Panel del docente</span></div>
      <div class="row-between"><div><h1 style="margin:0">👩‍🏫 Panel del docente</h1>
      <p class="muted" style="margin:4px 0 0">El avance de tus estudiantes en Ofimática 9°.</p></div>${extra}</div>`;

    if (demo) return show(root, demoStudents(), true, head);

    const gate = (html) => {
      root.innerHTML = head() + `<section class="card center section" style="padding:28px">${html}
        <p style="margin-top:16px"><a class="btn btn-gold" href="#/docente/demo">👀 Ver una demostración con datos de ejemplo</a></p></section>`;
    };
    if (!cloud.enabled) return gate('<div style="font-size:3rem">☁️</div><h2>Primero activa Firebase</h2><p class="muted">El panel muestra a los estudiantes registrados. Sigue la guía <b>FIREBASE.md</b> para activar las cuentas.</p>');
    if (!cloud.ready) { root.innerHTML = head() + '<div class="empty"><div class="big">⏳</div><p>Conectando...</p></div>'; setTimeout(() => O9.router.refresh(), 700); return; }
    if (!cloud.user) return gate('<div style="font-size:3rem">🔐</div><h2>Inicia sesión como docente</h2><p class="muted">Usa la cuenta de Google con la que te registraron como docente.</p><a class="btn" href="#/cuenta">Iniciar sesión</a>');

    root.innerHTML = head() + '<div class="empty"><div class="big">⏳</div><p>Cargando estudiantes...</p></div>';
    cloud.isTeacher().then(async (ok) => {
      if (!ok) return gate(`<div style="font-size:3rem">🚫</div><h2>Esta cuenta no es de docente</h2><p class="muted">La cuenta <b>${esc(cloud.user.email)}</b> no está en la lista de docentes. Pide al administrador que agregue tu correo en Firestore → colección <b>docentes</b> (ver FIREBASE.md).</p>`);
      try {
        const list = await cloud.listStudents();
        show(root, list, false, head);
      } catch (e) {
        gate(`<div style="font-size:3rem">⚠️</div><h2>No se pudieron leer los estudiantes</h2><p class="muted">${esc(cloud.errorText(e))}<br>Revisa que publicaste las reglas nuevas de <b>firestore.rules</b> y que entraste con Google (correo verificado).</p>`);
      }
    });
  }

  function show(root, students, demo, head) {
    const courses = [...new Set(students.map((s) => s.course || 'Sin curso'))].sort();
    let course = '', query = '', sortKey = 'name', sortDir = 1;

    const filtered = () => students
      .filter((s) => !course || (s.course || 'Sin curso') === course)
      .filter((s) => !query || O9.util.norm(s.name + ' ' + s.email).includes(O9.util.norm(query)))
      .sort((a, b) => {
        const x = a[sortKey], y = b[sortKey];
        return (typeof x === 'number' || typeof y === 'number' ? (x || 0) - (y || 0) : String(x || '').localeCompare(String(y || ''), 'es')) * sortDir;
      });

    root.innerHTML = head(`<div class="row">
        ${demo ? '<span class="pill pill-gold">🧪 Demostración: datos inventados</span>' : '<button class="btn btn-sm btn-light" data-reload>🔄 Actualizar</button>'}
        <button class="btn btn-sm btn-green" data-csv>⬇️ Descargar CSV</button></div>`) + `
      <div class="row section" style="margin-top:16px">
        <label class="row" style="gap:6px;font-weight:800">Curso:
          <select class="input" data-course style="min-width:120px;padding:8px 10px"><option value="">Todos</option>${courses.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label>
        <input class="input" data-search placeholder="🔎 Buscar estudiante..." style="max-width:280px">
      </div>
      <div data-body></div>`;

    const body = $('[data-body]', root);

    function draw() {
      const list = filtered();
      const n = list.length || 1;
      const avg = (k) => Math.round(list.reduce((a, s) => a + (s[k] || 0), 0) / n);
      const active = list.filter((s) => s.updatedAt && Date.now() - s.updatedAt < 7 * DAY).length;
      const complete = list.filter((s) => s.courseComplete).length;
      const byCourse = courses.map((c) => { const g = students.filter((s) => (s.course || 'Sin curso') === c); return Math.round(g.reduce((a, s) => a + (s.progress || 0), 0) / (g.length || 1)); });
      const byLevel = O9.data.levels.map((l) => list.filter((s) => s.level === l.n).length);
      const hard = hardTopics(list);
      const col = (key, label) => `<th><button data-sort="${key}">${label} ${sortKey === key ? (sortDir > 0 ? '▲' : '▼') : ''}</button></th>`;

      body.innerHTML = `
        <div class="grid grid-5 section">
          ${stat('👥', list.length, 'Estudiantes')}
          ${stat('📊', avg('progress') + '%', 'Progreso promedio')}
          ${stat('⭐', fmtNum(avg('xp'), 0), 'XP promedio')}
          ${stat('🟢', active, 'Activos (7 días)')}
          ${stat('🏆', complete, 'Curso completado')}
        </div>
        ${list.length ? `
        <div class="grid grid-2 section">
          <div class="chart-box">${O9.charts.svg('bar', { title: 'Progreso promedio por curso (%)', labels: courses, values: byCourse })}</div>
          <div class="chart-box">${O9.charts.svg('bar', { title: 'Estudiantes por nivel', labels: O9.data.levels.map((l) => l.name.split(' ')[0]), values: byLevel })}</div>
        </div>
        <section class="card section">
          <h3>🧩 Temas donde más se equivocan</h3>
          <p class="muted" style="margin-top:-4px;font-size:.9rem">Promedio de errores por estudiante que lo intentó. Buenos candidatos para repasar en clase.</p>
          ${hard.length ? hard.map((h) => `<div class="lvl-row" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr) 120px">
              <span>${h.t.icon} ${esc(h.t.title)} <small class="muted">(${h.m === 'word' ? 'Word' : 'Excel'} · Nv ${h.l.num})</small></span>
              ${O9.ui.bar(Math.min(100, Math.round(h.avg * 20)), 'progress-sm progress-gold')}
              <span>${h.avg.toFixed(1)} errores · ${h.done}/${h.tried} ✓</span></div>`).join('') : '<p class="muted">Aún no hay suficientes datos.</p>'}
        </section>` : ''}
        <section class="card section" style="padding:0;overflow:hidden">
          <div class="mini-sheet-wrap"><table class="mini-sheet t-table">
            <thead><tr>${col('name', 'Estudiante')}${col('course', 'Curso')}${col('level', 'Nivel')}${col('xp', 'XP')}${col('progress', 'Progreso')}${col('topicsDone', 'Temas')}${col('challengesDone', 'Retos')}${col('badges', 'Insignias')}<th>Proyectos</th>${col('updatedAt', 'Última actividad')}</tr></thead>
            <tbody>${list.map((s) => `<tr data-uid="${esc(s.uid)}" tabindex="0" title="Ver detalle">
              <td><b>${esc(s.name || '(sin nombre)')}</b><br><small class="muted">${esc(s.email || '')}</small></td>
              <td>${esc(s.course || '—')}</td>
              <td>${O9.data.levels[(s.level || 1) - 1].icon} ${s.level || 1}</td>
              <td class="num">${fmtNum(s.xp || 0, 0)}</td>
              <td style="min-width:130px">${O9.ui.bar(s.progress || 0, 'progress-sm')}<small>${s.progress || 0}%</small></td>
              <td class="num">${s.topicsDone || 0}/52</td>
              <td class="num">${s.challengesDone || 0}/10</td>
              <td class="num">${s.badges || 0}</td>
              <td>${s.projectWord ? '📝✅' : '📝—'} ${s.projectExcel ? '📊✅' : '📊—'}</td>
              <td>${s.updatedAt ? timeAgo(s.updatedAt) : '—'}</td></tr>`).join('') || '<tr><td colspan="10" class="center muted" style="padding:24px">No hay estudiantes con este filtro.</td></tr>'}</tbody>
          </table></div>
        </section>`;

      $$('[data-sort]', body).forEach((b) => (b.onclick = () => {
        const k = b.dataset.sort;
        sortDir = sortKey === k ? -sortDir : (k === 'name' || k === 'course' ? 1 : -1);
        sortKey = k;
        draw();
      }));
      $$('tr[data-uid]', body).forEach((tr) => {
        const open = () => detail(students.find((s) => s.uid === tr.dataset.uid));
        tr.onclick = open;
        tr.onkeydown = (e) => { if (e.key === 'Enter') open(); };
      });
    }

    $('[data-course]', root).onchange = (e) => { course = e.target.value; draw(); };
    $('[data-search]', root).oninput = O9.util.debounce((e) => { query = e.target.value; draw(); }, 200);
    const rl = $('[data-reload]', root);
    if (rl) rl.onclick = () => O9.router.refresh();
    $('[data-csv]', root).onclick = () => exportCSV(filtered());
    draw();
  }

  const stat = (icon, value, label) => `<div class="stat"><span class="stat-icon">${icon}</span><span class="stat-value">${value}</span><span class="stat-label">${esc(label)}</span></div>`;

  /** Ventana con el detalle de un estudiante: avance por nivel, retos y temas difíciles. */
  function detail(s) {
    if (!s) return;
    const st = s.state;
    const levels = ['word', 'excel'].map((m) => {
      const mod = O9.data.modules[m];
      return `<h4 style="margin:14px 0 6px;text-align:left">${mod.icon} ${mod.name}</h4>` + mod.levels.map((l) => {
        const p = levelPct(st, l);
        return `<div class="lvl-row" style="text-align:left"><span>Nv ${l.num}: ${esc(l.title)}</span>${O9.ui.bar(p, 'progress-sm')}<span>${p}%</span></div>`;
      }).join('');
    }).join('');
    const errs = st ? Object.entries(st.topics || {}).filter(([, t]) => t.errors).sort((a, b) => b[1].errors - a[1].errors).slice(0, 4) : [];
    const byId = Object.fromEntries(allTopics().map((x) => [x.t.id, x.t]));
    const challenges = st ? O9.data.challenges.filter((c) => (st.challenges[c.id] || {}).done) : [];
    O9.ui.modal({
      emoji: (st && st.profile && st.profile.avatar) || '🎒',
      title: s.name || 'Estudiante',
      html: `<p class="muted" style="margin-top:-6px">${esc(s.email || '')} · ${esc(s.course || '')}</p>
        <div class="row" style="justify-content:center;gap:6px">
          <span class="pill pill-purple">Nivel ${s.level || 1}</span><span class="pill pill-gold">${fmtNum(s.xp || 0, 0)} XP</span>
          <span class="pill pill-green">${s.progress || 0}% del curso</span>${s.diagnostic ? `<span class="pill pill-gray">Diagnóstico: ${esc(s.diagnostic)}</span>` : ''}
        </div>
        ${st ? levels : '<p class="muted">Sin detalle disponible.</p>'}
        <h4 style="margin:14px 0 6px;text-align:left">⚔️ Retos superados (${challenges.length}/10)</h4>
        <p style="text-align:left;font-size:.9rem">${challenges.map((c) => `${c.icon} ${esc(c.title)}`).join(' · ') || '<span class="muted">Ninguno todavía.</span>'}</p>
        <h4 style="margin:14px 0 6px;text-align:left">🧩 Donde más se equivocó</h4>
        <p style="text-align:left;font-size:.9rem">${errs.map(([id, t]) => byId[id] ? `${byId[id].icon} ${esc(byId[id].title)} (${t.errors})` : '').filter(Boolean).join(' · ') || '<span class="muted">Sin errores registrados.</span>'}</p>
        <p class="muted" style="font-size:.85rem">Proyecto Word: ${s.projectWord ? '✅ entregado' : 'pendiente'} · Proyecto Excel: ${s.projectExcel ? '✅ entregado' : 'pendiente'}</p>`,
      actions: [{ label: 'Cerrar', cls: 'btn-purple' }]
    });
  }

  /** CSV con separador ";" para que Excel en español lo abra directamente en columnas. */
  function exportCSV(list) {
    const cols = [['name', 'Estudiante'], ['email', 'Correo'], ['course', 'Curso'], ['level', 'Nivel'], ['xp', 'XP'], ['points', 'Puntos'], ['progress', 'Progreso (%)'], ['topicsDone', 'Temas completados'], ['challengesDone', 'Retos superados'], ['badges', 'Insignias'], ['projectWord', 'Proyecto Word'], ['projectExcel', 'Proyecto Excel'], ['courseComplete', 'Curso completo'], ['diagnostic', 'Diagnóstico'], ['updatedAt', 'Última actividad']];
    const cell = (v) => {
      if (typeof v === 'boolean') v = v ? 'Sí' : 'No';
      const t = String(v == null ? '' : v);
      return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    const rows = list.map((s) => cols.map(([k]) => cell(k === 'updatedAt' ? (s.updatedAt ? new Date(s.updatedAt).toLocaleString('es-CO') : '') : s[k])).join(';'));
    O9.util.download(`ofimatica9_estudiantes_${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + [cols.map((c) => c[1]).join(';')].concat(rows).join('\r\n'), 'text/csv;charset=utf-8');
  }

  O9.views.teacher = { render };
})(window.O9);
