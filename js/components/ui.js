/**
 * COMPONENTES DE INTERFAZ reutilizables:
 * notificaciones, ventanas modales, barras de progreso, confeti
 * y el indicador de XP de la barra superior.
 */
(function (O9) {
  'use strict';

  const { esc, $ } = O9.util;
  const ui = {};

  /* ---------- Notificaciones ---------- */
  ui.toast = (msg, type = '', icon = '') => {
    const box = $('#toasts');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = (icon ? `<span style="font-size:1.4rem">${icon}</span>` : '') + `<span>${msg}</span>`;
    box.appendChild(t);
    setTimeout(() => t.classList.add('leave'), 2800);
    setTimeout(() => t.remove(), 3200);
  };

  ui.xpToast = (xp, reason) => {
    ui.toast(`+${xp} XP${reason ? ' · ' + esc(reason) : ''}`, 'xp', '⭐');
    ui.updateChip(true);
  };

  ui.badgeToast = (badge) => {
    ui.toast(`¡Nueva insignia! <b>${esc(badge.name)}</b>`, 'badge', badge.icon);
    ui.confetti(80);
  };

  ui.levelUp = (level) => {
    ui.confetti(160);
    ui.modal({
      emoji: level.icon,
      title: `¡Subiste a Nivel ${level.n}!`,
      html: `<p>Ahora eres <b>${esc(level.name)}</b>. Sigue practicando: cada ejercicio te acerca al siguiente nivel.</p>`,
      actions: [{ label: '¡Genial!', cls: 'btn-gold' }]
    });
  };

  /* ---------- Ventana modal ---------- */
  /**
   * ui.modal({ emoji, title, html, actions: [{ label, cls, onClick, keepOpen }] })
   */
  ui.modal = ({ emoji = '', title = '', html = '', actions = [{ label: 'Cerrar' }], dismissable = true }) => {
    const root = $('#modalRoot');
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      ${emoji ? `<div class="modal-emoji">${emoji}</div>` : ''}
      ${title ? `<h2>${esc(title)}</h2>` : ''}
      <div class="modal-body">${html}</div>
      <div class="modal-actions"></div></div>`;
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape' && dismissable) close(); };
    const acts = wrap.querySelector('.modal-actions');
    actions.forEach((a) => {
      const b = document.createElement('button');
      b.className = 'btn ' + (a.cls || '');
      b.textContent = a.label;
      b.onclick = () => { if (a.onClick) a.onClick(wrap); if (!a.keepOpen) close(); };
      acts.appendChild(b);
    });
    if (dismissable) wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    document.addEventListener('keydown', onKey);
    root.appendChild(wrap);
    const first = acts.querySelector('button');
    if (first) first.focus();
    return { close, el: wrap };
  };

  ui.confirm = (title, text, okLabel = 'Sí', cls = 'btn-danger') =>
    new Promise((resolve) => {
      ui.modal({
        emoji: '🤔', title, html: `<p>${text}</p>`,
        actions: [
          { label: 'Cancelar', cls: 'btn-light', onClick: () => resolve(false) },
          { label: okLabel, cls, onClick: () => resolve(true) }
        ]
      });
    });

  /* ---------- Barras de progreso ---------- */
  ui.bar = (pct, cls = '') =>
    `<div class="progress ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>`;

  /** Anima las barras recién insertadas (de 0 al valor real). */
  ui.animateBars = (root) => {
    O9.util.$$('.progress > span', root).forEach((s) => {
      const w = s.style.width;
      s.style.width = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => (s.style.width = w)));
    });
  };

  /** Bloque "Nivel 3 ████████░░ 80%" */
  ui.levelBlock = () => {
    const info = O9.game.levelInfo();
    return `<div class="progress-label"><span>Nivel ${info.level.n} · ${esc(info.level.name)}</span><span>${info.pct}%</span></div>
      ${ui.bar(info.pct, 'progress-lg')}
      <div class="row-between" style="margin-top:6px;font-size:.85rem;font-weight:700">
        <span class="progress-text">${O9.util.textBar(info.pct)} ${info.pct}%</span>
        <span>${info.next ? `Faltan ${info.toNext} XP para ${esc(info.next.name)}` : '¡Nivel máximo alcanzado!'}</span>
      </div>`;
  };

  /* ---------- Indicador de XP en la barra superior ---------- */
  ui.updateChip = (bump) => {
    const s = O9.store.get();
    const info = O9.game.levelInfo(s.xp);
    $('#xpChipLevel').textContent = 'Nv ' + info.level.n;
    $('#xpChipXp').textContent = O9.util.fmtNum(s.xp, 0) + ' XP';
    $('#xpChipFill').style.width = info.pct + '%';
    const chip = $('#xpChip');
    chip.title = `Nivel ${info.level.n}: ${info.level.name} · ${s.points} puntos`;
    if (bump) { chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump'); }
  };

  /* ---------- Confeti (canvas, sin librerías) ---------- */
  let confettiRunning = false;
  ui.confetti = (count = 120) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const colors = ['#2563eb', '#7c3aed', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];
    const parts = Array.from({ length: count }, () => ({
      x: cv.width / 2 + (Math.random() - 0.5) * cv.width * 0.4,
      y: cv.height * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 14 - 4,
      s: Math.random() * 7 + 5,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
      life: 0
    }));
    ui._parts = (ui._parts || []).concat(parts);
    if (confettiRunning) return;
    confettiRunning = true;
    (function frame() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ui._parts.forEach((p) => {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      ui._parts = ui._parts.filter((p) => p.y < cv.height + 20 && p.life < 240);
      if (ui._parts.length) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, cv.width, cv.height); confettiRunning = false; }
    })();
  };

  /** Stepper Aprende → Practica → Reto → Recompensa */
  ui.STAGES = [
    { id: 'learn', icon: '📚', label: 'Aprende' },
    { id: 'practice', icon: '🎯', label: 'Practica' },
    { id: 'challenge', icon: '🧠', label: 'Reto' },
    { id: 'reward', icon: '🏆', label: 'Recompensa' }
  ];

  O9.ui = ui;
})(window.O9);
