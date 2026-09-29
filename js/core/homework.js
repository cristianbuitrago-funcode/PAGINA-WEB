/**
 * TAREAS Y ARCHIVOS (Firebase / Firestore)
 *
 * Colecciones:
 *  - tareas/{id}      → { groupCode, groupName, teacherUid, teacherName, title, description,
 *                         due (ms), maxGrade, link, files:[{id,name,size,type}], active, createdAt,
 *                         kind: 'archivo'|'plataforma', scope (actividades asignadas, ver grading.js) }
 *  - entregas/{tareaId_uid} → { taskId, groupCode, uid, studentName, email, files:[...], comment,
 *                         submittedAt (ms), grade, feedback, gradedAt, status }
 *  - archivos/{id}    → { name, type, size, parts, kind:'task'|'submission', ownerUid, taskId, groupCode }
 *      archivos/{id}/partes/{n} → { data } (el archivo en base64, repartido en partes)
 *
 * ¿Por qué los archivos van en Firestore y no en Firebase Storage?
 * Porque Storage exige el plan de pago (Blaze) en los proyectos nuevos. Guardando el archivo
 * en partes dentro de Firestore todo funciona con el plan gratuito. Límite: 3 MB por archivo.
 *
 * Las consultas usan un solo filtro de igualdad (sin orderBy) para no necesitar índices;
 * el orden se hace aquí.
 */
(function (O9) {
  'use strict';

  const MAX_FILE = 3 * 1024 * 1024;       // 3 MB por archivo
  const CHUNK = 800000;                    // caracteres base64 por parte (< 1 MB por documento)
  const db = () => O9.cloud.db();
  const uid = () => O9.cloud.user.uid;
  const newId = () => db().collection('tareas').doc().id;

  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  function fileIcon(name) {
    const ext = String(name).split('.').pop().toLowerCase();
    if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return '📝';
    if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) return '📊';
    if (['ppt', 'pptx', 'odp'].includes(ext)) return '📽️';
    if (ext === 'pdf') return '📕';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return '🖼️';
    if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
    return '📎';
  }

  function readBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = () => reject(new Error('No se pudo leer el archivo ' + file.name));
      r.readAsDataURL(file);
    });
  }

  /** Revisa tamaño antes de subir. Devuelve un mensaje de error o null. */
  function validate(files) {
    for (const f of files) {
      if (f.size > MAX_FILE) return `"${f.name}" pesa ${fmtSize(f.size)}. El máximo es 3 MB por archivo. Si es muy grande, guárdalo como PDF o comparte un enlace de Drive.`;
      if (f.size === 0) return `"${f.name}" está vacío.`;
    }
    if (files.length > 5) return 'Puedes subir máximo 5 archivos a la vez.';
    return null;
  }

  /** Sube un archivo en partes. meta = { kind, taskId, groupCode } */
  async function uploadFile(file, meta, onProgress) {
    const b64 = await readBase64(file);
    const parts = Math.max(1, Math.ceil(b64.length / CHUNK));
    const ref = db().collection('archivos').doc();
    await ref.set({
      name: file.name, type: file.type || 'application/octet-stream', size: file.size, parts,
      kind: meta.kind, ownerUid: uid(), taskId: meta.taskId, groupCode: meta.groupCode, createdAt: Date.now()
    });
    for (let i = 0; i < parts; i++) {
      await ref.collection('partes').doc(String(i)).set({ data: b64.slice(i * CHUNK, (i + 1) * CHUNK) });
      if (onProgress) onProgress((i + 1) / parts);
    }
    return { id: ref.id, name: file.name, size: file.size, type: file.type || '' };
  }

  async function uploadAll(files, meta, onProgress) {
    const out = [];
    for (let i = 0; i < files.length; i++) {
      out.push(await uploadFile(files[i], meta, (p) => onProgress && onProgress((i + p) / files.length, files[i].name)));
    }
    return out;
  }

  /** Descarga un archivo (junta las partes y lo guarda en el equipo). */
  async function downloadFile(info) {
    const ref = db().collection('archivos').doc(info.id);
    const meta = await ref.get();
    if (!meta.exists) throw new Error('El archivo ya no existe.');
    const m = meta.data();
    let b64 = '';
    for (let i = 0; i < m.parts; i++) {
      const p = await ref.collection('partes').doc(String(i)).get();
      b64 += p.data().data;
    }
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: m.type || 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = m.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  async function deleteFile(id) {
    const ref = db().collection('archivos').doc(id);
    try {
      const meta = await ref.get();
      const n = meta.exists ? meta.data().parts : 0;
      for (let i = 0; i < n; i++) await ref.collection('partes').doc(String(i)).delete();
      await ref.delete();
    } catch (e) { console.warn('No se pudo borrar el archivo', id, e); }
  }

  const byDue = (a, b) => (a.due || Infinity) - (b.due || Infinity) || (b.createdAt || 0) - (a.createdAt || 0);
  const docs = (snap) => snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));

  /** Estado de una entrega para mostrar. */
  function statusOf(task, sub) {
    if (!sub) return task.due && Date.now() > task.due ? { key: 'late-missing', label: 'Sin entregar (vencida)', cls: 'pill-red', icon: '⏰' } : { key: 'pending', label: 'Pendiente', cls: 'pill-gold', icon: '📌' };
    if (sub.grade != null && sub.grade !== '') return { key: 'graded', label: 'Calificada', cls: 'pill-green', icon: '✅' };
    if (task.due && sub.submittedAt > task.due) return { key: 'late', label: 'Entregada tarde', cls: 'pill-purple', icon: '🕓' };
    return { key: 'sent', label: 'Entregada', cls: 'pill', icon: '📤' };
  }

  O9.homework = {
    MAX_FILE, fmtSize, fileIcon, validate, downloadFile, statusOf,

    /* ---------- Docente ---------- */
    async createTask(t, files, onProgress) {
      const id = newId();
      const uploaded = await uploadAll(files || [], { kind: 'task', taskId: id, groupCode: t.groupCode }, onProgress);
      const task = {
        groupCode: t.groupCode, groupName: t.groupName, teacherUid: uid(), teacherName: O9.cloud.user.displayName || '',
        title: t.title, description: t.description || '', due: t.due || null, maxGrade: t.maxGrade || 5,
        link: t.link || '', files: uploaded, active: true, createdAt: Date.now(),
        kind: t.kind || 'archivo',          // 'archivo' = se entrega un archivo · 'plataforma' = actividades de la plataforma
        scope: t.scope || null              // solo para 'plataforma' (ver core/grading.js)
      };
      await db().collection('tareas').doc(id).set(task);
      return Object.assign({ id }, task);
    },
    setTaskActive: (id, active) => db().collection('tareas').doc(id).update({ active }),
    async deleteTask(task) {
      const subs = await O9.homework.submissionsFor(task.id);
      for (const s of subs) {
        for (const f of s.files || []) await deleteFile(f.id);
        await db().collection('entregas').doc(s.id).delete();
      }
      for (const f of task.files || []) await deleteFile(f.id);
      await db().collection('tareas').doc(task.id).delete();
    },
    async tasksForGroups(codes) {
      const all = [];
      for (const c of codes) all.push(...docs(await db().collection('tareas').where('groupCode', '==', c).get()));
      return all.sort(byDue);
    },
    async submissionsFor(taskId) {
      return docs(await db().collection('entregas').where('taskId', '==', taskId).get());
    },
    grade: (subId, grade, feedback) => db().collection('entregas').doc(subId).update({
      grade, feedback: feedback || '', gradedAt: Date.now(), status: 'calificada'
    }),

    /* ---------- Estudiante ---------- */
    async myTasks() {
      const g = (O9.store.get().group || {}).code;
      if (!g) return [];
      return docs(await db().collection('tareas').where('groupCode', '==', g).get()).filter((t) => t.active !== false).sort(byDue);
    },
    async mySubmissions() {
      const list = docs(await db().collection('entregas').where('uid', '==', uid()).get());
      return Object.fromEntries(list.map((s) => [s.taskId, s]));
    },
    /** Entrega (o cambia la entrega de) una tarea. */
    async submit(task, files, comment, previous, onProgress) {
      const uploaded = await uploadAll(files, { kind: 'submission', taskId: task.id, groupCode: task.groupCode }, onProgress);
      const s = O9.store.get();
      const data = {
        taskId: task.id, groupCode: task.groupCode, uid: uid(),
        studentName: s.profile.name || O9.cloud.user.displayName || '', email: O9.cloud.user.email || '',
        files: uploaded, comment: comment || '', submittedAt: Date.now(), status: 'entregada'
      };
      await db().collection('entregas').doc(task.id + '_' + uid()).set(data, { merge: true });
      if (previous) for (const f of previous.files || []) await deleteFile(f.id);
      O9.progress.log('📤', `Entregaste la tarea "${task.title}"`);
      return data;
    },
    /** Tareas pendientes (para el aviso del inicio). */
    async pendingCount() {
      const [tasks, subs] = await Promise.all([O9.homework.myTasks(), O9.homework.mySubmissions()]);
      const state = O9.store.get();
      return tasks.filter((t) => (t.kind === 'plataforma' ? O9.grading.evaluate(state, t).ratio < 1 && !(t.due && Date.now() > t.due) : !subs[t.id])).length;
    }
  };
})(window.O9);
