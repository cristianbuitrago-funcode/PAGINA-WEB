/**
 * ARRANQUE DE LA APLICACIÓN
 * Carga el progreso guardado, actualiza el indicador de XP y activa el enrutador.
 */
(function (O9) {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    O9.store.get();             // lee localStorage
    O9.ui.updateChip();         // nivel y XP en la barra superior
    O9.game.checkBadges();      // por si cambiaron las reglas de insignias
    O9.router.start();

    // Mantener el indicador de XP al día
    O9.util.on('xp:changed', () => O9.ui.updateChip());

    // Aviso si el navegador no deja guardar (modo incógnito, etc.)
    if (!O9.store.isPersistent()) {
      O9.ui.toast('Tu navegador no permite guardar el progreso. Descarga una copia desde tu Perfil.', 'error', '⚠️');
    }
  });
})(window.O9);
