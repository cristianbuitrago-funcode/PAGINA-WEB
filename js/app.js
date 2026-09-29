/**
 * ARRANQUE DE LA APLICACIÓN
 * Carga el progreso guardado, actualiza el indicador de XP y activa el enrutador.
 */
(function (O9) {
  'use strict';

  document.addEventListener('DOMContentLoaded', async () => {
    O9.store.get();             // lee localStorage
    O9.ui.updateChip();         // nivel y XP en la barra superior
    O9.game.checkBadges();      // por si cambiaron las reglas de insignias

    // Cuando llega el progreso desde la nube (o se cierra sesión) se repinta todo
    O9.util.on('state:replaced', () => { O9.ui.updateChip(); O9.router.refresh(); });

    // Al iniciar o cerrar sesión, se actualizan las pantallas que muestran la cuenta
    O9.util.on('cloud:auth', () => {
      O9.ui.updateChip();
      O9.router.refresh();
    });

    // Con registro obligatorio hay que saber primero si hay sesión abierta
    if (O9.cloud.enabled && O9.cloud.requireLogin) {
      document.getElementById('app').innerHTML = '<div class="empty"><div class="big">☁️</div><p>Conectando...</p></div>';
      await O9.cloud.init();
      O9.router.start();
    } else {
      O9.router.start();
      O9.cloud.init();
    }

    // Mantener el indicador de XP al día
    O9.util.on('xp:changed', () => O9.ui.updateChip());

    // Aviso si el navegador no deja guardar (modo incógnito, etc.)
    if (!O9.store.isPersistent()) {
      O9.ui.toast('Tu navegador no permite guardar el progreso. Descarga una copia desde tu Perfil.', 'error', '⚠️');
    }
  });
})(window.O9);
