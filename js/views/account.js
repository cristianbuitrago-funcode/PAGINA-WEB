/**
 * VISTA: CUENTA (#/cuenta)
 * Registro e inicio de sesión de estudiantes con Firebase.
 * Si Firebase no está configurado, explica cómo activarlo.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;

  function render(root) {
    const cloud = O9.cloud;

    if (!cloud.enabled) {
      root.innerHTML = `<div class="diag-wrap">
        <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Cuenta</span></div>
        <section class="card center" style="padding:28px">
          <div style="font-size:3.5rem">☁️</div>
          <h1>Cuentas en línea</h1>
          <p>El registro de estudiantes todavía no está activado en esta plataforma.</p>
          <p class="muted">Tu progreso se guarda en este navegador. Puedes llevarlo a otro equipo desde <a href="#/perfil">Perfil → Descargar copia</a>.</p>
          ${cloud.error ? `<div class="feedback bad">${esc(cloud.error)}</div>` : ''}
          <p class="muted" style="font-size:.85rem">Para el docente o administrador: sigue la guía <b>FIREBASE.md</b> del repositorio.</p>
        </section></div>`;
      return;
    }

    if (cloud.user) return renderAccount(root);

    let mode = 'login';
    const draw = () => {
      root.innerHTML = `<div class="diag-wrap">
        <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Cuenta</span></div>
        <section class="card" style="padding:24px">
          <div class="center"><div style="font-size:3rem">${mode === 'login' ? '👋' : '🎒'}</div>
            <h1 style="margin-bottom:4px">${mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>
            <p class="muted">${mode === 'login' ? 'Entra para seguir donde ibas, desde cualquier computador o celular.' : 'Regístrate para guardar tu progreso en la nube y no perderlo nunca.'}</p></div>
          <div class="tabs" style="justify-content:center">
            <button class="tab-btn ${mode === 'login' ? 'on' : ''}" data-mode="login">Iniciar sesión</button>
            <button class="tab-btn ${mode === 'register' ? 'on' : ''}" data-mode="register">Crear cuenta</button>
          </div>
          <form data-form novalidate>
            ${mode === 'register' ? `
              <div class="form-row"><label for="acName">Nombre completo</label><input id="acName" class="input" required maxlength="40" autocomplete="name" value="${esc(O9.store.get().profile.name)}"></div>
              <div class="form-row"><label for="acCourse">Curso</label><input id="acCourse" class="input" maxlength="12" placeholder="Ej. 9°B" value="${esc(O9.store.get().profile.course)}"></div>` : ''}
            <div class="form-row"><label for="acEmail">Correo</label><input id="acEmail" class="input" type="email" required autocomplete="email" placeholder="tucorreo@ejemplo.com"></div>
            <div class="form-row"><label for="acPass">Contraseña</label><input id="acPass" class="input" type="password" required minlength="6" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" placeholder="${mode === 'login' ? 'Tu contraseña' : 'Mínimo 6 caracteres'}"></div>
            ${mode === 'register' ? '<div class="form-row"><label for="acPass2">Repite la contraseña</label><input id="acPass2" class="input" type="password" required autocomplete="new-password"></div>' : ''}
            <div data-msg></div>
            <button class="btn btn-block btn-lg ${mode === 'login' ? '' : 'btn-green'}" type="submit">${mode === 'login' ? 'Entrar' : 'Crear mi cuenta'}</button>
          </form>
          ${cloud.google ? '<div class="center muted" style="margin:14px 0 10px;font-weight:700">o</div><button class="btn btn-light btn-block" data-google><b style="color:#4285f4">G</b> Continuar con Google</button>' : ''}
          ${mode === 'login' ? '<div class="center" style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-forgot>¿Olvidaste tu contraseña?</button></div>' : ''}
          ${!O9.store.isEmpty() ? '<p class="muted center" style="font-size:.85rem;margin-top:12px">💡 El progreso que ya tienes en este navegador se guardará en tu cuenta.</p>' : ''}
        </section></div>`;

      const msg = $('[data-msg]', root);
      const show = (text, type = 'bad') => { msg.innerHTML = `<div class="feedback ${type}" style="margin:0 0 12px">${text}</div>`; };
      const busy = (on) => $$('button', root).forEach((b) => (b.disabled = on));
      $$('[data-mode]', root).forEach((b) => (b.onclick = () => { mode = b.dataset.mode; draw(); }));

      $('[data-form]', root).onsubmit = async (e) => {
        e.preventDefault();
        const email = $('#acEmail', root).value;
        const pass = $('#acPass', root).value;
        try {
          if (mode === 'register') {
            const name = $('#acName', root).value.trim();
            if (!name) return show('Escribe tu nombre.');
            if (pass !== $('#acPass2', root).value) return show('Las contraseñas no coinciden.');
            busy(true);
            await cloud.register({ name, course: $('#acCourse', root).value.trim(), email, password: pass });
            O9.ui.toast(`¡Bienvenido, ${esc(name)}! Tu progreso ya se guarda en la nube.`, 'success', '🎉');
          } else {
            busy(true);
            await cloud.login(email, pass);
            O9.ui.toast('¡Hola de nuevo!', 'success', '👋');
          }
          location.hash = '#/';
        } catch (err) {
          busy(false);
          show(esc(cloud.errorText(err)));
        }
      };
      const g = $('[data-google]', root);
      if (g) g.onclick = async () => {
        try { busy(true); await cloud.loginGoogle(); location.hash = '#/'; }
        catch (err) { busy(false); show(esc(cloud.errorText(err))); }
      };
      const f = $('[data-forgot]', root);
      if (f) f.onclick = async () => {
        const email = $('#acEmail', root).value.trim();
        if (!email) return show('Escribe tu correo arriba y vuelve a pulsar "¿Olvidaste tu contraseña?".', 'info');
        try { await cloud.resetPassword(email); show('Te enviamos un correo para crear una nueva contraseña. Revisa también la carpeta de spam.', 'ok'); }
        catch (err) { show(esc(cloud.errorText(err))); }
      };
    };
    draw();
  }

  function renderAccount(root) {
    const cloud = O9.cloud;
    const s = O9.store.get();
    const last = cloud.lastSync();
    root.innerHTML = `<div class="diag-wrap">
      <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Cuenta</span></div>
      <section class="card center" style="padding:28px">
        <div style="font-size:3.5rem">${s.profile.avatar}</div>
        <h1 style="margin-bottom:4px">${esc(s.profile.name || cloud.user.displayName || 'Estudiante')}</h1>
        <p class="muted">${esc(cloud.user.email || '')}${s.profile.course ? ' · ' + esc(s.profile.course) : ''}</p>
        <p>${cloud.error ? `<span class="pill pill-red">⚠️ ${esc(cloud.error)}</span>` : `<span class="pill pill-green">☁️ Progreso guardado en la nube${last ? ' · ' + O9.util.timeAgo(last) : ''}</span>`}</p>
        <div class="row" style="justify-content:center;margin-top:12px">
          <button class="btn btn-light" data-sync>🔄 Guardar ahora</button>
          <a class="btn btn-light" href="#/perfil">✏️ Editar perfil</a>
          <button class="btn btn-danger" data-logout>Cerrar sesión</button>
        </div>
        <p class="muted" style="font-size:.85rem;margin-top:14px">Al cerrar sesión, tu progreso queda guardado en tu cuenta y se borra de este navegador (ideal en los computadores del colegio).</p>
      </section></div>`;
    cloud.isTeacher().then((ok) => {
      if (ok && document.body.contains(root)) {
        const a = document.createElement('a');
        a.className = 'btn btn-gold';
        a.href = '#/docente';
        a.textContent = '👩‍🏫 Panel del docente';
        const row = root.querySelector('.row');
        if (row) row.prepend(a);
      }
    });
    $('[data-sync]', root).onclick = async () => { await cloud.syncNow(); O9.ui.toast(cloud.error ? cloud.error : 'Progreso guardado en la nube', cloud.error ? 'error' : 'success', '☁️'); renderAccount(root); };
    $('[data-logout]', root).onclick = async () => {
      if (!(await O9.ui.confirm('¿Cerrar sesión?', 'Tu progreso queda guardado en tu cuenta.', 'Cerrar sesión', 'btn-purple'))) return;
      await cloud.logout();
      location.hash = '#/cuenta';
    };
  }

  O9.views.account = { render };
})(window.O9);
