/**
 * VISTA: CUENTA (#/cuenta  o  #/cuenta/CODIGO)
 *  - Sin sesión: iniciar sesión o crear cuenta de estudiante (con código de grupo obligatorio).
 *  - Estudiante sin grupo (p. ej. entró con Google): escribir el código de su grupo.
 *  - Con sesión: datos de la cuenta, grupo, cambiar de grupo y cerrar sesión.
 * El enlace #/cuenta/CODIGO deja el código del grupo ya escrito (para compartirlo por WhatsApp).
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;
  const codeInput = (id, value) => `<input id="${id}" class="input mono" required maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false"
    placeholder="Ej. K7P2QX" value="${esc(value || '')}" style="text-transform:uppercase;letter-spacing:.2em;font-weight:900;font-size:1.2rem;text-align:center">`;

  const MS_LOGO = '<svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true"><rect width="10" height="10" fill="#f25022"/><rect x="11" width="10" height="10" fill="#7fba00"/><rect y="11" width="10" height="10" fill="#00a4ef"/><rect x="11" y="11" width="10" height="10" fill="#ffb900"/></svg>';
  const consentBox = (id) => `<label class="consent"><input type="checkbox" id="${id}"> <span>He leído el <a href="#/privacidad" target="_blank">aviso de privacidad</a> y cuento con la <b>autorización de mi padre, madre o acudiente</b> para usar la plataforma.</span></label>`;

  function wrap(root, inner) {
    root.innerHTML = `<div class="diag-wrap"><div class="center" style="margin:6px 0 14px">
      <div class="brand-logo" style="width:56px;height:56px;font-size:1.4rem;margin:0 auto 8px;border-radius:16px">9°</div>
      <b style="font-size:1.2rem">Ofimática 9°</b><div class="muted" style="font-size:.9rem">Aprende Word y Excel haciendo, practicando y superando retos.</div></div>${inner}</div>`;
  }

  function render(root, params) {
    const cloud = O9.cloud;
    const urlCode = cloud.normCode ? cloud.normCode(params && params.id) : '';

    if (!cloud.enabled) {
      return wrap(root, `<section class="card center" style="padding:28px">
        <div style="font-size:3.5rem">☁️</div><h1>Cuentas en línea</h1>
        ${cloud.error ? `<div class="feedback bad">${esc(cloud.error)}</div>` : '<p>El registro de estudiantes todavía no está activado en esta plataforma.</p>'}
        <button class="btn" onclick="location.reload()">🔄 Recargar</button></section>`);
    }
    if (!cloud.ready) {
      wrap(root, '<div class="empty"><div class="big">☁️</div><p>Conectando...</p></div>');
      setTimeout(() => O9.router.refresh(), 600);
      return;
    }
    if (cloud.user && (cloud.needsGroup || cloud.needsConsent)) return renderJoin(root, urlCode);
    if (cloud.user) return renderAccount(root, urlCode);
    renderAuth(root, urlCode);
  }

  /* ---------- Iniciar sesión / Crear cuenta ---------- */
  function renderAuth(root, urlCode) {
    const cloud = O9.cloud;
    let mode = urlCode ? 'register' : 'login';
    const draw = () => {
      wrap(root, `<section class="card" style="padding:24px">
          <div class="tabs" style="justify-content:center">
            <button class="tab-btn ${mode === 'login' ? 'on' : ''}" data-mode="login">Iniciar sesión</button>
            <button class="tab-btn ${mode === 'register' ? 'on' : ''}" data-mode="register">Crear cuenta</button>
          </div>
          <div class="center"><h1 style="margin-bottom:4px">${mode === 'login' ? '👋 ¡Hola de nuevo!' : '🎒 Crea tu cuenta'}</h1>
            <p class="muted">${mode === 'login' ? 'Entra para seguir donde ibas.' : 'Necesitas el <b>código de tu grupo</b>. Te lo da tu docente.'}</p></div>
          <form data-form novalidate>
            ${mode === 'register' ? `
              <div class="form-row"><label for="acCode">Código del grupo</label>${codeInput('acCode', urlCode)}</div>
              <div class="form-row"><label for="acName">Nombre completo</label><input id="acName" class="input" required maxlength="40" autocomplete="name" placeholder="Nombres y apellidos"></div>` : ''}
            <div class="form-row"><label for="acEmail">Correo</label><input id="acEmail" class="input" type="email" required autocomplete="email" placeholder="tucorreo@ejemplo.com"></div>
            <div class="form-row"><label for="acPass">Contraseña</label><input id="acPass" class="input" type="password" required minlength="6" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" placeholder="${mode === 'login' ? 'Tu contraseña' : 'Mínimo 6 caracteres'}"></div>
            ${mode === 'register' ? '<div class="form-row"><label for="acPass2">Repite la contraseña</label><input id="acPass2" class="input" type="password" required autocomplete="new-password"></div>' + consentBox('acConsent') : ''}
            <div data-msg></div>
            <button class="btn btn-block btn-lg ${mode === 'login' ? '' : 'btn-green'}" type="submit">${mode === 'login' ? 'Entrar' : 'Crear mi cuenta'}</button>
          </form>
          ${cloud.google || cloud.microsoft ? `<div class="center muted" style="margin:14px 0 10px;font-weight:700">o</div>
            <div class="stack" style="gap:8px">
            ${cloud.microsoft ? `<button class="btn btn-light btn-block" data-microsoft>${MS_LOGO} Continuar con Microsoft</button>` : ''}
            ${cloud.google ? '<button class="btn btn-light btn-block" data-google><b style="color:#4285f4">G</b> Continuar con Google</button>' : ''}
            </div>
            ${mode === 'register' ? `<p class="muted center" style="font-size:.82rem;margin-top:8px">Con ${cloud.microsoft && cloud.google ? 'Microsoft o Google' : cloud.microsoft ? 'Microsoft' : 'Google'} te pediremos el código del grupo después de entrar.</p>` : ''}` : ''}
          ${mode === 'login' ? '<div class="center" style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-forgot>¿Olvidaste tu contraseña?</button></div>' : ''}
        </section>
        <p class="muted center" style="font-size:.85rem;margin-top:14px">👩‍🏫 ¿Eres docente? Entra con <b>Continuar con Google</b> usando el correo registrado como docente.</p>
        <p class="center" style="font-size:.85rem"><a href="#/ayuda">❓ Ayuda</a> · <a href="#/privacidad">🔒 Aviso de privacidad</a></p>`);

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
            const code = $('#acCode', root).value;
            const name = $('#acName', root).value.trim();
            if (!cloud.normCode(code)) return show('Escribe el código de tu grupo. Te lo da tu docente.');
            if (name.split(/\s+/).length < 2) return show('Escribe tu nombre completo (nombres y apellidos): así te reconoce tu docente.');
            if (pass !== $('#acPass2', root).value) return show('Las contraseñas no coinciden.');
            if (!$('#acConsent', root).checked) return show('Para crear tu cuenta debes aceptar el aviso de privacidad y contar con la autorización de tu acudiente.');
            busy(true);
            await cloud.register({ name, email, password: pass, code });
            O9.ui.toast(`¡Bienvenido, ${esc(name.split(' ')[0])}! Ya estás en tu grupo.`, 'success', '🎉');
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
      const ms = $('[data-microsoft]', root);
      if (ms) ms.onclick = async () => {
        try { busy(true); await cloud.loginMicrosoft(); location.hash = '#/'; }
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

  /* ---------- Formulario "entrar a un grupo" ---------- */
  function joinForm(id, value, label) {
    return `<form data-join novalidate>
      <div class="form-row"><label for="${id}">Código del grupo</label>${codeInput(id, value)}</div>
      <div data-jmsg></div>
      <button class="btn btn-green btn-block btn-lg" type="submit">${label}</button></form>`;
  }
  function bindJoin(root, id, after) {
    const form = $('[data-join]', root);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      try {
        const g = await O9.cloud.joinGroup($('#' + id, root).value);
        O9.ui.toast(`Ahora estás en el grupo <b>${esc(g.name)}</b>`, 'success', '👥');
        after();
      } catch (err) {
        btn.disabled = false;
        $('[data-jmsg]', form).innerHTML = `<div class="feedback bad" style="margin:0 0 12px">${esc(O9.cloud.errorText(err))}</div>`;
      }
    };
  }

  function renderJoin(root, urlCode) {
    const cloud = O9.cloud;
    const needG = cloud.needsGroup, needC = cloud.needsConsent;
    wrap(root, `<section class="card" style="padding:24px">
      <div class="center"><div style="font-size:3rem">${needG ? '👥' : '🔒'}</div><h1 style="margin-bottom:4px">${needG ? 'Únete a tu grupo' : 'Un último paso'}</h1>
      <p class="muted">Hola, <b>${esc(O9.store.get().profile.name || cloud.user.displayName || cloud.userEmail(cloud.user))}</b>. ${needG ? 'Para empezar, escribe el código que te dio tu docente.' : 'Antes de continuar, lee y acepta el aviso de privacidad.'}</p></div>
      <form data-join novalidate>
        ${needG ? `<div class="form-row"><label for="jCode">Código del grupo</label>${codeInput('jCode', urlCode)}</div>` : ''}
        ${needC ? consentBox('jConsent') : ''}
        <div data-jmsg></div>
        <button class="btn btn-green btn-block btn-lg" type="submit">${needG ? 'Entrar al grupo' : 'Aceptar y continuar'}</button>
      </form>
      <div class="center" style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-logout>Usar otra cuenta</button></div>
    </section>`);
    const form = $('[data-join]', root);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const msg = (t) => { $('[data-jmsg]', form).innerHTML = `<div class="feedback bad" style="margin:0 0 12px">${t}</div>`; };
      if (needC && !$('#jConsent', root).checked) return msg('Debes aceptar el aviso de privacidad para continuar.');
      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      try {
        if (needG) await cloud.findGroup($('#jCode', root).value); // valida antes de guardar nada
        if (needC) await cloud.acceptConsent();
        if (needG) {
          const g = await cloud.joinGroup($('#jCode', root).value);
          O9.ui.toast(`Ahora estás en el grupo <b>${esc(g.name)}</b>`, 'success', '👥');
        }
        location.hash = '#/';
        O9.router.refresh();
      } catch (err) {
        btn.disabled = false;
        msg(esc(cloud.errorText(err)));
      }
    };
    $('[data-logout]', root).onclick = async () => { await cloud.logout(); O9.router.refresh(); };
  }

  /* ---------- Cuenta con sesión ---------- */
  function renderAccount(root, urlCode) {
    const cloud = O9.cloud;
    const s = O9.store.get();
    const teacher = cloud.role === 'teacher';
    const last = cloud.lastSync();
    wrap(root, `<section class="card center" style="padding:28px">
        <div style="font-size:3.5rem">${s.profile.avatar}</div>
        <h1 style="margin-bottom:4px">${esc(s.profile.name || cloud.user.displayName || 'Estudiante')}</h1>
        <p class="muted">${esc(cloud.userEmail(cloud.user))}</p>
        <p>${teacher ? '<span class="pill pill-gold">👩‍🏫 Cuenta de docente</span>' : `<span class="pill pill-purple">👥 Grupo: ${esc((s.group || {}).name || '—')}</span>`}</p>
        <p>${cloud.error ? `<span class="pill pill-red">⚠️ ${esc(cloud.error)}</span>` : `<span class="pill pill-green">☁️ Progreso guardado en la nube${last ? ' · ' + O9.util.timeAgo(last) : ''}</span>`}</p>
        <div class="row" style="justify-content:center;margin-top:12px">
          ${teacher ? '<a class="btn btn-gold" href="#/docente">👩‍🏫 Panel del docente</a>' : ''}
          <button class="btn btn-light" data-sync>🔄 Guardar ahora</button>
          <a class="btn btn-light" href="#/perfil">✏️ Editar perfil</a>
          <button class="btn btn-danger" data-logout>Cerrar sesión</button>
        </div>
        <p class="muted" style="font-size:.85rem;margin-top:14px">Al cerrar sesión tu progreso queda guardado en tu cuenta y se borra de este navegador.</p>
      </section>
      ${teacher ? '' : `<section class="card section" style="padding:20px">
        <h3>🔁 Cambiar de grupo</h3>
        <p class="muted" style="font-size:.9rem">Solo si tu docente te dio un código nuevo. Tu progreso no se pierde.</p>
        ${joinForm('cCode', urlCode && urlCode !== (s.group || {}).code ? urlCode : '', 'Cambiar de grupo')}
      </section>`}`);
    if (!teacher) bindJoin(root, 'cCode', () => renderAccount(root));
    $('[data-sync]', root).onclick = async () => { await cloud.syncNow(); O9.ui.toast(cloud.error ? cloud.error : 'Progreso guardado en la nube', cloud.error ? 'error' : 'success', '☁️'); renderAccount(root); };
    $('[data-logout]', root).onclick = async () => {
      if (!(await O9.ui.confirm('¿Cerrar sesión?', 'Tu progreso queda guardado en tu cuenta.', 'Cerrar sesión', 'btn-purple'))) return;
      await cloud.logout();
      location.hash = '#/cuenta';
    };
  }

  O9.views.account = { render };
})(window.O9);
