/**
 * PANEL DEL DOCENTE → pestaña TAREAS
 * Crear tareas (con archivos y enlace) para uno o varios grupos, abrirlas/cerrarlas,
 * ver las entregas de cada estudiante, descargar sus archivos y calificar con comentario.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;
  const H = () => O9.homework;
  const V = () => O9.views.homework;
  const num = (v) => String(v).replace('.', ',');

  /**
   * container: donde se pinta · groups: grupos del docente · students: estudiantes (de sus grupos)
   */
  function render(container, groups, students) {
    if (!groups.length) {
      container.innerHTML = '<div class="empty"><div class="big">📋</div><p>Primero crea un grupo en la pestaña <b>Estudiantes</b>. Las tareas se asignan a grupos.</p></div>';
      return;
    }
    let tasks = [];
    let filter = '';
    container.innerHTML = '<div class="empty"><div class="big">⏳</div><p>Cargando tareas...</p></div>';

    const load = () => H().tasksForGroups(groups.map((g) => g.code)).then(async (list) => {
      tasks = list;
      // Contar entregas de cada tarea
      await Promise.all(tasks.map(async (t) => { t._subs = await H().submissionsFor(t.id); }));
      drawList();
    }).catch((e) => {
      container.innerHTML = `<div class="feedback bad"><h4>No se pudieron cargar las tareas</h4><p>${esc(O9.cloud.errorText(e))}<br>Revisa que publicaste las reglas nuevas de Firestore (con <b>tareas</b>, <b>entregas</b> y <b>archivos</b>).</p></div>`;
    });

    function drawList() {
      const list = tasks.filter((t) => !filter || t.groupCode === filter);
      container.innerHTML = `
        <div class="row-between" style="margin-bottom:14px">
          <label class="row" style="gap:6px;font-weight:800">Grupo:
            <select class="input" data-tf style="min-width:150px;padding:8px 10px"><option value="">Todos</option>${groups.map((g) => `<option value="${esc(g.code)}" ${filter === g.code ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
          <button class="btn btn-purple" data-newtask>➕ Nueva tarea</button>
        </div>
        <div data-form></div>
        ${list.length ? `<div class="stack">${list.map(taskCard).join('')}</div>` : '<div class="empty"><div class="big">📋</div><p>Aún no hay tareas. Pulsa <b>➕ Nueva tarea</b> para asignar la primera.</p></div>'}`;
      $('[data-tf]', container).onchange = (e) => { filter = e.target.value; drawList(); };
      $('[data-newtask]', container).onclick = () => drawForm();
      V().bindDownloads(container);
      $$('[data-subs]', container).forEach((b) => (b.onclick = () => drawSubmissions(tasks.find((t) => t.id === b.dataset.subs))));
      $$('[data-active]', container).forEach((b) => (b.onclick = async () => {
        const t = tasks.find((x) => x.id === b.dataset.active);
        try { await H().setTaskActive(t.id, t.active === false); t.active = t.active === false; drawList(); }
        catch (e) { O9.ui.toast(esc(O9.cloud.errorText(e)), 'error', '⚠️'); }
      }));
      $$('[data-deltask]', container).forEach((b) => (b.onclick = async () => {
        const t = tasks.find((x) => x.id === b.dataset.deltask);
        if (!(await O9.ui.confirm('¿Eliminar tarea?', `Se borrará "<b>${esc(t.title)}</b>" con sus archivos y las <b>${t._subs.length}</b> entrega(s) de los estudiantes. No se puede deshacer.`, 'Eliminar'))) return;
        try { b.disabled = true; await H().deleteTask(t); tasks.splice(tasks.indexOf(t), 1); drawList(); O9.ui.toast('Tarea eliminada', '', '🗑️'); }
        catch (e) { b.disabled = false; O9.ui.toast(esc(O9.cloud.errorText(e)), 'error', '⚠️'); }
      }));
    }

    function taskCard(t) {
      const total = students.filter((s) => s.groupCode === t.groupCode).length;
      const sent = t._subs.length;
      const graded = t._subs.filter((s) => s.grade != null).length;
      return `<article class="card hw-card" style="${t.active === false ? 'opacity:.75' : ''}">
        <div class="row-between"><h3 style="margin:0">${esc(t.title)}</h3>
          <span class="pill ${t.active === false ? 'pill-red">🔒 Oculta' : 'pill-green">🟢 Visible'}</span></div>
        <p class="muted" style="margin:4px 0 8px;font-weight:700;font-size:.9rem">👥 ${esc(t.groupName)} · 🗓️ ${t.due ? V().fmtDate(t.due) : 'Sin fecha límite'} · Nota máx. ${num(t.maxGrade || 5)}</p>
        ${t.description ? `<div class="hw-desc">${esc(t.description).replace(/\n/g, '<br>')}</div>` : ''}
        ${V().fileList(t.files)}
        ${t.link ? `<p style="margin:8px 0 0"><a href="${esc(t.link)}" target="_blank" rel="noopener noreferrer">🔗 ${esc(t.link)}</a></p>` : ''}
        <div class="row" style="margin-top:12px">
          <span class="pill">📤 ${sent}/${total} entregas</span><span class="pill pill-green">✅ ${graded} calificadas</span>
          ${sent - graded > 0 ? `<span class="pill pill-gold">⏳ ${sent - graded} por calificar</span>` : ''}
        </div>
        <div class="row" style="margin-top:12px">
          <button class="btn btn-sm" data-subs="${esc(t.id)}">📥 Ver entregas y calificar</button>
          <button class="btn btn-sm btn-light" data-active="${esc(t.id)}">${t.active === false ? '👁️ Mostrar a estudiantes' : '🙈 Ocultar'}</button>
          <button class="btn btn-sm btn-ghost" data-deltask="${esc(t.id)}" style="color:var(--red)">🗑️ Eliminar</button>
        </div></article>`;
    }

    /* ---------- Crear tarea ---------- */
    function drawForm() {
      const box = $('[data-form]', container);
      const today = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      box.innerHTML = `<section class="card" style="margin-bottom:16px;border:2px solid var(--purple-100)">
        <h3>➕ Nueva tarea</h3>
        <form data-tform novalidate>
          <div class="form-row"><label>Para los grupos</label>
            <div class="row">${groups.map((g, i) => `<label class="pill pill-purple" style="cursor:pointer;padding:6px 12px"><input type="checkbox" value="${esc(g.code)}" ${(filter ? g.code === filter : i === 0) ? 'checked' : ''}> ${esc(g.name)}</label>`).join('')}</div></div>
          <div class="form-row"><label for="tTitle">Título</label><input id="tTitle" class="input" maxlength="100" placeholder="Ej. Portada y tabla de contenido"></div>
          <div class="form-row"><label for="tDesc">Instrucciones</label><textarea id="tDesc" class="input" rows="4" maxlength="3000" placeholder="Explica paso a paso qué deben hacer y qué deben entregar." style="resize:vertical"></textarea></div>
          <div class="grid grid-3" style="gap:10px">
            <div class="form-row"><label for="tDate">Fecha límite</label><input id="tDate" class="input" type="date" value="${today}"></div>
            <div class="form-row"><label for="tTime">Hora</label><input id="tTime" class="input" type="time" value="23:59"></div>
            <div class="form-row"><label for="tMax">Nota máxima</label><input id="tMax" class="input" type="number" min="1" max="100" step="0.1" value="5"></div>
          </div>
          <div class="form-row"><label for="tLink">Enlace (opcional)</label><input id="tLink" class="input" type="url" placeholder="https://... (video, Drive, página de apoyo)"></div>
          <div class="form-row"><label>Archivos para los estudiantes (opcional)</label>
            <label class="dropzone"><input type="file" multiple data-tfiles hidden><span style="font-size:1.6rem">📎</span><b>Toca para adjuntar guías, plantillas o ejemplos</b><small class="muted">Máximo 3 MB cada uno · hasta 5 archivos</small></label>
            <div data-tchosen style="margin-top:6px"></div></div>
          <div data-terr></div><div data-tprog></div>
          <div class="row"><button class="btn btn-green" type="submit">📋 Publicar tarea</button><button class="btn btn-light" type="button" data-cancel>Cancelar</button></div>
        </form></section>`;
      let files = [];
      const inp = $('[data-tfiles]', box);
      inp.onchange = () => {
        files = Array.from(inp.files);
        $('[data-tchosen]', box).innerHTML = files.map((f) => `<div class="file-chip" style="cursor:default"><span>${H().fileIcon(f.name)}</span><span class="fc-name">${esc(f.name)}</span><small>${H().fmtSize(f.size)}</small></div>`).join('');
      };
      $('[data-cancel]', box).onclick = () => (box.innerHTML = '');
      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('[data-tform]', box).onsubmit = async (e) => {
        e.preventDefault();
        const err = (m) => { $('[data-terr]', box).innerHTML = `<div class="feedback bad" style="margin-bottom:10px">${m}</div>`; };
        const chosen = $$('input[type=checkbox]:checked', box).map((c) => groups.find((g) => g.code === c.value));
        const title = $('#tTitle', box).value.trim();
        const date = $('#tDate', box).value;
        const time = $('#tTime', box).value || '23:59';
        const maxGrade = parseFloat($('#tMax', box).value) || 5;
        const link = $('#tLink', box).value.trim();
        if (!chosen.length) return err('Elige al menos un grupo.');
        if (!title) return err('Escribe el título de la tarea.');
        if (link && !/^https?:\/\//i.test(link)) return err('El enlace debe empezar por https://');
        const fErr = H().validate(files);
        if (fErr) return err(esc(fErr));
        const due = date ? new Date(`${date}T${time}`).getTime() : null;
        $$('button', box).forEach((b) => (b.disabled = true));
        const prog = $('[data-tprog]', box);
        try {
          for (let i = 0; i < chosen.length; i++) {
            const g = chosen[i];
            const t = await H().createTask({ groupCode: g.code, groupName: g.name, title, description: $('#tDesc', box).value.trim(), due, maxGrade, link }, files, (p, name) => {
              prog.innerHTML = `<div class="progress-label"><span>${esc(g.name)}: subiendo ${esc(name)}...</span><span>${Math.round(p * 100)}%</span></div>${O9.ui.bar(Math.round(p * 100))}`;
            });
            t._subs = [];
            tasks.push(t);
          }
          tasks.sort((a, b) => (a.due || Infinity) - (b.due || Infinity));
          O9.ui.toast(`Tarea publicada para ${chosen.map((g) => esc(g.name)).join(', ')}`, 'success', '📋');
          drawList();
        } catch (ex) {
          $$('button', box).forEach((b) => (b.disabled = false));
          prog.innerHTML = '';
          err(esc(O9.cloud.errorText(ex)));
        }
      };
    }

    /* ---------- Entregas y calificación ---------- */
    function drawSubmissions(t) {
      const inGroup = students.filter((s) => s.groupCode === t.groupCode).sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
      const subsBy = Object.fromEntries(t._subs.map((s) => [s.uid, s]));
      // Estudiantes que entregaron pero ya no aparecen en el grupo
      t._subs.forEach((s) => { if (!inGroup.some((x) => x.uid === s.uid)) inGroup.push({ uid: s.uid, name: s.studentName, email: s.email }); });
      container.innerHTML = `
        <button class="btn btn-ghost btn-sm" data-back>← Volver a las tareas</button>
        <div class="row-between" style="margin:8px 0 4px"><h2 style="margin:0">${esc(t.title)}</h2><button class="btn btn-sm btn-green" data-gcsv>⬇️ Notas en CSV</button></div>
        <p class="muted" style="margin:0 0 14px;font-weight:700">👥 ${esc(t.groupName)} · 🗓️ ${t.due ? V().fmtDate(t.due) : 'Sin fecha límite'} · Nota máxima ${num(t.maxGrade || 5)}</p>
        <div class="stack">${inGroup.map((st) => {
          const sub = subsBy[st.uid];
          const s = H().statusOf(t, sub);
          return `<article class="card" style="padding:14px" data-row="${esc(st.uid)}">
            <div class="row-between"><div><b>${esc(st.name || '(sin nombre)')}</b><br><small class="muted">${esc(st.email || '')}</small></div>
              <span class="pill ${s.cls}">${s.icon} ${s.label}</span></div>
            ${sub ? `<p class="muted" style="margin:8px 0 4px;font-size:.85rem">Entregado: ${V().fmtDate(sub.submittedAt)}</p>
              ${V().fileList(sub.files)}
              ${sub.comment ? `<p style="margin:8px 0 0;font-size:.9rem">💬 ${esc(sub.comment)}</p>` : ''}
              <div class="grade-row">
                <label>Nota<input class="input" type="text" inputmode="decimal" maxlength="5" data-grade value="${sub.grade != null ? num(sub.grade) : ''}" placeholder="0 - ${num(t.maxGrade || 5)}" style="width:110px"></label>
                <label style="flex:1">Comentario para el estudiante<input class="input" maxlength="500" data-fb value="${esc(sub.feedback || '')}" placeholder="¡Muy bien! Revisa la alineación del título..."></label>
                <button class="btn btn-sm btn-purple" data-save="${esc(sub.id)}">💾 ${sub.grade != null ? 'Actualizar' : 'Calificar'}</button>
              </div>` : '<p class="muted" style="margin:8px 0 0;font-size:.9rem">Todavía no ha entregado.</p>'}
          </article>`;
        }).join('') || '<div class="empty"><p>No hay estudiantes en este grupo.</p></div>'}</div>`;
      $('[data-back]', container).onclick = drawList;
      V().bindDownloads(container);
      $$('[data-save]', container).forEach((b) => (b.onclick = async () => {
        const row = b.closest('[data-row]');
        const sub = t._subs.find((s) => s.id === b.dataset.save);
        const raw = $('[data-grade]', row).value.replace(',', '.');
        const grade = parseFloat(raw);
        if (isNaN(grade) || grade < 0 || grade > (t.maxGrade || 5)) return O9.ui.toast(`Escribe una nota entre 0 y ${num(t.maxGrade || 5)}`, 'error', '✏️');
        const feedback = $('[data-fb]', row).value.trim();
        b.disabled = true;
        try {
          await H().grade(sub.id, grade, feedback);
          Object.assign(sub, { grade, feedback, gradedAt: Date.now() });
          O9.ui.toast(`Nota guardada: ${num(grade)}`, 'success', '✅');
          drawSubmissions(t);
        } catch (e) { b.disabled = false; O9.ui.toast(esc(O9.cloud.errorText(e)), 'error', '⚠️'); }
      }));
      $('[data-gcsv]', container).onclick = () => {
        const cell = (v) => { const x = String(v == null ? '' : v); return /[;"\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x; };
        const rows = inGroup.map((st) => {
          const sub = subsBy[st.uid];
          return [st.name, st.email, H().statusOf(t, sub).label, sub ? new Date(sub.submittedAt).toLocaleString('es-CO') : '', sub && sub.grade != null ? num(sub.grade) : '', sub ? sub.feedback || '' : ''].map(cell).join(';');
        });
        O9.util.download(`notas_${t.title.replace(/[^\wáéíóúñ]+/gi, '_')}.csv`, '﻿' + ['Estudiante;Correo;Estado;Fecha de entrega;Nota;Comentario'].concat(rows).join('\r\n'), 'text/csv;charset=utf-8');
      };
    }

    load();
  }

  O9.teacherTasks = { render };
})(window.O9);
