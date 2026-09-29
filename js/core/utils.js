/**
 * Utilidades generales: DOM, texto, números y un pequeño bus de eventos.
 */
(function (O9) {
  'use strict';

  const util = {};

  /** Selecciona un elemento (atajo de querySelector). */
  util.$ = (sel, root = document) => root.querySelector(sel);
  /** Selecciona varios elementos como arreglo. */
  util.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Escapa texto para insertarlo de forma segura en HTML. */
  util.esc = (str) =>
    String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  /** Crea un elemento a partir de un string HTML (devuelve el primer nodo). */
  util.html = (str) => {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  };

  /** Mezcla un arreglo (Fisher–Yates) sin modificar el original. */
  util.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  util.clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  /** Formatea números al estilo colombiano: 12.500,5 */
  util.fmtNum = (n, decimals = 2) =>
    Number(n).toLocaleString('es-CO', { maximumFractionDigits: decimals });

  /** Fecha relativa sencilla: "hace 5 min". */
  util.timeAgo = (ts) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'justo ahora';
    const m = Math.floor(s / 60);
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'ayer' : `hace ${d} días`;
  };

  /** Normaliza texto: minúsculas, sin tildes ni espacios extra. */
  util.norm = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  util.debounce = (fn, ms = 300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  /** Barra de texto tipo "████████░░" para mostrar avances. */
  util.textBar = (pct, size = 10) => {
    const full = Math.round((util.clamp(pct, 0, 100) / 100) * size);
    return '█'.repeat(full) + '░'.repeat(size - full);
  };

  /* ---------- Bus de eventos (publicar / suscribir) ---------- */
  const listeners = {};
  util.on = (evt, fn) => {
    (listeners[evt] = listeners[evt] || []).push(fn);
    return () => (listeners[evt] = listeners[evt].filter((f) => f !== fn));
  };
  util.emit = (evt, payload) => (listeners[evt] || []).forEach((fn) => fn(payload));

  /** Descarga un texto como archivo (para exportar el progreso). */
  util.download = (filename, text, type = 'application/json') => {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  };

  O9.util = util;
})(window.O9);
