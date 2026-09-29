/**
 * PROGRESO: consulta y registra el avance del estudiante.
 * No otorga XP (eso lo hace gamification.js); solo marca estados.
 */
(function (O9) {
  'use strict';

  const store = O9.store;

  /** Índice rápido de temas: id → { topic, level, module, index } */
  let index = null;
  function buildIndex() {
    index = {};
    ['word', 'excel'].forEach((mid) => {
      const mod = O9.data.modules[mid];
      mod.levels.forEach((lvl, li) => {
        lvl.topics.forEach((t, ti) => {
          index[t.id] = { topic: t, level: lvl, module: mod, levelIndex: li, topicIndex: ti };
        });
      });
    });
    return index;
  }
  const getIndex = () => index || buildIndex();

  const progress = {
    /** Información completa de un tema a partir de su id. */
    find(topicId) { return getIndex()[topicId] || null; },

    /** Lista plana de todos los temas de un módulo (o de ambos). */
    allTopics(moduleId) {
      return Object.values(getIndex()).filter((e) => !moduleId || e.module.id === moduleId);
    },

    topicState(topicId) {
      return store.get().topics[topicId] || { learn: false, practice: false, challenge: false, done: false };
    },

    /** Marca una etapa del tema: 'learn' | 'practice' | 'challenge' | 'done' */
    mark(topicId, stage) {
      store.update((s) => {
        const t = (s.topics[topicId] = s.topics[topicId] || { learn: false, practice: false, challenge: false, done: false, errors: 0 });
        t[stage] = true;
        if (stage === 'done') t.date = Date.now();
      });
    },

    addError(topicId) {
      store.update((s) => {
        const t = (s.topics[topicId] = s.topics[topicId] || { learn: false, practice: false, challenge: false, done: false, errors: 0 });
        t.errors = (t.errors || 0) + 1;
      });
    },

    isDone(topicId) { return !!(store.get().topics[topicId] || {}).done; },

    /** Porcentaje de un nivel (temas completados / temas del nivel). */
    levelStats(level) {
      const total = level.topics.length;
      const done = level.topics.filter((t) => progress.isDone(t.id)).length;
      return { done, total, pct: total ? Math.round((done / total) * 100) : 0, complete: done === total };
    },

    moduleStats(moduleId) {
      const list = progress.allTopics(moduleId);
      const done = list.filter((e) => progress.isDone(e.topic.id)).length;
      return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0, complete: done === list.length };
    },

    /** Siguiente tema sin completar (en orden) de un módulo o global. */
    nextTopic(moduleId) {
      const list = progress.allTopics(moduleId);
      const found = list.find((e) => !progress.isDone(e.topic.id));
      return found || null;
    },

    /** Tema siguiente al actual dentro del mismo módulo. */
    after(topicId) {
      const e = progress.find(topicId);
      if (!e) return null;
      const list = progress.allTopics(e.module.id);
      const i = list.findIndex((x) => x.topic.id === topicId);
      return list[i + 1] || null;
    },
    before(topicId) {
      const e = progress.find(topicId);
      if (!e) return null;
      const list = progress.allTopics(e.module.id);
      const i = list.findIndex((x) => x.topic.id === topicId);
      return i > 0 ? list[i - 1] : null;
    },

    challengesDone() {
      return Object.values(store.get().challenges).filter((c) => c.done).length;
    },

    markChallenge(id, score) {
      store.update((s) => {
        const c = (s.challenges[id] = s.challenges[id] || { done: false, best: 0 });
        c.done = true;
        c.best = Math.max(c.best || 0, score || 0);
        c.date = Date.now();
      });
    },

    projectDone(id) { return !!(store.get().projects[id] || {}).done; },

    /**
     * Progreso global del curso: temas + retos + proyectos.
     * Los temas pesan 80 %, los retos 10 % y los proyectos 10 %.
     */
    overall() {
      const topics = progress.allTopics();
      const tDone = topics.filter((e) => progress.isDone(e.topic.id)).length;
      const ch = O9.data.challenges.length;
      const cDone = O9.data.challenges.filter((c) => (store.get().challenges[c.id] || {}).done).length;
      const pDone = ['word', 'excel'].filter(progress.projectDone).length;
      const pct = (tDone / topics.length) * 80 + (cDone / ch) * 10 + (pDone / 2) * 10;
      return {
        pct: Math.round(pct),
        topicsDone: tDone, topicsTotal: topics.length,
        challengesDone: cDone, challengesTotal: ch,
        projectsDone: pDone
      };
    },

    /** Guarda en el historial de actividad (máximo 30 entradas). */
    log(icon, text) {
      store.update((s) => {
        s.activity.unshift({ icon, text, at: Date.now() });
        s.activity = s.activity.slice(0, 30);
      });
    },

    setLastRoute(route) {
      store.update((s) => { s.lastRoute = route; });
    }
  };

  O9.progress = progress;
})(window.O9);
