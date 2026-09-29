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

  const DEMO_GROUPS = [{ code: 'K7P2QX', name: '9°A 2026', active: true }, { code: 'M4T9RB', name: '9°B 2026', active: true }];

  /* ---------- Vista ---------- */
  function render(root, params) {
    const demo = params && params.id === 'demo';
    const cloud = O9.cloud;
    const head = (extra = '') => `<div class="breadcrumb"><a href="#/">Inicio</a> › <span>Panel del docente</span></div>
      <div class="row-between"><div><h1 style="margin:0">👩‍🏫 Panel del docente</h1>
      <p class="muted" style="margin:4px 0 0">Tus grupos y el avance de tus estudiantes en Ofimática 9°.</p></div>${extra}</div>`;

    if (demo) {
      const students = demoStudents().map((s, i) => Object.assign(s, { groupCode: DEMO_GROUPS[i % 2].code, groupName: DEMO_GROUPS[i % 2].name }));
      return show(root, students, DEMO_GROUPS.map((g) => Object.assign({}, g)), true, head);
    }
    if (!cloud.enabled) {
      root.innerHTML = head() + `<section class="card center section" style="padding:28px"><div style="font-size:3rem">☁️</div><h2>Primero activa Firebase</h2>
        <p class="muted">Sigue la guía <b>FIREBASE.md</b>.</p><a class="btn btn-gold" href="#/docente/demo">👀 Ver demostración</a></section>`;
      return;
    }
    if (!cloud.ready) { root.innerHTML = head() + '<div class="empty"><div class="big">⏳</div><p>Conectando...</p></div>'; setTimeout(() => O9.router.refresh(), 700); return; }

    root.innerHTML = head() + '<div class="empty"><div class="big">⏳</div><p>Cargando tus grupos y estudiantes...</p></div>';
    Promise.all([cloud.myGroups(), cloud.listStudents()])
      .then(([groups, students]) => show(root, students, groups, false, head))
      .catch((e) => {
        root.innerHTML = head() + `<section class="card center section" style="padding:28px"><div style="font-size:3rem">⚠️</div><h2>No se pudo cargar el panel</h2>
          <p class="muted">${esc(cloud.errorText(e))}<br>Revisa que publicaste las reglas nuevas de <b>firestore.rules</b> (con la sección de <b>grupos</b>) y que entraste con Google.</p>
          <button class="btn" data-retry>🔄 Reintentar</button></section>`;
        $('[data-retry]', root).onclick = () => O9.router.refresh();
      });
  }

  const joinLink = (code) => location.href.split('#')[0] + '#/cuenta/' + code;

  function show(root, allStudents, groups, demo, head) {
    const cloud = O9.cloud;
    const codes = () => new Set(groups.map((g) => g.code));
    const mine = () => allStudents.filter((s) => codes().has(s.groupCode));
    let group = '', query = '', sortKey = 'name', sortDir = 1;

    const filtered = () => mine()
      .filter((s) => !group || s.groupCode === group)
      .filter((s) => !query || O9.util.norm(s.name + ' ' + s.email).includes(O9.util.norm(query)))
      .sort((a, b) => {
        const x = a[sortKey], y = b[sortKey];
        return (typeof x === 'number' || typeof y === 'number' ? (x || 0) - (y || 0) : String(x || '').localeCompare(String(y || ''), 'es')) * sortDir;
      });

    root.innerHTML = head(`<div class="row">
        ${demo ? '<span class="pill pill-gold">🧪 Demostración: datos inventados</span>' : '<button class="btn btn-sm btn-light" data-reload>🔄 Actualizar</button>'}
        <button class="btn btn-sm btn-green" data-csv>⬇️ Descargar CSV</button></div>`) + `
      <section class="card section" data-groups></section>
      <div class="row section" style="margin-top:16px" data-filters></div>
      <div data-body></div>`;

    const body = $('[data-body]', root);
    const reload = $('[data-reload]', root);
    if (reload) reload.onclick = () => O9.router.refresh();
    $('[data-csv]', root).onclick = () => exportCSV(filtered());

    /* ----- Mis grupos: crear, compartir código, abrir/cerrar, eliminar ----- */
    function drawGroups() {
      const box = $('[data-groups]', root);
      const count = (code) => allStudents.filter((s) => s.groupCode === code).length;
      box.innerHTML = `<div class="row-between"><h3 style="margin:0">👥 Mis grupos</h3>
          <form class="row" data-new style="gap:8px"><input class="input" data-gname maxlength="40" placeholder="Nombre del grupo, ej. 9°A 2026" style="min-width:220px">
          <button class="btn btn-sm btn-purple" type="submit">➕ Crear grupo</button></form></div>
        <p class="muted" style="font-size:.9rem;margin:8px 0 14px">Cada grupo tiene un <b>código</b>. Tus estudiantes lo escriben al crear su cuenta y quedan en ese grupo. Puedes compartir el código o el enlace directo.</p>
        ${groups.length ? `<div class="grid grid-auto">${groups.map((g) => `
          <div class="card" style="padding:14px;${g.active === false ? 'opacity:.7' : ''}">
            <div class="row-between"><b style="font-size:1.05rem">${esc(g.name)}</b>
              <span class="pill ${g.active === false ? 'pill-red">🔒 Cerrado' : 'pill-green">🟢 Abierto'}</span></div>
            <div style="font-family:ui-monospace,Consolas,monospace;font-size:1.9rem;font-weight:900;letter-spacing:.18em;color:var(--purple);margin:8px 0">${esc(g.code)}</div>
            <div class="muted" style="font-size:.85rem;margin-bottom:10px">${count(g.code)} estudiante${count(g.code) === 1 ? '' : 's'}</div>
            <div class="row" style="gap:6px">
              <button class="btn btn-sm btn-light" data-copy="${esc(g.code)}">📋 Copiar código</button>
              <button class="btn btn-sm btn-light" data-link="${esc(g.code)}">🔗 Copiar enlace</button>
              <button class="btn btn-sm btn-light" data-toggle="${esc(g.code)}">${g.active === false ? '🔓 Abrir' : '🔒 Cerrar'}</button>
              <button class="btn btn-sm btn-ghost" data-del="${esc(g.code)}" style="color:var(--red)">🗑️</button>
            </div></div>`).join('')}</div>`
        : '<div class="empty" style="padding:16px"><div class="big">👥</div><p>Aún no tienes grupos. Crea el primero arriba y comparte su código con tus estudiantes.</p></div>'}
        <p class="muted" style="font-size:.8rem;margin:10px 0 0">🔒 Un grupo <b>cerrado</b> no recibe estudiantes nuevos (los que ya están siguen igual).</p>`;

      const copy = async (text, what) => {
        try { await navigator.clipboard.writeText(text); O9.ui.toast(`${what} copiado`, 'success', '📋'); }
        catch (e) { O9.ui.modal({ emoji: '📋', title: what, html: `<p style="word-break:break-all;font-weight:800">${esc(text)}</p><p class="muted">Cópialo manualmente.</p>` }); }
      };
      $$('[data-copy]', box).forEach((b) => (b.onclick = () => copy(b.dataset.copy, 'Código')));
      $$('[data-link]', box).forEach((b) => (b.onclick = () => copy(joinLink(b.dataset.link), 'Enlace de registro')));
      $$('[data-toggle]', box).forEach((b) => (b.onclick = async () => {
        const g = groups.find((x) => x.code === b.dataset.toggle);
        const next = g.active === false;
        try { if (!demo) await cloud.setGroupActive(g.code, next); g.active = next; drawGroups(); }
        catch (e) { O9.ui.toast(esc(cloud.errorText(e)), 'error', '⚠️'); }
      }));
      $$('[data-del]', box).forEach((b) => (b.onclick = async () => {
        const g = groups.find((x) => x.code === b.dataset.del);
        const n = count(g.code);
        if (n > 0) {
          O9.ui.modal({ emoji: '🗑️', title: 'No se puede eliminar', html: `<p>El grupo <b>${esc(g.name)}</b> tiene ${n} estudiante(s). Si ya no quieres recibir más, usa <b>🔒 Cerrar</b>.</p>` });
          return;
        }
        if (!(await O9.ui.confirm('¿Eliminar grupo?', `Se eliminará el grupo <b>${esc(g.name)}</b> y su código dejará de funcionar.`, 'Eliminar'))) return;
        try { if (!demo) await cloud.deleteGroup(g.code); groups.splice(groups.indexOf(g), 1); drawGroups(); drawFilters(); draw(); }
        catch (e) { O9.ui.toast(esc(cloud.errorText(e)), 'error', '⚠️'); }
      }));
      $('[data-new]', box).onsubmit = async (e) => {
        e.preventDefault();
        const input = $('[data-gname]', box);
        const name = input.value.trim();
        if (!name) { input.focus(); return O9.ui.toast('Escribe el nombre del grupo', 'error', '✏️'); }
        try {
          const g = demo ? { code: Math.random().toString(36).slice(2, 8).toUpperCase(), name, active: true } : await cloud.createGroup(name);
          groups.push(g);
          groups.sort((a, b) => a.name.localeCompare(b.name, 'es'));
          drawGroups(); drawFilters(); draw();
          O9.ui.modal({ emoji: '🎉', title: `Grupo "${name}" creado`, html: `<p>Comparte este código con tus estudiantes:</p>
            <div style="font-family:ui-monospace,Consolas,monospace;font-size:2.4rem;font-weight:900;letter-spacing:.2em;color:var(--purple)">${esc(g.code)}</div>
            <p class="muted" style="font-size:.9rem">O envíales este enlace (ya trae el código):<br><b style="word-break:break-all">${esc(joinLink(g.code))}</b></p>` });
        } catch (err) { O9.ui.toast(esc(cloud.errorText(err)), 'error', '⚠️'); }
      };
    }

    function drawFilters() {
      const box = $('[data-filters]', root);
      if (group && !groups.some((g) => g.code === group)) group = '';
      box.innerHTML = `<label class="row" style="gap:6px;font-weight:800">Grupo:
          <select class="input" data-group style="min-width:150px;padding:8px 10px"><option value="">Todos mis grupos</option>${groups.map((g) => `<option value="${esc(g.code)}" ${g.code === group ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
        <input class="input" data-search placeholder="🔎 Buscar estudiante..." style="max-width:280px" value="${esc(query)}">`;
      $('[data-group]', box).onchange = (e) => { group = e.target.value; draw(); };
      $('[data-search]', box).oninput = O9.util.debounce((e) => { query = e.target.value; draw(); }, 200);
    }

    function draw() {
      const list = filtered();
      const n = list.length || 1;
      const avg = (k) => Math.round(list.reduce((a, s) => a + (s[k] || 0), 0) / n);
      const active = list.filter((s) => s.updatedAt && Date.now() - s.updatedAt < 7 * DAY).length;
      const complete = list.filter((s) => s.courseComplete).length;
      const byGroup = groups.map((g) => { const m = mine().filter((s) => s.groupCode === g.code); return Math.round(m.reduce((a, s) => a + (s.progress || 0), 0) / (m.length || 1)); });
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
          <div class="chart-box">${O9.charts.svg('bar', { title: 'Progreso promedio por grupo (%)', labels: groups.map((g) => g.name), values: byGroup })}</div>
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
            <thead><tr>${col('name', 'Estudiante')}${col('groupName', 'Grupo')}${col('level', 'Nivel')}${col('xp', 'XP')}${col('progress', 'Progreso')}${col('topicsDone', 'Temas')}${col('challengesDone', 'Retos')}${col('badges', 'Insignias')}<th>Proyectos</th>${col('updatedAt', 'Última actividad')}</tr></thead>
            <tbody>${list.map((s) => `<tr data-uid="${esc(s.uid)}" tabindex="0" title="Ver detalle">
              <td><b>${esc(s.name || '(sin nombre)')}</b><br><small class="muted">${esc(s.email || '')}</small></td>
              <td>${esc(s.groupName || '—')}</td>
              <td>${O9.data.levels[(s.level || 1) - 1].icon} ${s.level || 1}</td>
              <td class="num">${fmtNum(s.xp || 0, 0)}</td>
              <td style="min-width:130px">${O9.ui.bar(s.progress || 0, 'progress-sm')}<small>${s.progress || 0}%</small></td>
              <td class="num">${s.topicsDone || 0}/52</td>
              <td class="num">${s.challengesDone || 0}/10</td>
              <td class="num">${s.badges || 0}</td>
              <td>${s.projectWord ? '📝✅' : '📝—'} ${s.projectExcel ? '📊✅' : '📊—'}</td>
              <td>${s.updatedAt ? timeAgo(s.updatedAt) : '—'}</td></tr>`).join('') || `<tr><td colspan="10" class="center muted" style="padding:24px">${groups.length ? 'Todavía no hay estudiantes en este grupo. Comparte el código para que se registren.' : 'Crea un grupo para empezar.'}</td></tr>`}</tbody>
          </table></div>
        </section>`;

      $$('[data-sort]', body).forEach((b) => (b.onclick = () => {
        const k = b.dataset.sort;
        sortDir = sortKey === k ? -sortDir : (k === 'name' || k === 'course' ? 1 : -1);
        sortKey = k;
        draw();
      }));
      $$('tr[data-uid]', body).forEach((tr) => {
        const open = () => detail(allStudents.find((s) => s.uid === tr.dataset.uid));
        tr.onclick = open;
        tr.onkeydown = (e) => { if (e.key === 'Enter') open(); };
      });
    }

    drawGroups();
    drawFilters();
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
      html: `<p class="muted" style="margin-top:-6px">${esc(s.email || '')} · 👥 ${esc(s.groupName || s.course || '')}</p>
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
    const cols = [['name', 'Estudiante'], ['email', 'Correo'], ['groupName', 'Grupo'], ['level', 'Nivel'], ['xp', 'XP'], ['points', 'Puntos'], ['progress', 'Progreso (%)'], ['topicsDone', 'Temas completados'], ['challengesDone', 'Retos superados'], ['badges', 'Insignias'], ['projectWord', 'Proyecto Word'], ['projectExcel', 'Proyecto Excel'], ['courseComplete', 'Curso completo'], ['diagnostic', 'Diagnóstico'], ['updatedAt', 'Última actividad']];
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
