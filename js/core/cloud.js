/**
 * NUBE (Firebase): cuentas, roles, grupos y progreso sincronizado.
 *
 * Roles
 *  - Docente: su correo está en la colección "docentes" (se agrega a mano en la
 *    consola). Crea grupos, ve el panel y no necesita grupo.
 *  - Estudiante: cualquier otra cuenta. Debe pertenecer a un grupo, al que entra
 *    con el código que le da su docente.
 *
 * Firestore
 *  - usuarios/{uid}  → resumen (nombre, grupo, XP, nivel, progreso...) + estado completo en "data"
 *  - grupos/{codigo} → { name, teacherUid, teacherName, active, createdAt }
 *  - docentes/{correo}
 *
 * Si no hay configuración (firebase-config.js), todo queda desactivado y la
 * plataforma funciona solo con localStorage. El SDK se carga desde gstatic.com.
 */
(function (O9) {
  'use strict';

  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const cfg = O9.firebaseConfig;
  const opts = O9.cloudOptions || {};
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I para no confundir

  let auth = null, db = null;
  let lastSync = null;
  let pushing = false;
  let pendingGroup = null; // grupo elegido al registrarse (se aplica apenas se crea la cuenta)

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }

  /** Mensajes de error en lenguaje sencillo. */
  const ERRORS = {
    'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Intenta iniciar sesión.',
    'auth/invalid-email': 'El correo no es válido. Revisa que esté bien escrito.',
    'auth/weak-password': 'La contraseña es muy corta: usa al menos 6 caracteres.',
    'auth/missing-password': 'Escribe tu contraseña.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'La contraseña no es correcta.',
    'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
    'auth/invalid-login-credentials': 'El correo o la contraseña no son correctos.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
    'auth/network-request-failed': 'No hay conexión a internet.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes.',
    'auth/unauthorized-domain': 'Este sitio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).',
    'auth/operation-not-allowed': 'Este método de inicio de sesión no está activado en Firebase.',
    'permission-denied': 'Firebase rechazó la operación. Revisa que las reglas de Firestore estén actualizadas.',
    'group/empty': 'Escribe el código de tu grupo. Te lo da tu docente.',
    'group/not-found': 'Ese código de grupo no existe. Revisa que esté bien escrito (6 letras o números).',
    'group/inactive': 'Ese grupo está cerrado y no recibe estudiantes nuevos. Habla con tu docente.'
  };
  const errorText = (e) => ERRORS[e && e.code] || (e && e.message) || 'Ocurrió un error. Intenta de nuevo.';
  const fail = (code) => { const e = new Error(ERRORS[code]); e.code = code; return e; };
  const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  /** Resumen del estudiante que lee el panel del docente. */
  function summary(state) {
    const info = O9.game.levelInfo(state.xp);
    const ov = O9.progress.overall();
    const g = state.group || {};
    return {
      role: cloud.role === 'teacher' ? 'docente' : 'estudiante',
      name: state.profile.name || '',
      course: g.name || state.profile.course || '',
      groupCode: g.code || '',
      groupName: g.name || '',
      email: (cloud.user && cloud.user.email) || '',
      xp: state.xp,
      points: state.points,
      level: info.level.n,
      progress: ov.pct,
      topicsDone: ov.topicsDone,
      challengesDone: ov.challengesDone,
      badges: Object.keys(state.badges).length,
      courseComplete: !!state.courseComplete,
      projectWord: !!(state.projects.word || {}).done,
      projectExcel: !!(state.projects.excel || {}).done,
      diagnostic: state.diagnostic ? state.diagnostic.band : '',
      consent: !!state.consent
    };
  }

  /** Sube el progreso local a Firestore. */
  async function push() {
    if (!cloud.user || !db || pushing) return;
    pushing = true;
    try {
      const state = O9.store.get();
      await db.collection('usuarios').doc(cloud.user.uid).set(Object.assign(summary(state), {
        data: JSON.stringify(state),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }), { merge: true });
      lastSync = Date.now();
      cloud.error = null;
    } catch (e) {
      cloud.error = errorText(e);
      console.warn('No se pudo guardar en la nube:', e);
    } finally {
      pushing = false;
      O9.util.emit('cloud:changed');
    }
  }
  /*
   * Guardado optimizado (para no pasar el límite gratuito de escrituras):
   * - Los cambios normales se agrupan y se suben como máximo una vez por minuto.
   * - Los logros (tema completado, reto, proyecto) se suben a los pocos segundos.
   * - Al cerrar o esconder la pestaña se sube lo pendiente.
   */
  const SYNC_MS = 60000;
  let timer = null;
  let dirty = false;
  function schedulePush(delay) {
    dirty = true;
    if (timer && delay >= SYNC_MS) return;
    clearTimeout(timer);
    timer = setTimeout(() => { timer = null; if (dirty) { dirty = false; push(); } }, delay);
  }
  function flush() {
    if (!dirty || !cloud.user) return;
    clearTimeout(timer); timer = null; dirty = false;
    push();
  }

  /**
   * Al iniciar sesión decide qué progreso conservar:
   * si el local es de otra cuenta se usa el de la nube; si no, el que tenga más XP.
   */
  async function pull(user) {
    const local = O9.store.get();
    let remote = null;
    try {
      const snap = await db.collection('usuarios').doc(user.uid).get();
      if (snap.exists && snap.data().data) remote = JSON.parse(snap.data().data);
    } catch (e) {
      cloud.error = errorText(e);
      console.warn('No se pudo leer la nube:', e);
    }
    const otherOwner = local.ownerUid && local.ownerUid !== user.uid;
    if (remote && (otherOwner || O9.store.isEmpty() || (remote.xp || 0) >= (local.xp || 0))) {
      O9.store.replace(remote);
    } else if (otherOwner) {
      O9.store.reset();
    }
    O9.store.update((s) => {
      s.ownerUid = user.uid;
      if (!s.profile.name && user.displayName) s.profile.name = user.displayName;
      if (pendingGroup) s.group = pendingGroup;
      // el grupo guardado en la nube manda sobre el local
      if (remote && remote.group && !pendingGroup) s.group = remote.group;
      if (remote && remote.consent && !s.consent) s.consent = remote.consent;
    });
    pendingGroup = null;
  }

  /** Revisa si la cuenta es de docente (documento en docentes/{correo}). */
  async function detectRole(user) {
    let teacher = false;
    if (user.email) {
      try {
        const snap = await db.collection('docentes').doc(user.email.toLowerCase()).get();
        teacher = snap.exists;
      } catch (e) { teacher = false; }
    }
    cloud.role = teacher ? 'teacher' : 'student';
    cloud.needsGroup = !teacher && !(O9.store.get().group || {}).code;
    cloud.needsConsent = !teacher && !O9.store.get().consent;
    document.documentElement.classList.toggle('is-teacher', teacher);
    document.documentElement.classList.toggle('is-student', !teacher);
  }

  function randomCode() {
    let c = '';
    const buf = new Uint32Array(6);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    buf.forEach((n) => (c += CODE_CHARS[n % CODE_CHARS.length]));
    return c;
  }

  const cloud = {
    enabled: !!(cfg && cfg.apiKey),
    requireLogin: !!opts.requireLogin,
    google: opts.google !== false,
    user: null,
    role: null,         // 'teacher' | 'student'
    needsGroup: false,  // estudiante con sesión pero sin grupo
    needsConsent: false, // estudiante que aún no acepta el aviso de privacidad
    PRIVACY_VERSION: 1,
    db: () => db,
    ready: false,
    error: null,
    lastSync: () => lastSync,
    errorText,
    normCode,

    /** Carga Firebase y espera a saber si hay una sesión abierta. */
    async init() {
      if (!cloud.enabled) { cloud.ready = true; return; }
      try {
        await loadScript(SDK + 'firebase-app-compat.js');
        await loadScript(SDK + 'firebase-auth-compat.js');
        await loadScript(SDK + 'firebase-firestore-compat.js');
        firebase.initializeApp(cfg);
        auth = firebase.auth();
        auth.languageCode = 'es';
        db = firebase.firestore();
      } catch (e) {
        console.warn(e);
        cloud.enabled = false;
        cloud.error = 'No se pudo conectar con Firebase. Revisa tu conexión a internet y recarga la página.';
        cloud.ready = true;
        return;
      }
      O9.util.on('state:changed', () => { if (cloud.user) schedulePush(SYNC_MS); });
      O9.util.on('progress:milestone', () => { if (cloud.user) schedulePush(3000); });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
      window.addEventListener('pagehide', flush);
      await new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
          const first = !cloud.ready;
          cloud.user = user;
          cloud.role = null;
          cloud.needsGroup = false;
          cloud.needsConsent = false;
          document.documentElement.classList.remove('is-teacher', 'is-student');
          if (user) {
            await pull(user);
            await detectRole(user);
            await push();
          }
          cloud.ready = true;
          O9.util.emit('cloud:changed');
          O9.util.emit('cloud:auth', user);
          if (first) resolve();
        });
      });
    },

    /* ---------- Grupos ---------- */

    /** Busca un grupo por su código (para validar antes de unirse). */
    async findGroup(code) {
      code = normCode(code);
      if (!code) throw fail('group/empty');
      const snap = await db.collection('grupos').doc(code).get();
      if (!snap.exists) throw fail('group/not-found');
      const g = snap.data();
      if (g.active === false) throw fail('group/inactive');
      return { code, name: g.name };
    },

    /** Un estudiante con sesión entra (o se cambia) a un grupo. */
    async joinGroup(code) {
      const g = await cloud.findGroup(code);
      O9.store.update((s) => { s.group = g; });
      cloud.needsGroup = false;
      await push();
      O9.progress.log('👥', `Te uniste al grupo ${g.name}`);
      O9.util.emit('cloud:auth', cloud.user);
      return g;
    },

    /** El estudiante acepta el aviso de privacidad. */
    async acceptConsent() {
      O9.store.update((s) => { s.consent = { version: cloud.PRIVACY_VERSION, date: Date.now() }; });
      cloud.needsConsent = false;
      await push();
    },

    /* ---------- Cuentas ---------- */

    /** Registro de estudiante: el código de grupo es obligatorio y se valida primero. */
    async register({ name, email, password, code }) {
      const g = await cloud.findGroup(code);
      pendingGroup = g;
      O9.store.update((s) => { s.profile.name = name; s.group = g; s.consent = { version: cloud.PRIVACY_VERSION, date: Date.now() }; });
      try {
        const cred = await auth.createUserWithEmailAndPassword(email.trim(), password);
        await cred.user.updateProfile({ displayName: name });
        await push();
        return cred.user;
      } catch (e) {
        pendingGroup = null;
        throw e;
      }
    },
    login: (email, password) => auth.signInWithEmailAndPassword(email.trim(), password),
    loginGoogle: () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()),
    resetPassword: (email) => auth.sendPasswordResetEmail(email.trim()),

    /** Cierra sesión y limpia este navegador (importante en computadores compartidos del colegio). */
    async logout() {
      clearTimeout(timer); timer = null; dirty = false;
      await push();
      await auth.signOut();
      O9.store.reset();
      O9.util.emit('state:replaced');
    },
    syncNow: push,

    /* ---------- Funciones del docente (las reglas de Firestore también las protegen) ---------- */

    isTeacher: async () => cloud.role === 'teacher',

    /** Grupos creados por este docente. */
    async myGroups() {
      const snap = await db.collection('grupos').where('teacherUid', '==', cloud.user.uid).get();
      return snap.docs.map((d) => Object.assign({ code: d.id }, d.data()))
        .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
    },

    /** Crea un grupo con un código único de 6 caracteres. */
    async createGroup(name) {
      name = String(name || '').trim();
      if (!name) throw new Error('Escribe un nombre para el grupo, por ejemplo "9°A 2026".');
      for (let i = 0; i < 6; i++) {
        const code = randomCode();
        const ref = db.collection('grupos').doc(code);
        const exists = (await ref.get()).exists;
        if (exists) continue;
        await ref.set({
          name,
          teacherUid: cloud.user.uid,
          teacherName: cloud.user.displayName || '',
          active: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { code, name, active: true };
      }
      throw new Error('No se pudo generar un código. Intenta de nuevo.');
    },
    setGroupActive: (code, active) => db.collection('grupos').doc(code).update({ active }),
    renameGroup: (code, name) => db.collection('grupos').doc(code).update({ name }),
    deleteGroup: (code) => db.collection('grupos').doc(code).delete(),

    /** Todos los estudiantes (el panel luego filtra por los grupos del docente). */
    async listStudents() {
      const snap = await db.collection('usuarios').get();
      return snap.docs.map((d) => {
        const x = d.data();
        let state = null;
        try { state = x.data ? JSON.parse(x.data) : null; } catch (e) { state = null; }
        return Object.assign({}, x, {
          uid: d.id,
          state,
          updatedAt: x.updatedAt && x.updatedAt.toMillis ? x.updatedAt.toMillis() : null
        });
      }).filter((s) => s.role !== 'docente');
    }
  };

  O9.cloud = cloud;
})(window.O9);
