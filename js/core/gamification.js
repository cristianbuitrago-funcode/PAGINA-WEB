/**
 * GAMIFICACIÓN: XP, puntos, niveles, rachas e insignias.
 * Todas las recompensas pasan por award(), que evita entregar
 * la misma recompensa dos veces (clave única).
 */
(function (O9) {
  'use strict';

  const store = O9.store;
  const levels = () => O9.data.levels;

  const game = {
    /** Información del nivel para una cantidad de XP. */
    levelInfo(xp) {
      if (xp == null) xp = store.get().xp;
      const L = levels();
      let cur = L[0];
      for (const l of L) if (xp >= l.min) cur = l;
      const next = L.find((l) => l.min > xp) || null;
      const pct = next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100;
      return { level: cur, next, pct, toNext: next ? next.min - xp : 0, xp };
    },

    /**
     * Entrega una recompensa una sola vez.
     * @param {string} key    identificador único (ej. 'learn:w1-1')
     * @param {number} xp
     * @param {number} points
     * @param {string} reason texto para la notificación
     * @returns {number} XP entregada (0 si ya se había entregado)
     */
    award(key, xp, points, reason) {
      const s = store.get();
      if (s.awarded[key]) return 0;
      const before = game.levelInfo(s.xp).level;
      store.update((st) => {
        st.awarded[key] = Date.now();
        st.xp += xp;
        st.points += points || 0;
      });
      if (O9.ui) O9.ui.xpToast(xp, reason);
      const after = game.levelInfo().level;
      if (after.n > before.n) {
        O9.progress.log('⬆️', `Subiste a Nivel ${after.n}: ${after.name}`);
        setTimeout(() => O9.ui && O9.ui.levelUp(after), 700);
      }
      game.checkBadges();
      O9.util.emit('xp:changed');
      return xp;
    },

    /** Atajo usando las reglas de O9.data.rewards. */
    reward(kind, key, reason) {
      const r = O9.data.rewards[kind];
      return r ? game.award(key, r.xp, r.points, reason) : 0;
    },

    wasAwarded(key) { return !!store.get().awarded[key]; },

    /** Registra una respuesta para estadísticas y rachas. */
    recordAnswer(correct) {
      store.update((s) => {
        if (correct) {
          s.stats.correct++;
          s.stats.streak++;
          s.stats.bestStreak = Math.max(s.stats.bestStreak, s.stats.streak);
        } else {
          s.stats.wrong++;
          s.stats.streak = 0;
        }
      });
      if (correct) game.checkBadges();
    },

    /** Evalúa si una regla de insignia se cumple. */
    ruleMet(rule) {
      const s = store.get();
      const P = O9.progress;
      switch (rule.type) {
        case 'topics': return Object.values(s.topics).filter((t) => t.done).length >= rule.n;
        case 'level': {
          for (const m of ['word', 'excel']) {
            const lvl = O9.data.modules[m].levels.find((l) => l.id === rule.id);
            if (lvl) return P.levelStats(lvl).complete;
          }
          return false;
        }
        case 'module': return P.moduleStats(rule.id).complete;
        case 'challenges': return P.challengesDone() >= rule.n;
        case 'challenge': return !!(s.challenges[rule.id] || {}).done;
        case 'project': return P.projectDone(rule.id);
        case 'diagnostic': return !!s.diagnostic;
        case 'streak': return s.stats.bestStreak >= rule.n;
        case 'xp': return s.xp >= rule.n;
        case 'missions': return Object.keys(s.lab.missions || {}).length >= rule.n;
        case 'course': return P.projectDone('word') && P.projectDone('excel');
      }
      return false;
    },

    /** Revisa todas las insignias y entrega las nuevas. */
    checkBadges() {
      const s = store.get();
      const fresh = [];
      O9.data.badges.forEach((b) => {
        if (!s.badges[b.id] && game.ruleMet(b.rule)) fresh.push(b);
      });
      if (!fresh.length) return [];
      store.update((st) => fresh.forEach((b) => (st.badges[b.id] = Date.now())));
      fresh.forEach((b, i) => {
        O9.progress.log(b.icon, `Insignia conseguida: ${b.name}`);
        setTimeout(() => O9.ui && O9.ui.badgeToast(b), 400 + i * 600);
      });
      // Curso completo
      if (fresh.some((b) => b.rule.type === 'course')) {
        store.update((st) => (st.courseComplete = true));
      }
      return fresh;
    },

    badgeCount() { return Object.keys(store.get().badges).length; }
  };

  O9.game = game;
})(window.O9);
