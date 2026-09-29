/**
 * VISTA: MIS TAREAS (#/tareas) — solo estudiantes
 * Tareas asignadas por el docente a su grupo: instrucciones, archivos para descargar,
 * entrega de archivos y calificación con retroalimentación.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;
  const H = () => O9.homework;

  const fmtDate = (ms) => new Date(ms).toLocaleString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  function dueText(t) {
    if (!t.due) return 'Sin fecha límite';
    const diff = t.due - Date.now();
    const days = Math.floor(diff / 86400000);
    if (diff < 0) return `Venció el ${fmtDate(t.due)}`;
    if (days === 0) return `⚠️ Vence hoy (${new Date(t.due).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })})`;
    if (days === 1) return '⚠️ Vence mañana';
    return `Vence en ${days} días · ${fmtDate(t.due)}`;
  }

  /** Lista de archivos con botón de descarga. */
  function fileList(files) {
    if (!files || !files.length) return '';
    return `<div class="file-list">${files.map((f) => `<button class="file-chip" data-dl='${esc(JSON.stringify(f))}' title="Descargar">
      <span>${H().fileIcon(f.name)}</span><span class="fc-name">${esc(f.name)}</span><small>${H().fmtSize(f.size)}</small><span>⬇️</span></button>`).join('')}</div>`;
  }
  function bindDownloads(root) {
    $$('[data-dl]', root).forEach((b) => (b.onclick = async () => {
      const f = JSON.parse(b.dataset.dl);
      b.disabled = true;
      const old = b.lastElementChild.textContent;
      b.lastElementChild.textContent = '⏳';
      try { await H().downloadFile(f); } catch (e) { O9.ui.toast(esc(O9.cloud.errorText(e)), 'error', '⚠️'); }
      b.disabled = false;
      b.lastElementChild.textContent = old;
    }));
  }

  function render(root) {
    const cloud = O9.cloud;
    const head = `<div class="breadcrumb"><a href="#/">Inicio</a> › <span>Mis tareas</span></div>
      <h1>📋 Mis tareas</h1><p class="muted">Las tareas que tu docente asignó a tu grupo <b>${esc((O9.store.get().group || {}).name || '')}</b>.</p>`;
    if (!cloud.enabled || !cloud.user) { root.innerHTML = head + '<div class="empty"><div class="big">🔐</div><p>Inicia sesión para ver tus tareas.</p><a class="btn" href="#/cuenta">Iniciar sesión</a></div>'; return; }
    root.innerHTML = head + '<div class="empty"><div class="big">⏳</div><p>Cargando tus tareas...</p></div>';

    Promise.all([H().myTasks(), H().mySubmissions()]).then(([tasks, subs]) => {
      const platform = tasks.filter((t) => t.kind === 'plataforma');
      const fileTasks = tasks.filter((t) => t.kind !== 'plataforma');
      const pending = fileTasks.filter((t) => !subs[t.id]);
      const done = fileTasks.filter((t) => subs[t.id]);
      root.innerHTML = head + (tasks.length ? `
        ${platform.length ? `<h2 class="section">🎮 Actividades de la plataforma</h2>
          <p class="muted" style="margin-top:-6px">Tu nota se calcula sola según el porcentaje que completes. Siempre se aproxima hacia abajo.</p>
          <div class="stack">${platform.map(platformCard).join('')}</div>` : ''}
        ${fileTasks.length ? `<div class="grid grid-3 section">
          <div class="stat"><span class="stat-icon">📌</span><span class="stat-value">${pending.length}</span><span class="stat-label">Por entregar</span></div>
          <div class="stat"><span class="stat-icon">📤</span><span class="stat-value">${done.length}</span><span class="stat-label">Entregadas</span></div>
          <div class="stat"><span class="stat-icon">✅</span><span class="stat-value">${done.filter((t) => subs[t.id].grade != null).length}</span><span class="stat-label">Calificadas</span></div>
        </div>` : ''}
        ${pending.length ? `<h2 class="section">📌 Por entregar</h2><div class="stack">${pending.map((t) => card(t, null)).join('')}</div>` : ''}
        ${done.length ? `<h2 class="section">📤 Entregadas</h2><div class="stack">${done.map((t) => card(t, subs[t.id])).join('')}</div>` : ''}`
        : '<div class="empty section"><div class="big">🎉</div><p>No tienes tareas asignadas por ahora.</p><a class="btn" href="#/">Seguir aprendiendo</a></div>');
      bindDownloads(root);
      $$('[data-open]', root).forEach((b) => (b.onclick = () => {
        const t = tasks.find((x) => x.id === b.dataset.open);
        openSubmit(root, t, subs[t.id]);
      }));
    }).catch((e) => {
      root.innerHTML = head + `<div class="feedback bad section"><h4>No se pudieron cargar las tareas</h4><p>${esc(cloud.errorText(e))}</p></div>`;
    });
  }

  const num = (v) => Number(v).toFixed(1).replace('.', ',');

  /** Tarjeta de una tarea de plataforma: avance, nota automática y lo que falta. */
  function platformCard(t) {
    const ev = O9.grading.evaluate(O9.store.get(), t);
    const complete = ev.ratio >= 1;
    const pill = complete ? '<span class="pill pill-green">✅ Completada</span>' : ev.closed ? '<span class="pill pill-red">🔒 Cerrada</span>' : '<span class="pill pill-gold">🎮 En progreso</span>';
    return `<article class="card hw-card platform ${complete ? 'graded' : ev.closed ? 'late-missing' : 'pending'}">
      <div class="row-between"><h3 style="margin:0">${esc(t.title)}</h3>${pill}</div>
      <p class="muted" style="margin:4px 0 10px;font-weight:700;font-size:.9rem">🗓️ ${dueText(t)} · ${esc(O9.grading.scopeLabel(t.scope || {}))}</p>
      ${t.description ? `<div class="hw-desc">${esc(t.description).replace(/\n/g, '<br>')}</div>` : ''}
      ${t.files && t.files.length ? `<p style="margin:10px 0 4px;font-weight:800;font-size:.9rem">📥 Material</p>${fileList(t.files)}` : ''}
      ${t.link ? `<p style="margin:10px 0 0"><a href="${esc(t.link)}" target="_blank" rel="noopener noreferrer">🔗 Abrir enlace del docente</a></p>` : ''}
      <div class="auto-grade">
        <div style="flex:1;min-width:200px">
          <div class="progress-label"><span>${ev.done} de ${ev.total} actividades</span><span>${ev.pct}%</span></div>
          ${O9.ui.bar(ev.pct, 'progress-lg')}
          <small class="muted">${O9.grading.scaleExamples(t.maxGrade)}${ev.closed ? ' · Solo cuenta lo completado antes del cierre.' : ''}</small>
        </div>
        <div class="grade-box"><small>${ev.closed ? 'Nota final' : 'Nota actual'}</small><b>${num(ev.grade)}</b><small>de ${num(t.maxGrade || 5)}</small></div>
      </div>
      ${!complete && !ev.closed && ev.pending.length ? `<p style="margin:12px 0 6px;font-weight:800;font-size:.9rem">📌 Te falta (${ev.pending.length}):</p>
        <div class="stack" style="gap:6px">${ev.pending.slice(0, 5).map((it) => `<a class="topic-link" href="${it.href}"><span class="topic-status">${it.icon}</span><span class="t-title">${esc(it.title)}</span><span class="t-meta">${esc(it.where)} · Ir ➜</span></a>`).join('')}
        ${ev.pending.length > 5 ? `<p class="muted" style="margin:4px 0 0;font-size:.85rem">...y ${ev.pending.length - 5} más.</p>` : ''}</div>` : ''}
    </article>`;
  }

  function card(t, sub) {
    const st = H().statusOf(t, sub);
    const graded = st.key === 'graded';
    return `<article class="card hw-card ${st.key}">
      <div class="row-between"><h3 style="margin:0">${esc(t.title)}</h3><span class="pill ${st.cls}">${st.icon} ${st.label}</span></div>
      <p class="muted" style="margin:4px 0 10px;font-weight:700;font-size:.9rem">🗓️ ${dueText(t)} · Nota máxima ${String(t.maxGrade || 5).replace('.', ',')}</p>
      ${t.description ? `<div class="hw-desc">${esc(t.description).replace(/\n/g, '<br>')}</div>` : ''}
      ${t.files && t.files.length ? `<p style="margin:10px 0 4px;font-weight:800;font-size:.9rem">📥 Material de la tarea</p>${fileList(t.files)}` : ''}
      ${t.link ? `<p style="margin:10px 0 0"><a href="${esc(t.link)}" target="_blank" rel="noopener noreferrer">🔗 Abrir enlace del docente</a></p>` : ''}
      ${sub ? `<div class="hw-sub">
          <p style="margin:0 0 6px;font-weight:800">📤 Tu entrega · <span class="muted">${fmtDate(sub.submittedAt)}</span></p>
          ${fileList(sub.files)}
          ${sub.comment ? `<p class="muted" style="margin:8px 0 0">💬 ${esc(sub.comment)}</p>` : ''}
        </div>` : ''}
      ${graded ? `<div class="feedback ok" style="margin-top:12px"><h4>✅ Calificación: <span style="font-size:1.4rem">${String(sub.grade).replace('.', ',')}</span> / ${String(t.maxGrade || 5).replace('.', ',')}</h4>${sub.feedback ? `<p>💬 <b>Tu docente dice:</b> ${esc(sub.feedback)}</p>` : ''}</div>` : ''}
      ${graded ? '' : `<div class="row" style="margin-top:12px"><button class="btn ${sub ? 'btn-light' : 'btn-green'}" data-open="${esc(t.id)}">${sub ? '🔁 Cambiar mi entrega' : '📤 Entregar tarea'}</button></div>`}
    </article>`;
  }

  /** Ventana para subir la entrega. */
  function openSubmit(root, task, previous) {
    const m = O9.ui.modal({
      emoji: '📤', title: previous ? 'Cambiar mi entrega' : 'Entregar tarea',
      html: `<p style="text-align:left"><b>${esc(task.title)}</b><br><span class="muted">${dueText(task)}</span></p>
        <label class="dropzone" style="text-align:left">
          <input type="file" multiple data-files hidden>
          <span style="font-size:2rem">📎</span>
          <b>Toca aquí para elegir tus archivos</b>
          <small class="muted">Word, Excel, PDF o imágenes · máximo 3 MB cada uno · hasta 5 archivos</small>
        </label>
        <div data-chosen style="text-align:left;margin-top:8px"></div>
        <textarea class="input" data-comment rows="2" maxlength="500" placeholder="Comentario para tu docente (opcional)" style="width:100%;margin-top:10px;resize:vertical"></textarea>
        ${previous ? '<p class="muted" style="font-size:.85rem;text-align:left">Tu entrega anterior se reemplazará por esta.</p>' : ''}
        <div data-err></div><div data-prog></div>`,
      actions: [
        { label: 'Cancelar', cls: 'btn-light' },
        { label: '📤 Entregar', cls: 'btn-green', keepOpen: true, onClick: (wrap) => send(wrap) }
      ]
    });
    let files = [];
    const input = $('[data-files]', m.el);
    input.onchange = () => {
      files = Array.from(input.files);
      $('[data-chosen]', m.el).innerHTML = files.map((f) => `<div class="file-chip" style="cursor:default"><span>${H().fileIcon(f.name)}</span><span class="fc-name">${esc(f.name)}</span><small>${H().fmtSize(f.size)}</small></div>`).join('');
      const err = H().validate(files);
      $('[data-err]', m.el).innerHTML = err ? `<div class="feedback bad">${esc(err)}</div>` : '';
    };
    let sending = false;
    async function send(wrap) {
      if (sending) return;
      const errBox = $('[data-err]', wrap);
      if (!files.length) { errBox.innerHTML = '<div class="feedback bad">Elige al menos un archivo.</div>'; return; }
      const err = H().validate(files);
      if (err) { errBox.innerHTML = `<div class="feedback bad">${esc(err)}</div>`; return; }
      sending = true;
      $$('.modal-actions button', wrap).forEach((b) => (b.disabled = true));
      const prog = $('[data-prog]', wrap);
      try {
        await H().submit(task, files, $('[data-comment]', wrap).value.trim(), previous, (p, name) => {
          prog.innerHTML = `<div class="progress-label"><span>Subiendo ${esc(name)}...</span><span>${Math.round(p * 100)}%</span></div>${O9.ui.bar(Math.round(p * 100))}`;
        });
        m.close();
        O9.ui.toast('¡Tarea entregada! Tu docente ya la puede ver.', 'success', '📤');
        O9.ui.confetti(80);
        render(root);
      } catch (e) {
        sending = false;
        $$('.modal-actions button', wrap).forEach((b) => (b.disabled = false));
        prog.innerHTML = '';
        errBox.innerHTML = `<div class="feedback bad">${esc(O9.cloud.errorText(e))}</div>`;
      }
    }
  }

  O9.views.homework = { render, fileList, bindDownloads, dueText, fmtDate };
})(window.O9);
