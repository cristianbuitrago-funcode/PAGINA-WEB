/**
 * CALIFICACIÓN AUTOMÁTICA de tareas de la plataforma.
 *
 * Una tarea "de plataforma" asigna contenido (niveles de Word/Excel, retos, proyectos).
 * El avance es: actividades completadas / actividades asignadas.
 * La nota es proporcional a ese avance y SIEMPRE se aproxima hacia abajo a 1 decimal:
 *    nota = piso( avance × notaMáxima × 10 ) / 10
 *    60 % de 5,0 → 3,0   ·   65 % → 3,25 → 3,2   ·   99 % → 4,95 → 4,9
 *
 * Si la tarea tiene fecha límite, solo cuenta lo completado ANTES de esa fecha.
 * scope = { levels: ['x1','x2',...], challenges: true|false, projects: ['word','excel'] }
 */
(function (O9) {
  'use strict';

  const modules = () => ['word', 'excel'].map((m) => O9.data.modules[m]);

  /** Lista de actividades que incluye una tarea. */
  function itemsFor(scope) {
    const items = [];
    const lv = new Set(scope.levels || []);
    modules().forEach((mod) => mod.levels.forEach((l) => {
      if (!lv.has(l.id)) return;
      l.topics.forEach((t) => items.push({ kind: 'topic', id: t.id, icon: t.icon, title: t.title, where: `${mod.name} · Nivel ${l.num}`, href: '#/leccion/' + t.id }));
    }));
    if (scope.challenges) {
      O9.data.challenges.forEach((c) => items.push({ kind: 'challenge', id: c.id, icon: c.icon, title: c.title, where: 'Reto', href: '#/reto/' + c.id }));
    }
    (scope.projects || []).forEach((pid) => {
      const p = O9.data.projects.find((x) => x.id === pid);
      if (p) items.push({ kind: 'project', id: p.id, icon: p.icon, title: p.subtitle, where: 'Proyecto final', href: '#/proyecto/' + p.id });
    });
    return items;
  }

  /** ¿Está hecha esta actividad en el estado del estudiante (antes de "until", si se da)? */
  function isDone(state, item, until) {
    let rec;
    if (item.kind === 'topic') rec = (state.topics || {})[item.id];
    else if (item.kind === 'challenge') rec = (state.challenges || {})[item.id];
    else rec = (state.projects || {})[item.id];
    if (!rec || !rec.done) return false;
    if (until && rec.date && rec.date > until) return false;
    return true;
  }

  /** Nota a partir del avance (0 a 1), siempre hacia abajo a un decimal. */
  function gradeFor(ratio, maxGrade) {
    const max = maxGrade || 5;
    const g = Math.floor(ratio * max * 10 + 1e-9) / 10;
    return Math.max(0, Math.min(max, g));
  }

  /**
   * Avance y nota de un estudiante en una tarea de plataforma.
   * Devuelve { done, total, ratio, pct, grade, pending: [...], closed }
   */
  function evaluate(state, task) {
    const items = itemsFor(task.scope || {});
    const closed = !!(task.due && Date.now() > task.due);
    const until = task.due || null;
    const doneItems = state ? items.filter((it) => isDone(state, it, until)) : [];
    const total = items.length;
    const ratio = total ? doneItems.length / total : 0;
    return {
      done: doneItems.length,
      total,
      ratio,
      pct: Math.floor(ratio * 100),        // porcentaje mostrado (también hacia abajo)
      grade: gradeFor(ratio, task.maxGrade),
      pending: state ? items.filter((it) => !isDone(state, it, null)) : items,
      closed
    };
  }

  /** Texto corto de lo que incluye la tarea, p. ej. "Excel completo + retos". */
  function scopeLabel(scope) {
    const parts = [];
    const lv = new Set(scope.levels || []);
    modules().forEach((mod) => {
      const sel = mod.levels.filter((l) => lv.has(l.id));
      if (!sel.length) return;
      parts.push(sel.length === mod.levels.length ? `${mod.icon} ${mod.name} completo` : `${mod.icon} ${mod.name} (nivel${sel.length > 1 ? 'es' : ''} ${sel.map((l) => l.num).join(', ')})`);
    });
    if (scope.challenges) parts.push('⚔️ Retos');
    (scope.projects || []).forEach((p) => parts.push(p === 'word' ? '📑 Proyecto Word' : '🏅 Proyecto Excel'));
    return parts.join(' + ') || 'Sin actividades';
  }

  /** Tabla de equivalencias para mostrar a los estudiantes. */
  function scaleExamples(maxGrade) {
    return [100, 80, 65, 60, 50].map((p) => `${p}% → ${String(gradeFor(p / 100, maxGrade).toFixed(1)).replace('.', ',')}`).join(' · ');
  }

  O9.grading = { itemsFor, evaluate, gradeFor, scopeLabel, scaleExamples, isDone };
})(window.O9);
