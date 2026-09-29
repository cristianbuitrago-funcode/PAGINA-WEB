/**
 * DATOS DE GAMIFICACIÓN: niveles, reglas de XP e insignias.
 * Solo datos: la lógica que los usa está en js/core/gamification.js
 */
(function (O9) {
  'use strict';

  /** Niveles del estudiante según la XP acumulada. */
  O9.data.levels = [
    { n: 1, name: 'Principiante', min: 0, icon: '🌱' },
    { n: 2, name: 'Aprendiz', min: 500, icon: '📘' },
    { n: 3, name: 'Explorador', min: 1300, icon: '🧭' },
    { n: 4, name: 'Experto', min: 2400, icon: '🚀' },
    { n: 5, name: 'Maestro de Ofimática', min: 3600, icon: '👑' }
  ];

  /** Cuánta XP y cuántos puntos da cada acción. */
  O9.data.rewards = {
    learn: { xp: 10, points: 5 },            // terminar la parte "Aprende"
    practiceFirstTry: { xp: 10, points: 10 }, // acertar a la primera
    practiceRetry: { xp: 5, points: 4 },      // acertar después de equivocarse
    challenge: { xp: 25, points: 20 },        // superar el reto del tema
    topicComplete: { xp: 15, points: 10 },    // bonus por completar el tema
    diagnostic: { xp: 30, points: 20 },
    labMission: { xp: 15, points: 10 }
  };

  /**
   * Insignias. Cada una tiene una regla (rule) que evalúa gamification.js:
   *  topics(n)       → n temas completados
   *  level(id)       → nivel de un módulo completado (ej. 'w1')
   *  module(id)      → módulo completo
   *  challenges(n)   → n retos completados
   *  challenge(id)   → un reto específico
   *  project(id)     → proyecto final entregado
   *  diagnostic      → hizo el diagnóstico
   *  streak(n)       → n respuestas correctas seguidas
   *  xp(n)           → n XP acumulada
   *  missions(n)     → n misiones del laboratorio
   *  course          → curso completo
   */
  O9.data.badges = [
    { id: 'first-step', icon: '👣', name: 'Primer paso', desc: 'Completa tu primer tema.', rule: { type: 'topics', n: 1 } },
    { id: 'diagnostic', icon: '🩺', name: 'Me conozco', desc: 'Haz el diagnóstico inicial.', rule: { type: 'diagnostic' } },
    { id: 'streak5', icon: '🔥', name: 'En racha', desc: 'Responde 5 preguntas seguidas sin fallar.', rule: { type: 'streak', n: 5 } },
    { id: 'streak15', icon: '☄️', name: 'Imparable', desc: 'Responde 15 preguntas seguidas sin fallar.', rule: { type: 'streak', n: 15 } },
    { id: 'topics10', icon: '📚', name: 'Estudioso', desc: 'Completa 10 temas.', rule: { type: 'topics', n: 10 } },
    { id: 'topics25', icon: '🎓', name: 'Cerebrito', desc: 'Completa 25 temas.', rule: { type: 'topics', n: 25 } },

    { id: 'w1', icon: '🧭', name: 'Explorador de Word', desc: 'Completa Word · Nivel 1.', rule: { type: 'level', id: 'w1' } },
    { id: 'w2', icon: '🎨', name: 'Artista del formato', desc: 'Completa Word · Nivel 2.', rule: { type: 'level', id: 'w2' } },
    { id: 'w3', icon: '📄', name: 'Maquetador', desc: 'Completa Word · Nivel 3.', rule: { type: 'level', id: 'w3' } },
    { id: 'w4', icon: '🎒', name: 'Trabajos impecables', desc: 'Completa Word · Nivel 4.', rule: { type: 'level', id: 'w4' } },
    { id: 'word', icon: '📝', name: 'Dominio de Word', desc: 'Completa todo el módulo de Word.', rule: { type: 'module', id: 'word' } },

    { id: 'x1', icon: '🔢', name: 'Celda a celda', desc: 'Completa Excel · Nivel 1.', rule: { type: 'level', id: 'x1' } },
    { id: 'x2', icon: '🗂️', name: 'Organizador', desc: 'Completa Excel · Nivel 2.', rule: { type: 'level', id: 'x2' } },
    { id: 'x3', icon: '🧮', name: 'Mago de las fórmulas', desc: 'Completa Excel · Nivel 3.', rule: { type: 'level', id: 'x3' } },
    { id: 'x4', icon: '🏫', name: 'Excel escolar', desc: 'Completa Excel · Nivel 4.', rule: { type: 'level', id: 'x4' } },
    { id: 'x5', icon: '📈', name: 'Analista de datos', desc: 'Completa Excel · Nivel 5.', rule: { type: 'level', id: 'x5' } },
    { id: 'excel', icon: '📊', name: 'Dominio de Excel', desc: 'Completa todo el módulo de Excel.', rule: { type: 'module', id: 'excel' } },

    { id: 'challenger', icon: '⚔️', name: 'Retador', desc: 'Supera tu primer reto.', rule: { type: 'challenges', n: 1 } },
    { id: 'warrior', icon: '🛡️', name: 'Guerrero', desc: 'Supera 5 retos.', rule: { type: 'challenges', n: 5 } },
    { id: 'speed', icon: '⚡', name: 'Veloz', desc: 'Supera el reto Contrarreloj.', rule: { type: 'challenge', id: 'contrarreloj' } },
    { id: 'lab', icon: '🧪', name: 'Manos a la obra', desc: 'Completa 3 misiones del laboratorio.', rule: { type: 'missions', n: 3 } },

    { id: 'proj-word', icon: '📑', name: 'Informe perfecto', desc: 'Entrega el proyecto final de Word.', rule: { type: 'project', id: 'word' } },
    { id: 'proj-excel', icon: '🏅', name: 'Sistema de notas', desc: 'Entrega el proyecto final de Excel.', rule: { type: 'project', id: 'excel' } },
    { id: 'xp1000', icon: '💎', name: 'Mil XP', desc: 'Acumula 1.000 XP.', rule: { type: 'xp', n: 1000 } },
    { id: 'master', icon: '👑', name: 'Maestro de Ofimática', desc: 'Completa el curso de Ofimática 9°.', rule: { type: 'course' } }
  ];

  /** Avatares disponibles en el perfil. */
  O9.data.avatars = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐙', '🦄', '🐧', '🐺', '🦉', '🐬', '🐲', '🤖', '👾', '🚀', '⚽', '🎧', '🎮', '🌟', '🍕'];
})(window.O9);
