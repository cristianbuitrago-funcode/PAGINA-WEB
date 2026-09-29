/**
 * Almacenamiento del progreso en localStorage.
 * Todo el estado del estudiante vive en un único objeto JSON.
 * Si localStorage no está disponible (modo privado, bloqueado), se usa memoria.
 */
(function (O9) {
  'use strict';

  const KEY = 'ofimatica9.progress';
  const VERSION = 1;

  /** Estado inicial de un estudiante nuevo. */
  function defaultState() {
    return {
      version: VERSION,
      createdAt: Date.now(),
      profile: { name: '', avatar: '🦊', course: '9°' },
      xp: 0,
      points: 0,
      awarded: {},        // claves de recompensas ya entregadas (evita dar XP dos veces)
      topics: {},         // { [topicId]: { learn, practice, challenge, done, tries, errors } }
      challenges: {},     // { [challengeId]: { done, best, date } }
      projects: {},       // { word: { done, date, data }, excel: {...} }
      lab: { word: '', excel: null, missions: {} },
      badges: {},         // { [badgeId]: fecha }
      diagnostic: null,   // resultado del diagnóstico inicial
      stats: { correct: 0, wrong: 0, streak: 0, bestStreak: 0 },
      activity: [],       // últimas acciones (para la pantalla de progreso)
      lastRoute: '',
      courseComplete: false
    };
  }

  let memory = null;       // copia en memoria del estado
  let storageOk = true;

  function load() {
    if (memory) return memory;
    let state = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) {
      storageOk = false;
    }
    memory = migrate(state);
    return memory;
  }

  /** Completa campos faltantes si el estado viene de una versión anterior. */
  function migrate(state) {
    const base = defaultState();
    if (!state || typeof state !== 'object') return base;
    const merged = Object.assign(base, state);
    merged.profile = Object.assign(defaultState().profile, state.profile || {});
    merged.stats = Object.assign(defaultState().stats, state.stats || {});
    merged.lab = Object.assign(defaultState().lab, state.lab || {});
    merged.version = VERSION;
    return merged;
  }

  function save() {
    if (!memory) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(memory));
    } catch (e) {
      storageOk = false;
    }
  }

  const saveSoon = O9.util.debounce(save, 250);

  O9.store = {
    /** Devuelve el estado actual (objeto mutable). */
    get: load,
    /** Aplica cambios con una función y guarda. */
    update(fn) {
      const s = load();
      fn(s);
      saveSoon();
      O9.util.emit('state:changed', s);
      return s;
    },
    saveNow: save,
    isPersistent: () => storageOk,
    /** Borra todo el progreso. */
    reset() {
      memory = defaultState();
      save();
      O9.util.emit('state:changed', memory);
    },
    exportJSON: () => JSON.stringify(load(), null, 2),
    importJSON(text) {
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object' || !('xp' in data)) {
        throw new Error('El archivo no parece un progreso de Ofimática 9°.');
      }
      memory = migrate(data);
      save();
      O9.util.emit('state:changed', memory);
    },
    /** Reemplaza el estado completo (se usa al traer el progreso desde la nube). */
    replace(data) {
      memory = migrate(data);
      save();
      O9.util.emit('state:replaced', memory);
    },
    /** true si el estudiante aún no ha hecho nada (estado recién creado). */
    isEmpty() {
      const s = load();
      return s.xp === 0 && !Object.keys(s.topics).length && !s.diagnostic;
    }
  };

  // Guardar también al cerrar la pestaña
  window.addEventListener('beforeunload', save);
})(window.O9);
