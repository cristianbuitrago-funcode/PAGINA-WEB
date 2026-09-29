/**
 * VISTA: PERFIL
 * Nombre, avatar y curso del estudiante; copia de seguridad del progreso
 * (exportar / importar) y reinicio.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;

  function render(root) {
    const s = O9.store.get();
    const info = O9.game.levelInfo();

    root.innerHTML = `
      <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Perfil</span></div>
      <h1>👤 Mi perfil</h1>
      <div class="grid grid-2">
        <section class="card">
          <div class="row" style="gap:14px;margin-bottom:16px">
            <span style="font-size:3.6rem" data-av>${s.profile.avatar}</span>
            <div><h2 style="margin:0" data-name-view>${esc(s.profile.name || 'Estudiante')}</h2>
            <span class="pill pill-purple">${info.level.icon} Nivel ${info.level.n} · ${esc(info.level.name)}</span></div>
          </div>
          <div class="form-row"><label for="pfName">¿Cómo te llamas?</label>
            <input id="pfName" class="input" maxlength="40" value="${esc(s.profile.name)}" placeholder="Escribe tu nombre (aparecerá en tu certificado)"></div>
          <div class="form-row"><label for="pfCourse">Curso</label>
            <input id="pfCourse" class="input" maxlength="12" value="${esc(s.profile.course)}" placeholder="Ej. 9°B"></div>
          <div class="form-row"><label>Elige tu avatar</label>
            <div class="avatar-grid">${O9.data.avatars.map((a) => `<button class="avatar-opt ${a === s.profile.avatar ? 'on' : ''}" data-a="${a}" aria-label="Avatar ${a}">${a}</button>`).join('')}</div></div>
          <button class="btn btn-green" data-save>💾 Guardar perfil</button>
        </section>

        <section class="stack">
          <div class="card">
            <h3>📊 Resumen</h3>
            <p>⭐ <b>${O9.util.fmtNum(s.xp, 0)}</b> XP · 🪙 <b>${s.points}</b> puntos · 🏅 <b>${O9.game.badgeCount()}</b> insignias</p>
            ${O9.ui.levelBlock()}
            <p class="muted" style="margin-top:10px;font-size:.9rem">Estudiando desde el ${new Date(s.createdAt).toLocaleDateString('es-CO')}.</p>
          </div>
          <div class="card">
            <h3>💾 Tu progreso</h3>
            <p class="muted" style="font-size:.92rem">${O9.store.isPersistent()
              ? 'Tu progreso se guarda automáticamente en este navegador. Si cambias de computador, descarga una copia y cárgala en el otro.'
              : '⚠️ Este navegador no permite guardar datos (¿modo incógnito?). Descarga una copia de tu progreso para no perderlo.'}</p>
            <div class="row">
              <button class="btn btn-sm btn-light" data-export>⬇️ Descargar copia</button>
              <label class="btn btn-sm btn-light" style="cursor:pointer">⬆️ Cargar copia<input type="file" accept=".json,application/json" data-import hidden></label>
            </div>
          </div>
          <div class="card">
            <h3>🩺 Diagnóstico</h3>
            <p class="muted" style="font-size:.92rem">${s.diagnostic ? `Tu último resultado fue <b>${esc(s.diagnostic.band)}</b>.` : 'Aún no lo has hecho.'}</p>
            <a class="btn btn-sm btn-purple" href="#/diagnostico">${s.diagnostic ? 'Repetir diagnóstico' : 'Hacer diagnóstico'}</a>
          </div>
          <div class="card" style="border-color:var(--red-100)">
            <h3>🗑️ Empezar de cero</h3>
            <p class="muted" style="font-size:.92rem">Borra todo tu progreso, XP e insignias. No se puede deshacer.</p>
            <button class="btn btn-sm btn-danger" data-reset>Reiniciar progreso</button>
          </div>
        </section>
      </div>`;
    O9.ui.animateBars(root);

    let avatar = s.profile.avatar;
    $$('.avatar-opt', root).forEach((b) => (b.onclick = () => {
      avatar = b.dataset.a;
      $$('.avatar-opt', root).forEach((x) => x.classList.toggle('on', x === b));
      $('[data-av]', root).textContent = avatar;
    }));

    $('[data-save]', root).onclick = () => {
      const name = $('#pfName', root).value.trim();
      const course = $('#pfCourse', root).value.trim() || '9°';
      O9.store.update((st) => { st.profile.name = name; st.profile.avatar = avatar; st.profile.course = course; });
      O9.store.saveNow();
      $('[data-name-view]', root).textContent = name || 'Estudiante';
      O9.ui.toast('Perfil guardado', 'success', '✅');
    };

    $('[data-export]', root).onclick = () => {
      const name = (O9.store.get().profile.name || 'estudiante').replace(/\s+/g, '_');
      O9.util.download(`ofimatica9_progreso_${name}.json`, O9.store.exportJSON());
    };

    $('[data-import]', root).onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          O9.store.importJSON(reader.result);
          O9.ui.toast('Progreso cargado correctamente', 'success', '✅');
          O9.ui.updateChip();
          render(root);
        } catch (err) {
          O9.ui.toast(err.message || 'No se pudo leer el archivo.', 'error', '⚠️');
        }
      };
      reader.readAsText(file);
    };

    $('[data-reset]', root).onclick = async () => {
      if (!(await O9.ui.confirm('¿Borrar todo tu progreso?', 'Perderás tu XP, insignias, retos y proyectos. Esta acción no se puede deshacer.', 'Sí, borrar todo'))) return;
      O9.store.reset();
      O9.ui.updateChip();
      O9.ui.toast('Progreso reiniciado. ¡A empezar de nuevo!', '', '🌱');
      location.hash = '#/';
    };
  }

  O9.views.profile = { render };
})(window.O9);
